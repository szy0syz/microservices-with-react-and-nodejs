import { Listener, OrderCreatedEvent, Subjects } from '@js-ticketing/common';
import { Message } from 'node-nats-streaming';
import { queueGroupname } from './queue-group-name';
import { expirationQueue } from '../../queues/expiration-queue';

export class ORderCreatedListener extends Listener<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
  queueGroupName = queueGroupname;

  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    await expirationQueue.add({
      orderId: data.id,
    });

    msg.ack();
  }
}
