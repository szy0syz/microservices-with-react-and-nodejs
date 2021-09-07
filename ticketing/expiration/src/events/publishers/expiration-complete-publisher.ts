import {
  Subjects,
  Publisher,
  ExpirationCompleteEvent,
} from '@js-ticketing/common';

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  readonly subject = Subjects.ExpirationComplete;
}
