import { initErxesSentry } from 'erxes-api-shared/utils';
import { sentryExpectedErrorFilter } from 'erxes-api-shared/utils';

// Ensure to call this before importing any other modules!
initErxesSentry(sentryExpectedErrorFilter);
