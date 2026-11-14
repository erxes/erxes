import { TTemplate } from 'erxes-api-shared/core-modules';
import { complaintEmployeeTemplate } from './complaintEmployee';
import { slaBreachTemplate } from './slaBreach';
import { ticketResolvedRatingTemplate } from './ticketResolvedRating';
import { urgentTicketTemplate } from './urgentTicket';

/** Solutions and automations frontline offers on the Templates page. */
export const templates: TTemplate[] = [
  complaintEmployeeTemplate,
  ticketResolvedRatingTemplate,
  slaBreachTemplate,
  urgentTicketTemplate,
];
