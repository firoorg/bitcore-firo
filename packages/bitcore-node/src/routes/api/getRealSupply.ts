import { Router } from 'express';
import { ChainStateProvider } from '../../providers/chain-state';

const router = Router({ mergeParams: true });

router.get('/', async function (req, res) {
    let { chain, network } = req.params;
    if (!chain || !network) {
        return res.status(400).send('Missing required param');
    }
  
    const result = await ChainStateProvider.getTotalSupply({ chain, network });
    return res.json({
        total: result.total / 100000000
    });
});

module.exports = {
  router,
  path: '/getRealSupply'
};
