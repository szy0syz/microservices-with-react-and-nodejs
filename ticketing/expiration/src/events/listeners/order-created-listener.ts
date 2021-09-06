import { Listener, OrderCreatedEvent, Subjects } from '@js-ticketing/common';
import { Message } from 'node-nats-streaming';
import { queueGroupname } from './queue-group-name';

export class ORderCreatedListener extends Listener<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
  queueGroupName = queueGroupname;

  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {}
}
