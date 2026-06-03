import { initErxesSentry } from 'erxes-api-shared/utils';
import { sentryExpectedErrorFilter } from 'erxes-api-shared/utils';

initErxesSentry(sentryExpectedErrorFilter, 'gateway');
