# GoPlus Security with the Tapline TypeScript SDK

Use the GoPlus client to check a token before you trade or list it: honeypot and tax flags, owner and mint powers, top holders, and liquidity for EVM and Tron tokens and Solana mints.

[Package guide](../../../README.md) · [GoPlus API reference](https://tapline.sh/docs?utm_source=typescript_client&utm_medium=referral&utm_campaign=developer_acquisition&utm_content=goplus_readme#/goplus)

## Get started

[Create a Tapline account](https://tapline.sh/sign-up?utm_source=typescript_client&utm_medium=referral&utm_campaign=developer_acquisition&utm_content=goplus_readme) and create an API key on the [API keys page](https://tapline.sh/dashboard?tab=api-keys&utm_source=typescript_client&utm_medium=referral&utm_campaign=developer_acquisition&utm_content=goplus_readme).

Install the package and save your key in `TAPLINE_API_KEY`:

```sh
npm install @tapline/client
export TAPLINE_API_KEY="your-api-key"
```

```ts
import { TaplineClient } from '@tapline/client';

const tapline = new TaplineClient({
  apiKey: process.env.TAPLINE_API_KEY,
});
```

If you omit `apiKey`, the client reads `TAPLINE_API_KEY` in Node.js. Keep the key on your server. Do not put it in browser code.

## What you can do

Each call costs 3 credits.

| Method | Parameter type and key fields | Returns |
| --- | --- | --- |
| `getEvmTokenSecurity` | `GetEvmTokenSecurityParams`: `chain_id` (`'1'` Ethereum, `'56'` BNB Chain, `'137'` Polygon, `'8453'` Base, `'42161'` Arbitrum, and 38 more in `GoplusChainId`), `address` | `GetEvmTokenSecurityResponse`: honeypot, tax, owner, mint and proxy flags, top holders, LP holders, DEX pools, CEX listings |
| `getSolanaTokenSecurity` | `GetSolanaTokenSecurityParams`: `mint` | `GetSolanaTokenSecurityResponse`: mint, freeze, close and metadata authorities, Token-2022 transfer fee and hook, top holders, DEX pools |
| `getTronTokenSecurity` | `GetTronTokenSecurityParams`: `address` (base58, starts with `T`) | `GetTronTokenSecurityResponse`: honeypot, tax, owner and mint flags, blacklist, top holders, CEX listings |

## Check an EVM token

```ts
import { TaplineClient } from '@tapline/client';

const tapline = new TaplineClient();
const address = '0x6982508145454ce325ddbe47a25d4ec3d2311933';
const security = await tapline.goplus.getEvmTokenSecurity({ chain_id: '1', address });
const token = security.result?.[address];

if (token === undefined) {
  console.log('GoPlus has no token at this address on this chain');
} else {
  console.log(token.token_symbol, token.is_honeypot, token.buy_tax, token.sell_tax);
}
```

`chain_id` takes any of the 43 EVM chains GoPlus supports. Its type, `GoplusChainId`, lists them all, so TypeScript rejects a chain id GoPlus does not support.

## Check a Solana mint

```ts
import { TaplineClient } from '@tapline/client';

const tapline = new TaplineClient();
const mint = '66UokDvAUWuT8DiX1JxAyisx3uo4nErZYQocXTowQm2G';
const security = await tapline.goplus.getSolanaTokenSecurity({ mint });
const token = security.result?.[mint];

if (token === undefined) {
  console.log('GoPlus has no data for this mint');
} else {
  console.log(token.metadata?.symbol, token.mintable?.status, token.freezable?.status);
}
```

## Check a Tron token

```ts
import { TaplineClient } from '@tapline/client';

const tapline = new TaplineClient();
const address = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t';
const security = await tapline.goplus.getTronTokenSecurity({ address });
const token = security.result?.[address];

if (token === undefined) {
  console.log('GoPlus has no token at this address');
} else {
  console.log(token.token_symbol, token.is_honeypot, token.is_blacklisted, token.trust_list);
}
```

## Read the response

The response is GoPlus's own envelope, returned unchanged:

- `code` is `1` for complete data and `2` for partial data. After a `2`, ask again in about 15 seconds for the rest. Code `3` also passes through as it is.
- `result` is keyed by the lowercased EVM address, by the Solana mint, or by the Tron address in its original case. Look up a Tron token with the exact string you sent, and never lowercase a Tron address.
- `result` is empty when GoPlus has no token at that address on that chain, such as an Ethereum token queried on chain `'56'` or an EVM wallet address. That call still costs 3 credits.
- Security flags are strings. `"1"` means yes, `"0"` means no, and `""` means GoPlus does not know. Do not read `""` as `"0"`.
- A Tron token has the same fields as an EVM token. `trust_list` is `"1"` for a token GoPlus marks as trusted. It appears on Tron tokens and on some EVM tokens.
- `is_contract`, `is_locked`, `malicious_address`, `trusted_token`, and `burn_percent` are numbers. The first four are `0` or `1`.
- GoPlus leaves out fields it has no value for, so every field is optional.

## Handle errors and check costs

Failed calls throw the errors described in the [package guide](../../../README.md#handle-errors). Calls that fail upstream are not charged, including these two:

- An address GoPlus rejects, such as a Solana wallet or another account that is not a token, throws a `TaplineError` with `status` 400 and `code` `'invalid_request'`.
- If GoPlus rate-limits the last proxy attempt, the call throws a `TaplineError` with `status` 429 and `code` `'rate_limited'`. The client retries a 429 on its own before it throws.

The [GoPlus API reference](https://tapline.sh/docs?utm_source=typescript_client&utm_medium=referral&utm_campaign=developer_acquisition&utm_content=goplus_readme#/goplus) lists the inputs, response fields, and credit cost for each method.

Powered by GoPlus Security.
