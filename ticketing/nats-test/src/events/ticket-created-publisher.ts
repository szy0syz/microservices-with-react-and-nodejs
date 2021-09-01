import { Subjects } from './subjects';
import { TicketCreatedEvent } from './ticket-created-event';
import { Publisher } from "./base-publisher";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
}
