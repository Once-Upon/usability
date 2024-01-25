import Web3 from 'web3';
import _fetch from 'isomorphic-fetch';

import { AsyncUtils, StdObj } from '../types';

function checkForRateLimitError(resp: StdObj) {
  if (JSON.stringify(resp)?.toLowerCase().includes('rate limit')) {
    return true;
  }
  return false;
}

export async function wrapHttpReqInCache(
  getMongoCache: AsyncUtils['getMongoCache'],
  url: string,
  opts?: { data?: StdObj; headers?: Record<string, string> }
): Promise<StdObj> {
  const cache = await getMongoCache();
  let resp: StdObj;

  const reqHash = Web3.utils.sha3(`${url}-${JSON.stringify(opts?.data)}`);
  const existing = await cache.collection('cache').findOne({ reqHash });
  if (existing) {
    resp = JSON.parse(existing.response as string) as StdObj;
    if (!checkForRateLimitError(resp)) {
      return resp;
    }
  }

  try {
    let resp: StdObj;
    if (opts?.data) {
      resp = (await _fetch(url, {
        method: 'POST',
        body: JSON.stringify(opts.data),
        headers: { 'content-type': 'application/json', ...opts.headers },
      }).then((r) => r.json())) as StdObj;
    } else {
      resp = (await _fetch(url, { headers: { ...opts?.headers } }).then((r) => r.json())) as StdObj;
    }

    await cache
      .collection('cache')
      .updateOne({ reqHash }, { $set: { response: JSON.stringify(resp) } }, { upsert: true });
  } catch (e) {
    if (['invalid argument'].find((msg) => (e as Error).message.includes(msg))) {
      return null;
    }
    throw e;
  }

  if (checkForRateLimitError(resp)) {
    throw new Error('Hit rate limit for URI');
  }

  return resp;
}
