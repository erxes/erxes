/**
 * What erxes-ui needs from libphonenumber-js. Only `loadPhoneFormatter` imports this module,
 * so the library and the country list (34 kB gzipped) load once a phone shows, not with
 * erxes-ui.
 */
export { AsYouType, parsePhoneNumberFromString } from 'libphonenumber-js';

export { CountryPhoneCodes } from 'erxes-ui/constants/CountryPhoneCodes';
