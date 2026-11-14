import { TTemplate } from 'erxes-api-shared/core-modules';
import { birthdayGreetingTemplate } from './birthdayGreeting';
import { leadFollowUpTemplate } from './leadFollowUp';
import { welcomeSeriesTemplate } from './welcomeSeries';
import { winBackTemplate } from './winBack';

/** Templates core declares itself, on its own record types. */
export const CORE_TEMPLATES: TTemplate[] = [
  welcomeSeriesTemplate,
  leadFollowUpTemplate,
  birthdayGreetingTemplate,
  winBackTemplate,
];
