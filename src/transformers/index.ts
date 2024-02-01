import { makeTransform } from '../helpers/utils';
import * as transactionAssetTransfers from './_common/transactionAssetTransfers';
import * as transactionDelegateCalls from './_common/transactionDelegateCalls';
import * as transactionDerivativesNeighbors from './_common/transactionDerivativesNeighbors';
import * as transactionErrors from './_common/transactionErrors';
import * as transactionNetAssetTransfers from './_common/transactionNetAssetTransfers';
import * as transactionParties from './_common/transactionParties';
import * as transactionSigHash from './_common/transactionSigHash';
import * as transactionTimestamp from './_common/transactionTimestamp';
import * as transactionAssetTransfersOldNFTs from './ethereum/transactionAssetTransfersOldNFTs';
import * as transactionFees from './ethereum/transactionFees';
import * as transactionForks from './ethereum/transactionForks';

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
