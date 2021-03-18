import { Router } from 'express';
import { ChainStateProvider } from '../../providers/chain-state';

const router = Router({ mergeParams: true });

router.get('/', async function (req, res) {
  let { chain, network } = req.params;
  if (!chain || !network) {
    return res.status(400).send('Missing required param');
  }
  
  const info = await ChainStateProvider.getInfo({ chain, network });
  const spork = await ChainStateProvider.getSpork({ chain, network });
  const blockchainInfo = await ChainStateProvider.getBlockchainInfo({ chain, network });
  return res.json({
    info: { ...info, network: info.testnet ? "testnet" : "livenet" },
    spork,
    blockchainInfo: blockchainInfo
  });
});

module.exports = {
  router,
  path: '/firoStatus'
};
