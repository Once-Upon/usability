import { isRawTransaction, type TxnTransformer } from '../../helpers/utils';

export const transform: TxnTransformer = (_block, tx) => {
  if (!isRawTransaction(tx)) return tx;

  const errors: string[] = [];

  for (const trace of tx.traces) {
    if (trace.error) {
      errors.push(trace.error);
    }
  }

  tx.errors = errors;

  return tx;
};
