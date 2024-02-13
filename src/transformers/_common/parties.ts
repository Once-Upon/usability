/* eslint-disable @typescript-eslint/no-unsafe-call */
import { AssetType, type RawBlock } from '../../types';

export function transform(block: RawBlock): RawBlock {
  block.transactions = block.transactions.map((tx) => {
    // from/to addresses
    let parties: string[] = [];
    if (tx.from) {
      parties = [...parties, tx.from.toLowerCase()];
    }
    if (tx.to) {
      parties = [...parties, tx.to.toLowerCase()];
    }
    // address from input data
    const inputAddresses: string[] = tx.decode
      ? tx.decode.fragment.inputs
          .map((param, index) =>
            param.type === 'address' && tx.decode
              ? tx.decode.args[index].toLowerCase()
              : '',
          )
          .filter((address) => address !== '')
      : [];
    // addresses from traces
    const traceParties = tx.traces.map((trace) => {
      let result: string[] = [];
      if (trace.action?.from) {
        result = [...result, trace.action.from.toLowerCase()];
      }
      if (trace.action?.to) {
        result = [...result, trace.action.to.toLowerCase()];
      }
      if (trace.type === 'suicide') {
        result = [...result, trace.action.address.toLowerCase()];
        if (trace.action.refundAddress) {
          result = [...result, trace.action.refundAddress.toLowerCase()];
        }
      }
      // grab event inputs params from decoded trace
      const partiesFromTrace = trace.decode?.fragment.inputs
        .map((param, index) =>
          param.type === 'address' && trace.decode
            ? trace.decode.args[index].toLowerCase()
            : '',
        )
        .filter((address) => address !== '');

      if (partiesFromTrace && partiesFromTrace.length > 0) {
        result = [...result, ...partiesFromTrace];
      }
      return result;
    });
    // addresses from logs
    const logParties = tx.receipt.logs.map((log) => {
      let result = [log.address.toLowerCase()];
      // grab event inputs params from decoded log
      const partiesFromLog = log.decode?.fragment.inputs
        .map((param, index) =>
          param.type === 'address' && log.decode
            ? log.decode.args[index].toLowerCase()
            : '',
        )
        .filter((address) => address !== '');

      if (partiesFromLog && partiesFromLog.length > 0) {
        result = [...result, ...partiesFromLog];
      }
      return result;
    });
    // nfts
    const nfts = tx.receipt.logs
      .filter(
        (log) =>
          (log.decode?.name === 'Transfer' ||
            log.decode?.name === 'Approval') &&
          log.decode?.fragment.inputs[2]?.type === 'uint256',
      )
      .map((log) => `${log.address.toLowerCase()}-${log.decode?.args[2]}`);
    // contracts created
    const contractsCreated = tx.contracts?.map((contract) => contract.address);
    parties = [
      ...parties,
      ...traceParties.flat(),
      ...logParties.flat(),
      ...nfts.flat(),
    ];
    if (inputAddresses && inputAddresses.length > 0) {
      parties = [...parties, ...inputAddresses];
    }
    if (contractsCreated && contractsCreated.length > 0) {
      parties = [...parties, ...contractsCreated];
    }

    tx.parties = [...new Set(parties)].filter((party) => party);
    // remove erc20 addresses
    tx.parties = tx.parties.filter(
      (party) =>
        tx.assetTransfers.find(
          (transfer) =>
            'asset' in transfer &&
            transfer.asset === party &&
            transfer.type === AssetType.ERC20,
        ) === undefined,
    );

    return tx;
  });

  return block;
}
