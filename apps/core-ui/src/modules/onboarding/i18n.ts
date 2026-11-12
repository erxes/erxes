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
  'example-data': 'Add example data',
  'example-data-description':
    'A few companies, customers and leads with notes to explore. Tagged “Example”, so you can delete them any time.',
  'setup-title': 'Setting up {{name}}…',
  'setup-ready': 'All set!',
  'setup-description': 'This takes a few seconds.',
  'setup-workspace': 'Creating your workspace',
  'setup-settings': 'Setting up lead stages and settings',
  'setup-examples': 'Adding example contacts, notes and an automation',
  'setup-final': 'Putting on the finishing touches',
  'setup-retry': 'Try again',
  'setup-skip': 'Continue — the examples will appear in a moment',
};

const mn: typeof en = {
  'avatar-url': 'Профайл зургийн холбоос',
  'avatar-url-description': 'Багийнхан тань таныг таних зургийн холбоосыг оруулна уу.',
  'invalid-url': 'Бүтэн холбоос оруулна уу, жишээ нь https://…',
  'username-format': 'Зөвхөн үсэг, тоо, цэг, зураас, доогуур зураас ашиглана уу',
  'invite-sent_one': '{{count}} гишүүнийг урилаа',
  'invite-sent_other': '{{count}} гишүүнийг урилаа',
  'invite-failed': '{{emails}}-г урьж чадсангүй',
  'example-data': 'Жишээ өгөгдөл нэмэх',
  'example-data-description':
    'Туршиж үзэх хэдэн байгууллага, харилцагч, тэмдэглэл. «Жишээ» шошготой тул хүссэн үедээ устгаж болно.',
  'setup-title': '{{name}}-г бэлдэж байна…',
  'setup-ready': 'Бэлэн боллоо!',
  'setup-description': 'Хэдхэн секунд болно.',
  'setup-workspace': 'Ажлын орчин үүсгэж байна',
  'setup-settings': 'Үе шат, тохиргоог бэлдэж байна',
  'setup-examples': 'Жишээ харилцагч, тэмдэглэл, автоматжуулалт нэмж байна',
  'setup-final': 'Эцсийн бэлтгэл',
  'setup-retry': 'Дахин оролдох',
  'setup-skip': 'Үргэлжлүүлэх — жишээнүүд удахгүй гарч ирнэ',
};

i18n.addResourceBundle('en', ONBOARDING_NS, en, true, false);

i18n.addResourceBundle('mn', ONBOARDING_NS, mn, true, false);
