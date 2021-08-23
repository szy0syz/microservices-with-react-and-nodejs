import express from 'express';

const router = express.Router();

router.get('/api/users/currentuser', (req, res) => {
  const jwt = req.session?.jwt;
  res.send(`Hi ${jwt}!`);
});

export { router as currentUserRouter };
