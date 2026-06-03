import { initErxesSentry, sentryExpectedErrorFilter } from 'erxes-api-shared/utils';

initErxesSentry(sentryExpectedErrorFilter, 'core-api');
