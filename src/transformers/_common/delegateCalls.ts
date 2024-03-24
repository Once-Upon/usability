import {
  type TxnTransformer,
  isRawTransaction,
} from '../../helpers/utils';

export const transform: TxnTransformer = (_block, tx) => {
  if (!isRawTransaction(tx)) return tx;

  const delegateCalls = tx.traces.filter(
    (t) => t.action.callType === 'delegatecall',
  );
  tx.delegateCalls = delegateCalls;

  return tx;
};
