import express, { Request, Response } from 'express';

const router = express.Router();

router.get('/api/orders', async (req: Request, res: Response) => {
  res.send({ orders: [] });
});


export { router as indexOrderRouter };
