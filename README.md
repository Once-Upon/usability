# usability

Convenient data about token transfers and involved parties for Ethereum L1 and L2 transactions

### Input
Raw transaction data from an EVM RPC

### Output
Transaction objects with
* a `parties` key containing an array of involved parties (addresses included in input data, logs, etc.) in the transaction.
* an `assetTransfers` key containing an array of objects for all individual ETH, ERC20, ERC721, ERC1155 transfers that took place in that transaction.
* a `netAssetTransfers` key containing an object with rolled up net balance change information for each address involved in the transaction, containing their net gain or loss of ETH, ERC20, ERC721, ERC1155 in that that transaction.

In other words, `assetTransfers` shows everything that happened under the hood in order, and `netAssetTransfers` is a summary of the end result.

### Example

```typescript
const inputTransaction = {
  to: '0xabc...123',
  // ...
};

const outputTransaction = {
  to: '0xabc...123',
  // ...
  parties: [
    "0x662127bf82b794a26b7ddb6b495f6a5a20b81738",
    "0x2d660d49473dbbcaf63929d10d0e3501b4533182",
    "0x8ca5e648c5dfefcdda06d627f4b490b719ccfd98",
    // ...
  ],
  assetTransfers: [
    {
      "asset": "0x2d660d49473dbbcaf63929d10d0e3501b4533182",
      "from": "0x0000000000000000000000000000000000000000",
      "to": "0x662127bf82b794a26b7ddb6b495f6a5a20b81738",
      "tokenId": "610",
      "type": "erc721"
    },
    // ..
  ],
  netAssetTransfers: {
    "0x662127bf82b794a26b7ddb6b495f6a5a20b81738": {
      "received": [
        {
          "asset": "0x2d660d49473dbbcaf63929d10d0e3501b4533182",
          "id": "0x2d660d49473dbbcaf63929d10d0e3501b4533182-610",
          "tokenId": "610",
          "type": "erc721"
        }
      ],
      "sent": [
        {
          "asset": "eth",
          "id": "eth",
          "type": "eth",
          "value": "100777000000000000"
        }
      ]
    },
    // ..
  },
};
```

### Tests

```
npm run test
```

### Contributing

Please open a PR on this repo and request review from [pcowgill](https://github.com/pcowgill) and [jordanmessina](https://github.com/jordanmessina)

### Other resources

For additional decoration of transaction objects with more context, this library can be used in combination with [@once-upon/evm-context](https://github.com/Once-Upon/context).

## License

See the [LICENSE](LICENSE.md) file for license rights and limitations (MIT).
