import { Publisher, Subjects, TicketUpdatedEvent } from '@js-ticketing/common';

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
}
