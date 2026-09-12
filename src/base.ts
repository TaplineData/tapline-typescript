import axios, { type AxiosError, type AxiosInstance, type AxiosResponse } from 'axios';
import { parse as parseLossless } from 'lossless-json';
import type { ApiErrorBody, RetryConfig, TaplineClientConfig } from './types.js';
import { MissingApiKeyError, TaplineError } from './errors.js';

export const DEFAULT_BASE_URL = 'https://api.tapline.sh';

function materialiseNumber(value: string): number | string {
  if (value.indexOf('.') !== -1 || value.indexOf('e') !== -1 || value.indexOf('E') !== -1) {
    return Number(value);
  }
  const n = Number(value);
  return Number.isSafeInteger(n) ? n : value;
}

function parseResponseBody(data: unknown): unknown {
  if (typeof data !== 'string' || data.length === 0) return data;
  try {
    return parseLossless(data, undefined, materialiseNumber);
  } catch {
    return data;
  }
}

const DEFAULT_RETRY_STATUS_CODES = [408, 425, 429, 500, 502, 503, 504];
const RETRYABLE_NETWORK_CODES = new Set([
  'ECONNRESET',
  'ETIMEDOUT',
  'ECONNABORTED',
  'ECONNREFUSED',
  'EAI_AGAIN',
  'ENOTFOUND',
  'EPIPE',
]);

interface ResolvedRetryConfig {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
  retryStatusCodes: Set<number>;
  onRetry?: RetryConfig['onRetry'];
}

function resolveRetryConfig(config: RetryConfig | undefined): ResolvedRetryConfig {
  return {
    maxRetries: config?.maxRetries ?? 3,
    initialDelayMs: config?.initialDelayMs ?? 500,
    maxDelayMs: config?.maxDelayMs ?? 8000,
    retryStatusCodes: new Set(config?.retryStatusCodes ?? DEFAULT_RETRY_STATUS_CODES),
    onRetry: config?.onRetry,
  };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function envVar(name: string): string | undefined {
  return typeof process === 'undefined' ? undefined : process.env[name];
}

export class BaseClient {
  private readonly client: AxiosInstance;
  private readonly retry: ResolvedRetryConfig;

  constructor(config: TaplineClientConfig = {}) {
    const apiKey = config.apiKey ?? envVar('TAPLINE_API_KEY');
    if (!apiKey) throw new MissingApiKeyError();
    const baseUrl = config.baseUrl ?? envVar('TAPLINE_BASE_URL') ?? DEFAULT_BASE_URL;

    this.client = axios.create({
      baseURL: baseUrl.replace(/\/+$/, ''),
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
        ...config.headers,
      },
      responseType: 'text',
      transitional: { forcedJSONParsing: false },
      transformResponse: [parseResponseBody],
      paramsSerializer: { indexes: null },
    });
    this.retry = resolveRetryConfig(config.retry);
  }

  async get<T>(path: string, params?: Record<string, unknown>): Promise<T> {
    return this.request<T>(() => this.client.get<T>(path, { params }));
  }

  async post<T>(path: string, body: unknown): Promise<T> {
    return this.request<T>(() => this.client.post<T>(path, body));
  }

  private async request<T>(send: () => Promise<AxiosResponse<T>>): Promise<T> {
    let attempt = 0;
    while (true) {
      try {
        const response = await send();
        return response.data;
      } catch (e) {
        const shouldRetry = attempt < this.retry.maxRetries && this.isRetryable(e);
        if (!shouldRetry) {
          this.handleError(e);
        }
        attempt += 1;
        const delayMs = this.computeDelay(attempt, e);
        this.retry.onRetry?.({
          attempt,
          delayMs,
          status: this.getStatus(e),
          error: e,
        });
        await sleep(delayMs);
      }
    }
  }

  private isRetryable(e: unknown): boolean {
    if (!axios.isAxiosError(e)) return false;
    const err = e as AxiosError;
    if (err.response) {
      return this.retry.retryStatusCodes.has(err.response.status);
    }
    if (err.code && RETRYABLE_NETWORK_CODES.has(err.code)) {
      return true;
    }
    return Boolean(err.request);
  }

  private getStatus(e: unknown): number | undefined {
    return axios.isAxiosError(e) ? e.response?.status : undefined;
  }

  private computeDelay(attempt: number, e: unknown): number {
    const retryAfter = this.parseRetryAfter(e);
    if (retryAfter !== null) return retryAfter;
    const exp = this.retry.initialDelayMs * 2 ** (attempt - 1);
    const jitter = Math.floor(Math.random() * (this.retry.initialDelayMs / 2));
    return Math.min(exp + jitter, this.retry.maxDelayMs);
  }

  private parseRetryAfter(e: unknown): number | null {
    if (!axios.isAxiosError(e) || !e.response) return null;
    const header = e.response.headers?.['retry-after'];
    if (typeof header !== 'string') return null;
    const seconds = Number(header);
    if (Number.isFinite(seconds) && seconds >= 0) return seconds * 1000;
    const date = Date.parse(header);
    if (Number.isFinite(date)) return Math.max(0, date - Date.now());
    return null;
  }

  private handleError(e: unknown): never {
    if (axios.isAxiosError(e) && e.response) {
      const raw = e.response.data;
      const body: ApiErrorBody =
        typeof raw === 'object' && raw !== null && typeof raw.message === 'string'
          ? raw
          : {
              code: 'unknown',
              message: e.message,
              request_id: e.response.headers?.['x-request-id'] ?? 'unknown',
            };
      throw new TaplineError(e.response.status, body);
    }
    throw e;
  }
}
