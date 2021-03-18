import { Router } from 'express';
import { CoinStorage } from '../../models/coin';
import { TransactionStorage } from '../../models/transaction';

const router = Router({ mergeParams: true });

router.get('/', async function (req, res) {
  let { chain, network } = req.params;
  if (!chain || !network) {
    return res.status(400).send('Missing required param');
  }

  // get lelantus info
  const splitValues: number[] = [9, 11, 44, 56, 94, 106, 194, 206, 494, 506, 994, 1006, 3994, 6006, 23994];
  const lelantusMint: { [key: string]: { value: number, count: number } } = {};
  const lelantusSplit: { [key: string]: { value: number, count: number } } = {};
  let low: number = 0;
  splitValues.forEach(upper => {
    lelantusMint[low + '_' + upper] = { value: 0, count: 0 };
    lelantusSplit[low + '_' + upper] = { value: 0, count: 0 };
    low = upper;
  });
  let totalMint: number = 0;
  let mintTxCount: number = 0;
  const mintInfo = (await CoinStorage.collection.aggregate<{ _id: number, sum: number, count: number }>([
    { $match: { chain, network, address: 'Lelantusmint', mintHeight: { $gte: 0 } } },
    { $group: { _id: '$mintTxid', val: { $sum: '$value' } } },
    {
      $bucket: {
        groupBy: '$val',
        boundaries: [0, ...splitValues.map(v => v * 100000000)],
        default: -1,
        output: { sum: { $sum: '$val' }, count: { $sum: 1 } }
      }
    }
  ]).toArray());
  mintInfo.forEach(mintInfo => {
    totalMint += mintInfo.sum;
    mintTxCount += mintInfo.count;
    if (mintInfo._id === -1) {
      return;
    }
    const searchValue: number = mintInfo._id / 100000000;
    low = 0;
    splitValues.some(upper => {
      if (low === searchValue) {
        const info = lelantusMint[low + '_' + upper];
        info.value = mintInfo.sum;
        info.count = mintInfo.count;
        return true;
      }
      low = upper;
      return false;
    });
  });
  const splitTxIds: string[] = (await CoinStorage.collection.aggregate<{ _id: string }>([
    { $match: { chain, network, address: 'Lelantusjsplit', spentTxid: { $ne: null } } },
    { $group: { _id: '$spentTxid' } }
  ]).toArray()).map(v => v._id);
  let totalSplit: number = 0;
  for (let i = 0; i < splitTxIds.length; ++i) {
    const foundTransaction = (await TransactionStorage.collection.findOne({ chain, network, txid: splitTxIds[i] }));
    if (foundTransaction) {
      totalSplit += foundTransaction.value;
      const trValue: number = foundTransaction.value / 100000000;
      low = 0;
      splitValues.some(upper => {
        if (trValue >= low && trValue < upper) {
          const info = lelantusSplit[low + '_' + upper];
          info.value += foundTransaction.value;
          ++info.count;
          return true;
        }
        low = upper;
        return false;
      });
    }
  }

  // get sigma breakdown
  const sigmaInfo = (await CoinStorage.collection.aggregate<{ _id: { address: string, value: number }, count: number }>([
    { $match: { chain, network, $or: [{ address: 'Sigmamint' }, { address: 'Sigmaspend' }], mintHeight: { $gte: 0 } } },
    { $group: { _id: { address: '$address', value: '$value' }, count: { $sum: 1 } } }
  ]).toArray());
  const sigmaMint: { [key: number]: number } = {};
  const sigmaSpend: { [key: number]: number } = {};
  sigmaInfo.forEach(info => {
    if (info._id.address === 'Sigmamint') {
      sigmaMint[info._id.value] = info.count;
    } else {
      sigmaSpend[info._id.value] = info.count;
    }
  });
  return res.json({
    totalMint,
    mintTxCount,
    totalSplit,
    splitTxCount: splitTxIds.length,
    sigmaMint,
    sigmaSpend,
    lelantusSplit,
    lelantusMint
  });
});

module.exports = {
  router,
  path: '/lelantusStatus'
};
