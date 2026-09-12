import { createServer, type IncomingMessage, type ServerResponse, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';

import { BaseClient } from '../src/base.js';
import { TaplineError } from '../src/errors.js';

interface Handler {
  (req: IncomingMessage, res: ServerResponse, attempt: number): void;
}

function startServer(handler: Handler): Promise<{ server: Server; baseUrl: string; attempts: () => number }> {
  return new Promise((resolve) => {
    let attempt = 0;
    const server = createServer((req, res) => {
      attempt += 1;
      handler(req, res, attempt);
    });
    server.listen(0, '127.0.0.1', () => {
      const address = server.address() as AddressInfo;
      resolve({
        server,
        baseUrl: `http://127.0.0.1:${address.port}`,
        attempts: () => attempt,
      });
    });
  });
}

function closeServer(server: Server): Promise<void> {
  return new Promise((resolve) => server.close(() => resolve()));
}

interface TestResult {
  name: string;
  status: 'PASS' | 'FAIL';
  detail?: string;
}

const results: TestResult[] = [];
const API_KEY = 'test-key';

async function check(name: string, fn: () => Promise<void>): Promise<void> {
  try {
    await fn();
    results.push({ name, status: 'PASS' });
    console.log(`[PASS] ${name}`);
  } catch (e) {
    const detail = e instanceof Error ? e.message : String(e);
    results.push({ name, status: 'FAIL', detail });
    console.error(`[FAIL] ${name}: ${detail}`);
  }
}

function assert(cond: unknown, msg: string): void {
  if (!cond) throw new Error(`assertion failed: ${msg}`);
}

await check('retries 5xx then succeeds', async () => {
  const { server, baseUrl, attempts } = await startServer((_req, res, attempt) => {
    if (attempt < 3) {
      res.statusCode = 503;
      res.setHeader('content-type', 'application/json');
      res.end(JSON.stringify({ code: 'unavailable', message: 'try later', request_id: 'r' }));
      return;
    }
    res.statusCode = 200;
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify({ ok: true, attempt }));
  });

  try {
    const onRetryCalls: number[] = [];
    const client = new BaseClient({
      apiKey: API_KEY,
      baseUrl,
      retry: { maxRetries: 4, initialDelayMs: 5, maxDelayMs: 20, onRetry: ({ attempt }) => onRetryCalls.push(attempt) },
    });
    const data = await client.get<{ ok: boolean; attempt: number }>('/');
    assert(data.ok === true, 'expected ok=true');
    assert(data.attempt === 3, `expected attempt=3, got ${data.attempt}`);
    assert(attempts() === 3, `server saw 3 attempts, got ${attempts()}`);
    assert(onRetryCalls.length === 2, `expected 2 onRetry calls, got ${onRetryCalls.length}`);
  } finally {
    await closeServer(server);
  }
});

await check('gives up after maxRetries on persistent 5xx', async () => {
  const { server, baseUrl, attempts } = await startServer((_req, res) => {
    res.statusCode = 502;
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify({ code: 'bad_gateway', message: 'down', request_id: 'r' }));
  });

  try {
    const client = new BaseClient({ apiKey: API_KEY, baseUrl, retry: { maxRetries: 2, initialDelayMs: 5, maxDelayMs: 20 } });
    let caught: unknown;
    try {
      await client.get('/');
    } catch (e) {
      caught = e;
    }
    assert(caught instanceof TaplineError, 'expected TaplineError');
    assert((caught as TaplineError).status === 502, `expected status 502, got ${(caught as TaplineError).status}`);
    assert(attempts() === 3, `server should see 1 + 2 retries = 3 attempts, got ${attempts()}`);
  } finally {
    await closeServer(server);
  }
});

await check('does not retry on 4xx', async () => {
  const { server, baseUrl, attempts } = await startServer((_req, res) => {
    res.statusCode = 400;
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify({ code: 'bad_request', message: 'nope', request_id: 'r' }));
  });

  try {
    const client = new BaseClient({ apiKey: API_KEY, baseUrl, retry: { maxRetries: 5, initialDelayMs: 5, maxDelayMs: 20 } });
    let caught: unknown;
    try {
      await client.get('/');
    } catch (e) {
      caught = e;
    }
    assert(caught instanceof TaplineError, 'expected TaplineError');
    assert((caught as TaplineError).status === 400, '4xx surfaced');
    assert((caught as TaplineError).code === 'bad_request', 'error code surfaced');
    assert(attempts() === 1, `expected single attempt, got ${attempts()}`);
  } finally {
    await closeServer(server);
  }
});

await check('sends the API key header and a JSON POST body', async () => {
  let seenKey: string | undefined;
  let seenBody = '';
  const { server, baseUrl } = await startServer((req, res) => {
    seenKey = req.headers['x-api-key'] as string | undefined;
    req.on('data', (chunk) => (seenBody += chunk));
    req.on('end', () => {
      res.statusCode = 200;
      res.setHeader('content-type', 'application/json');
      res.end(JSON.stringify({ echoed: JSON.parse(seenBody) }));
    });
  });

  try {
    const client = new BaseClient({ apiKey: API_KEY, baseUrl });
    const data = await client.post<{ echoed: { a: number } }>('/', { a: 1 });
    assert(seenKey === API_KEY, `expected X-API-Key ${API_KEY}, got ${seenKey}`);
    assert(data.echoed.a === 1, 'body echoed');
  } finally {
    await closeServer(server);
  }
});

await check('repeats list query parameters without brackets', async () => {
  let seenQuery = '';
  const { server, baseUrl } = await startServer((req, res) => {
    seenQuery = req.url?.split('?')[1] ?? '';
    res.statusCode = 200;
    res.setHeader('content-type', 'application/json');
    res.end('{"ok":true}');
  });

  try {
    const client = new BaseClient({ apiKey: API_KEY, baseUrl });
    await client.get('/', { tags: ['a', 'b'], limit: 5 });
    assert(seenQuery === 'tags=a&tags=b&limit=5', `expected tags=a&tags=b&limit=5, got ${seenQuery}`);
  } finally {
    await closeServer(server);
  }
});

await check('honours Retry-After header (seconds)', async () => {
  const { server, baseUrl } = await startServer((_req, res, attempt) => {
    if (attempt === 1) {
      res.statusCode = 429;
      res.setHeader('content-type', 'application/json');
      res.setHeader('retry-after', '1');
      res.end(JSON.stringify({ code: 'rate_limited', message: 'slow', request_id: 'r' }));
      return;
    }
    res.statusCode = 200;
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify({ ok: true }));
  });

  try {
    let observedDelay = 0;
    const client = new BaseClient({
      apiKey: API_KEY,
      baseUrl,
      retry: {
        maxRetries: 2,
        initialDelayMs: 1,
        maxDelayMs: 5000,
        onRetry: ({ delayMs }) => {
          observedDelay = delayMs;
        },
      },
    });
    await client.get('/');
    assert(observedDelay >= 1000, `expected >=1000ms retry delay, got ${observedDelay}`);
  } finally {
    await closeServer(server);
  }
});

const failures = results.filter((r) => r.status === 'FAIL');
console.log(`\n${results.length - failures.length}/${results.length} retry tests passed`);
if (failures.length > 0) process.exit(1);
