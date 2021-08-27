import express, { Request, Response } from 'express';
import { NotFoundError } from '@js-ticketing/common';
import { Ticket } from '../models/ticket';

const router = express.Router();

router.get('/api/tickets/:id', async (req: Request, res: Response) => {
  try {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      throw new NotFoundError();
    }

    res.send(ticket);
  } catch (error) {
    throw new NotFoundError();
  }
});

export { router as showTicketRouter };
