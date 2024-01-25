import type { RawBlock, RawTransaction } from '../types';
import { TRANSPARENT_UPGRADEABLE_PROXY_EVENTS } from '../helpers/constants';
import { decodeEVMAddress } from '../helpers/utils';

type ProxyUpgrade = { hash: string; address: string; upgradedAddress: string };

function getProxyUpgrades(tx: RawTransaction): ProxyUpgrade[] {
  const proxyUpgrades: ProxyUpgrade[] = [];
  for (const log of tx.receipt.logs) {
    const [signature] = log.topics;
    // detect upgrade event
    if (signature === TRANSPARENT_UPGRADEABLE_PROXY_EVENTS['Upgraded(address)']) {
      // store proxy upgrades
      const address = log.address.toLowerCase();
      let upgradedAddress = '';
      // check if its beacon proxy
      if (log.data === '0x') {
        upgradedAddress = decodeEVMAddress(log.topics[1]);
      } else {
        upgradedAddress = decodeEVMAddress(log.data);
      }
      proxyUpgrades.push({
        hash: tx.hash,
        address,
        upgradedAddress,
      });
    }
  }

  return proxyUpgrades;
}

export function transform(block: RawBlock): ProxyUpgrade[] {
  let results: ProxyUpgrade[] = [];

  for (const tx of block.transactions) {
    const proxyUpgrades = getProxyUpgrades(tx);
    results = [...results, ...proxyUpgrades];
  }

  return results;
}
