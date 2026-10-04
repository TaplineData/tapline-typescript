# GoPlus Security with the Tapline TypeScript SDK

Token security checks from GoPlus Security for one EVM token or one Solana mint. These routes answer only admin API keys; any other key gets `403 forbidden`.

[Package guide](../../../README.md)

## What you can do

| Method | Parameter type and key fields | Returns |
| --- | --- | --- |
| `getEvmTokenSecurity` | `GetEvmTokenSecurityParams`: `chain_id` (`'1'` Ethereum, `'56'` BNB Chain, `'8453'` Base, `'4663'` Robinhood Chain), `address` | `GetEvmTokenSecurityResponse`: honeypot, tax, owner, mint and proxy flags, top holders, LP holders, DEX pools |
| `getSolanaTokenSecurity` | `GetSolanaTokenSecurityParams`: `mint` | `GetSolanaTokenSecurityResponse`: mint, freeze, close and metadata authorities, Token-2022 transfer fee and hook, top holders, DEX pools |

```ts
import { TaplineClient } from '@tapline/client';

const tapline = new TaplineClient({ apiKey: process.env.TAPLINE_ADMIN_API_KEY });

const evm = await tapline.goplus.getEvmTokenSecurity({
  chain_id: '56',
  address: '0x9c39e4b2c74bdc4454f6397f0ae3771c0b12ffff',
});
const token = evm.result?.['0x9c39e4b2c74bdc4454f6397f0ae3771c0b12ffff'];
```

## Reading the response

The GoPlus envelope comes back unchanged:

- `code` is `1` for complete data, `2` for partial data (GoPlus suggests retrying in about 15 seconds), and `3` when the address has no contract code.
- `result` is keyed by the lowercased EVM address or the Solana mint.
- Values are strings. `"0"` and `"1"` are flags, and `""` means GoPlus does not know. Do not read `""` as zero.
- GoPlus leaves out fields it has no value for, so every field is optional.

Each call leaves through a fresh proxy IP, and Tapline retries on a new IP when GoPlus rate-limits one. A `RateLimitError` means the last proxy IP was rate-limited too.

Powered by GoPlus Security.
