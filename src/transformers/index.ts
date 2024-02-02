import { makeTransform } from '../helpers/utils';
import * as transactionAssetTransfers from './_common/assetTransfers';
import * as transactionDelegateCalls from './_common/delegateCalls';
import * as transactionDerivativesNeighbors from './_common/derivativesNeighbors';
import * as transactionErrors from './_common/errors';
import * as transactionNetAssetTransfers from './_common/netAssetTransfers';
import * as transactionParties from './_common/parties';
import * as transactionSigHash from './_common/sigHash';
import * as transactionTimestamp from './_common/timestamp';
import * as transactionAssetTransfersOldNFTs from './ethereum/assetTransfersOldNFTs';
import * as transactionFees from './ethereum/fees';
import * as transactionForks from './ethereum/forks';

const children = {
  transactionAssetTransfers,
  transactionDelegateCalls,
  transactionDerivativesNeighbors,
  transactionErrors,
  transactionNetAssetTransfers,
  transactionParties,
  transactionSigHash,
  transactionTimestamp,
  transactionAssetTransfersOldNFTs,
  transactionFees,
  transactionForks,
};

const transformers = Object.fromEntries(
  Object.keys(children).map((key) => [key, children[key].transform]),
);

const transform = makeTransform(transformers);

export const transformer = {
  transform,
  children,
};
