import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';

import { BaseClient } from '../src/base.js';

interface TestResult {
  name: string;
  status: 'PASS' | 'FAIL';
  detail?: string;
}

const results: TestResult[] = [];

function assert(cond: unknown, msg: string): void {
  if (!cond) throw new Error(`assertion failed: ${msg}`);
}

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

function startServer(body: string): Promise<{ baseUrl: string; stop: () => Promise<void> }> {
  return new Promise((resolve) => {
    const server: Server = createServer((_req, res) => {
      res.statusCode = 200;
      res.setHeader('content-type', 'application/json');
      res.end(body);
    });
    server.listen(0, '127.0.0.1', () => {
      const port = (server.address() as AddressInfo).port;
      resolve({
        baseUrl: `http://127.0.0.1:${port}`,
        stop: () => new Promise((r) => server.close(() => r())),
      });
    });
  });
}

const BIG_ID = '921866071804481858';
const BODY = `{"big": ${BIG_ID}, "small": 2051141, "lat": 51.51296954627982, "none": null}`;

interface Body {
  big: number | string;
  small: number | string;
  lat: number;
  none: null;
}

await check('integers beyond MAX_SAFE_INTEGER arrive as strings', async () => {
  const native = JSON.parse(BODY) as Body;
  assert(String(native.big) !== BIG_ID, 'native JSON.parse should lose precision for this test to mean anything');

  const fake = await startServer(BODY);
  try {
    const client = new BaseClient({ apiKey: 'k', baseUrl: fake.baseUrl });
    const data = await client.get<Body>('/');
    assert(data.big === BIG_ID, `expected "${BIG_ID}", got ${JSON.stringify(data.big)}`);
  } finally {
    await fake.stop();
  }
});

await check('safe integers, floats and null are untouched', async () => {
  const fake = await startServer(BODY);
  try {
    const client = new BaseClient({ apiKey: 'k', baseUrl: fake.baseUrl });
    const data = await client.get<Body>('/');
    assert(data.small === 2051141, `small changed: ${JSON.stringify(data.small)}`);
    assert(data.lat === 51.51296954627982, `lat changed: ${data.lat}`);
    assert(data.none === null, 'null preserved');
  } finally {
    await fake.stop();
  }
});

const failures = results.filter((r) => r.status === 'FAIL');
console.log(`\n${results.length - failures.length}/${results.length} big-int tests passed`);
if (failures.length > 0) process.exit(1);
