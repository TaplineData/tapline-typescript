import type { ApiErrorBody } from './types.js';

export class TaplineError extends Error {
  readonly status: number;
  readonly code: string;
  readonly requestId: string;
  readonly domain: string | undefined;
  readonly details: unknown;

  constructor(status: number, body: ApiErrorBody) {
    super(body.message);
    this.name = 'TaplineError';
    this.status = status;
    this.code = body.code;
    this.requestId = body.request_id;
    this.domain = body.domain;
    this.details = body.details;
  }
}

export class MissingApiKeyError extends Error {
  constructor() {
    super('No API key supplied. Pass apiKey when constructing the client, or set TAPLINE_API_KEY.');
    this.name = 'MissingApiKeyError';
  }
}
