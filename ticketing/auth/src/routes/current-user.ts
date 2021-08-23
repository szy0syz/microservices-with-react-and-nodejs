import { requireAuth } from './../middlewares/require-auth';
import { currentUser } from './../middlewares/current-user';
import express from 'express';

const router = express.Router();

router.get('/api/users/currentuser', requireAuth, currentUser, (req, res) => {
  res.send({ currentUser: req.currentUser || null });
});

export { router as currentUserRouter };
