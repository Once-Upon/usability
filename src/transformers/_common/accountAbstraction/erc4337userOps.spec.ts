import { transform as _transform } from './erc4337userOps';
import { loadBlockFixture, makeTransform } from '../../../helpers/utils';
import { ENTRY_POINT } from './constants';

const transform = makeTransform({ test: _transform });

describe('erc4337userOps', () => {
  it('should unpack pseudoTransactions', () => {
    const block = loadBlockFixture('ethereum', 19_298_068);
    const result = transform(block);

    const txn = result.transactions.find(
      (tx) =>
        tx.hash ===
        '0x7a5e7d32380ae2ca3064b7fbc41e0d698cb7826f61a941737902f4a74a979ca7',
    );
    expect(txn).toBeDefined();

    expect(txn?.pseudoTransactions).toBeDefined();
    expect(txn?.pseudoTransactions?.length).toBe(1);

    const pseudoTransaction = txn!.pseudoTransactions![0];

    expect(pseudoTransaction).toMatchObject({
      from: '0x2991c3845396c9f1d262b2ca0674111a59e2c90a',
      to: '0x5d72015cc621025c265fabffc2fa55ac4821d79f',
    });
  });

  it('should set value for eth transfers', () => {
    const block = loadBlockFixture('ethereum', 19_298_068);
    const result = transform(block);

    const txn = result.transactions.find(
      (tx) =>
        tx.hash ===
        '0x7a5e7d32380ae2ca3064b7fbc41e0d698cb7826f61a941737902f4a74a979ca7',
    );

    const pseudoTransaction = txn!.pseudoTransactions![0];
    expect(pseudoTransaction).toMatchObject({
      from: '0x2991c3845396c9f1d262b2ca0674111a59e2c90a',
      to: '0x5d72015cc621025c265fabffc2fa55ac4821d79f',
      input: '0x',
      value: '5000000000000000',
    });
  });

  it('should filter out logs from entry point', () => {
    const block = loadBlockFixture('ethereum', 19_298_068);
    const result = transform(block);

    const txn = result.transactions.find(
      (tx) =>
        tx.hash ===
        '0x7a5e7d32380ae2ca3064b7fbc41e0d698cb7826f61a941737902f4a74a979ca7',
    );

    expect(txn!.receipt).toMatchObject({
      logs: expect.arrayContaining([
        expect.objectContaining({
          address: ENTRY_POINT,
        }),
      ]),
    });

    const pseudoTransaction = txn!.pseudoTransactions![0];
    expect(pseudoTransaction.receipt).toMatchObject({
      logs: expect.not.arrayContaining([
        expect.objectContaining({
          address: ENTRY_POINT,
        }),
      ]),
    });
  });

  // TODO add tests for:
  // - basic unpacking for all supported account types
  //
  // - should filter out logs from other user ops
  // - should filter traces
});
