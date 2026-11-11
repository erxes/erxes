import { i18n } from '~/i18n';

/** Strings the new core's onboarding adds; the rest keeps old `common:onboarding.*` keys. */
export const ONBOARDING_NS = 'core-onboarding';

const en = {
  'avatar-url': 'Profile picture link',
  'avatar-url-description': 'Paste a link to a picture to help your team identify you.',
  'invalid-url': 'Enter a full link, e.g. https://…',
  'username-format': 'Use letters, digits, dot, dash and underscore only',
  'invite-sent_one': 'Invited {{count}} team member',
  'invite-sent_other': 'Invited {{count}} team members',
  'invite-failed': 'Could not invite {{emails}}',
};

const mn: typeof en = {
  'avatar-url': 'Профайл зургийн холбоос',
  'avatar-url-description': 'Багийнхан тань таныг таних зургийн холбоосыг оруулна уу.',
  'invalid-url': 'Бүтэн холбоос оруулна уу, жишээ нь https://…',
  'username-format': 'Зөвхөн үсэг, тоо, цэг, зураас, доогуур зураас ашиглана уу',
  'invite-sent_one': '{{count}} гишүүнийг урилаа',
  'invite-sent_other': '{{count}} гишүүнийг урилаа',
  'invite-failed': '{{emails}}-г урьж чадсангүй',
};

i18n.addResourceBundle('en', ONBOARDING_NS, en, true, false);
i18n.addResourceBundle('mn', ONBOARDING_NS, mn, true, false);
