import { PUT_RESPONSE_CURSOR_SESSION_KEY } from '~/modules/ebarimt/put-response/constants/putResponseCursorSessionKey';
import { BY_DATE_CURSOR_SESSION_KEY } from '~/modules/ebarimt/put-response/put-responses-by-date/constants/ByDateCursorSessionKey';
import { DUPLICATED_CURSOR_SESSION_KEY } from '~/modules/ebarimt/put-response/put-responses-duplicated/constants/DuplicatedCursorSessionKey';

export const PUT_RESPONSE_ROUTES = [
  {
    label: 'put-response',
    value: 'put-response',
    sessionKey: PUT_RESPONSE_CURSOR_SESSION_KEY,
  },
  {
    label: 'by-date',
    value: 'by-date',
    sessionKey: BY_DATE_CURSOR_SESSION_KEY,
  },
  {
    label: 'duplicated',
    value: 'duplicated',
    sessionKey: DUPLICATED_CURSOR_SESSION_KEY,
  },
];
