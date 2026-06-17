import { initErxesSentry } from './sentry-init';
import { sentryExpectedErrorFilter } from './errorClassifier';

// Ensure to call this before importing any other modules!
initErxesSentry(sentryExpectedErrorFilter);
