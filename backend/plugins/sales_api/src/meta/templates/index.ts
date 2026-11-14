import { TTemplate } from 'erxes-api-shared/core-modules';
import { bigDealApprovalTemplate } from './bigDealApproval';
import { dealLostTemplate } from './dealLost';
import { dealRoundRobinTemplate } from './dealRoundRobin';
import { dealWonTemplate } from './dealWon';
import { posReviewTemplate } from './posReview';
import { salesEmployeeTemplate } from './salesEmployee';
import { staleDealTemplate } from './staleDeal';

/** Solutions and automations sales offers on the Templates page. */
export const templates: TTemplate[] = [
  salesEmployeeTemplate,
  dealWonTemplate,
  dealLostTemplate,
  staleDealTemplate,
  dealRoundRobinTemplate,
  bigDealApprovalTemplate,
  posReviewTemplate,
];
