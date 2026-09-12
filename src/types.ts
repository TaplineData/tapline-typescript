export interface RetryConfig {
  maxRetries?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  retryStatusCodes?: number[];
  onRetry?: (info: { attempt: number; delayMs: number; status?: number; error: unknown }) => void;
}

export interface TaplineClientConfig {
  /** Your API key. Read from `TAPLINE_API_KEY` when omitted. */
  apiKey?: string;
  /** Overrides the API root. Read from `TAPLINE_BASE_URL` when omitted, else `https://api.tapline.sh`. */
  baseUrl?: string;
  headers?: Record<string, string>;
  retry?: RetryConfig;
}

export interface ApiErrorBody {
  code: string;
  message: string;
  request_id: string;
  domain?: string;
  details?: unknown;
}
