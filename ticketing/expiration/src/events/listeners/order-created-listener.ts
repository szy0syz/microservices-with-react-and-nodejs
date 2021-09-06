import { Listener, OrderCreatedEvent, Subjects } from '@js-ticketing/common';
import { Message } from 'node-nats-streaming';
import { queueGroupname } from './queue-group-name';
import { expirationQueue } from '../../queues/expiration-queue';

export class ORderCreatedListener extends Listener<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
  queueGroupName = queueGroupname;

  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    const delay = new Date(data.expiresAt).getTime() - new Date().getTime();
    console.log('Waiting this many milliseconds to process the job:', delay);

    await expirationQueue.add(
      {
        orderId: data.id,
      },
      {
        delay,
      }
    );

    msg.ack();
  }
}
