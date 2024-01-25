import { ethers } from 'ethers';
import type { RawBlock, TransactionContract, PropHouseDao } from '../types';
import {
  PROP_HOUSE_PROXY_CONTRACT,
  PROP_HOUSE_DAO_DEPLOYED_EVENT_HASH,
  PROP_HOUSE_DAO_DEPLOYED_EVENT,
} from '../../helpers/constants';

export function transform(block: RawBlock): TransactionContract[] {
  const result: TransactionContract[] = block.transactions
    .filter((tx) => tx.contracts?.length > 0)
    .map((tx) => {
      const propHouseDaos: PropHouseDao[] = tx.receipt.logs
        .filter(
          (log) =>
            log.topics[0] === PROP_HOUSE_DAO_DEPLOYED_EVENT_HASH &&
            log.address.toLowerCase() === PROP_HOUSE_PROXY_CONTRACT.toLowerCase()
        )
        .map((log) => {
          // decode log
          try {
            const iface = new ethers.Interface([PROP_HOUSE_DAO_DEPLOYED_EVENT]);
            const logDescriptor = iface.parseLog({
              topics: log.topics,
              data: log.data,
            });
            // get governor address from decoded log
            const token = logDescriptor.args[0] as string;
            const metadata = logDescriptor.args[1] as string;
            const auction = logDescriptor.args[2] as string;
            const treasury = logDescriptor.args[3] as string;
            const governor = logDescriptor.args[4] as string;

            return {
              token: token.toLowerCase(),
              metadata: metadata.toLowerCase(),
              auction: auction.toLowerCase(),
              treasury: treasury.toLowerCase(),
              governor: governor.toLowerCase(),
            };
          } catch (e) {
            return null;
          }
        })
        .filter((v) => v);

      const propHouseTokens = propHouseDaos.map((dao) => dao.token);
      const propHouseMetadatas = propHouseDaos.map((dao) => dao.metadata);
      const propHouseAuctions = propHouseDaos.map((dao) => dao.auction);
      const propHouseTreasuries = propHouseDaos.map((dao) => dao.treasury);
      const propHouseGovernors = propHouseDaos.map((dao) => dao.governor);

      // check contracts
      const contracts = tx.contracts.map((contract) => {
        // check if contract is PropHouse token address
        if (propHouseTokens.includes(contract.address)) {
          contract.metadata.isPropHouseToken = true;
        }
        // check if contract is PropHouse metadata address
        if (propHouseMetadatas.includes(contract.address)) {
          contract.metadata.isPropHouseMetadata = true;
        }
        // check if contract is PropHouse auction address
        if (propHouseAuctions.includes(contract.address)) {
          contract.metadata.isPropHouseAuction = true;
        }
        // check if contract is PropHouse treasuries address
        if (propHouseTreasuries.includes(contract.address)) {
          contract.metadata.isPropHouseTreasury = true;
        }
        // check if contract is PropHouse governor address
        if (propHouseGovernors.includes(contract.address)) {
          contract.metadata.isPropHouseGovernor = true;
        }
        return contract;
      });

      return { hash: tx.hash, contracts };
    });

  return result;
}
