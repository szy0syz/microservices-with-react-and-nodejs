import { Listener, OrderCreatedEvent, Subjects } from '@js-ticketing/common';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../models/ticket';
import { queueGroupName } from './queue-group-name';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    // Find the ticket that the order is reserving
    const ticket = await Ticket.findById(data.ticket.id);

    // If no ticket, throw, throw error
    if (!ticket) {
      throw new Error('Ticket not found!');
    }

    // Mark the ticket as being reserved by setting its orderId property

    // Save the ticket

    // ack the message
  }
}
