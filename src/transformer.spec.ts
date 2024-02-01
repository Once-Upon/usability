import { loadBlockFixture } from './helpers/utils';
import { KNOWN_ADDRESSES } from './helpers/constants';
import { transform as transactionNetAssetTransferTransform } from './transformers/_common/transactionAssetTransfers';
import { transform as transactionContractsCreatedTransform } from './transformers/_common/transactionContractsCreated';

describe('transformations', () => {
  it('TransactionAssetTransfers', () => {
    const wethBlock = loadBlockFixture('ethereum', 10743414);
    const wethResult = transactionNetAssetTransferTransform(wethBlock);

    // testing direct ETH transfer in tx: https://www.onceupon.gg/finder/0x9e7654743c06585d5754ee9cfd087b50f431484d53a757d57d5b51144e51bc95
    const ethTx = wethResult.find(
      (wr) =>
        wr.hash ===
        '0x9e7654743c06585d5754ee9cfd087b50f431484d53a757d57d5b51144e51bc95',
    );
    if (ethTx) {
      const ethTransfers = ethTx.assetTransfers;
      expect(ethTransfers.length).toBe(1);
      expect(ethTransfers[0].type).toBe('eth');
      if ('value' in ethTransfers[0]) {
        expect(ethTransfers?.[0].value).toBe('3000000000000000000');
      }
    }

    // testing deposit in tx: https://www.onceupon.gg/finder/0x020b4772754a0caf0512c43da6275d6f8c9000f3915850639f799a254d70bccb
    const wethDepositTx = wethResult.find(
      (wr) =>
        wr.hash ===
        '0x020b4772754a0caf0512c43da6275d6f8c9000f3915850639f799a254d70bccb',
    );
    if (wethDepositTx) {
      const wethDepositTransfers = wethDepositTx.assetTransfers.filter(
        (t) => 'asset' in t && t.asset === KNOWN_ADDRESSES.WETH,
      );
      const ethDepositTransfers = wethDepositTx.assetTransfers.filter(
        (t) => t.type === 'eth',
      );
      expect(wethDepositTransfers.length).toBe(2);
      expect(ethDepositTransfers.length).toBe(2);
      expect(
        wethDepositTransfers.map((t) => 'value' in t && t.value),
      ).toStrictEqual(['849340000000000000', '849340000000000000']);
      expect(
        ethDepositTransfers.map((t) => 'value' in t && t.value),
      ).toStrictEqual(['849340000000000000', '939779139036474196']);
      expect(wethDepositTransfers[0].from).toBe(KNOWN_ADDRESSES.NULL);
    }

    // testing withdrawal in tx: https://www.onceupon.gg/finder/0x2496fa85b6046f44b0ae0ee6315db0757cad9f7c0c9fdb17a807169937bc3870
    const wethWithdrawalTx = wethResult.find(
      (wr) =>
        wr.hash ===
        '0x2496fa85b6046f44b0ae0ee6315db0757cad9f7c0c9fdb17a807169937bc3870',
    );
    if (wethWithdrawalTx) {
      const wethWithdrawalTransfers = wethWithdrawalTx.assetTransfers.filter(
        (t) => 'asset' in t && t.asset === KNOWN_ADDRESSES.WETH,
      );
      const ethWithdrawalTransfers = wethWithdrawalTx.assetTransfers.filter(
        (t) => t.type === 'eth',
      );
      expect(wethWithdrawalTransfers.length).toBe(2);
      expect(ethWithdrawalTransfers.length).toBe(2);
      expect(
        wethWithdrawalTransfers
          .concat(ethWithdrawalTransfers)
          .map((t) => 'value' in t && t.value),
      ).toStrictEqual([
        '744938100770972576',
        '744938100770972576',
        '744938100770972576',
        '744938100770972576',
      ]);
      expect(wethWithdrawalTransfers[1].to).toBe(KNOWN_ADDRESSES.NULL);
    }

    // Self destructed contract refunds in tx: https://www.onceupon.gg/finder/0x7899aabe7417de87d1c4c28c320d7c6781021cee2b11bfb81440132d4413ee87
    const refundBlock = loadBlockFixture('ethereum', 15107468);
    const refundResult = transactionNetAssetTransferTransform(refundBlock);
    const refundTx = refundResult.find(
      (rr) =>
        rr.hash ===
        '0x7899aabe7417de87d1c4c28c320d7c6781021cee2b11bfb81440132d4413ee87',
    );
    if (refundTx) {
      const refundTransfers = refundTx.assetTransfers;
      expect(refundTransfers.length).toBe(3);
      expect(refundTransfers.map((t) => 'value' in t && t.value)).toStrictEqual(
        ['1588213925000000000', '1588213925000000000', '1588213925000000000'],
      );
    }

    // Sorted combo transfers
    const sortedComboBlock = loadBlockFixture('ethereum', 16628971);
    const comboTx = transactionNetAssetTransferTransform(sortedComboBlock).find(
      (tx) =>
        tx.hash ===
        '0xd175f7d3e34f46e68a036fcccb8abbd3610095e753bd64f50586e4ec51e94167',
    );
    if (comboTx) {
      const comboTransfers = comboTx.assetTransfers;
      expect(comboTransfers.length).toBe(5);
      expect(comboTransfers.map((t) => t.type)).toStrictEqual([
        'erc20',
        'erc20',
        'erc20',
        'eth',
        'eth',
      ]);
    }
  });

  it('TransactionContractsCreated', () => {
    const block = loadBlockFixture('ethereum', 14918216);
    const result = transactionContractsCreatedTransform(block);

    expect(
      block.transactions.filter((tx) => !!tx.receipt.contractAddress).length,
    ).toBe(1);

    // first check on contracts created
    const contractedCreated = result.map((tx) => tx.contracts).flat();
    expect(contractedCreated.length).toBe(5);
    expect(contractedCreated.every((c) => !!c.address)).toBe(true);
    expect(
      contractedCreated
        .slice(0, 4)
        .every((c) => c.deployer !== c.directDeployer),
    ).toBe(true);
    expect(
      contractedCreated.slice(4).every((c) => c.deployer === c.directDeployer),
    ).toBe(true);
  });
});
