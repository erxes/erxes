import type { MessageKey, Translate } from './translate';

const DEFAULT_LABELS: Record<string, MessageKey> = {
  home: 'nav.home',
  form: 'nav.form',
  forms: 'nav.forms',
  announcement: 'nav.announcement',
  announcements: 'nav.announcements',
  ticket: 'tickets.ticket',
  tickets: 'nav.tickets',
  support: 'footer.support',
  account: 'footer.account',
  'knowledge base': 'kb.title',
  'submit a ticket': 'tickets.submit',
  'track a ticket': 'tickets.track',
  'my tickets': 'tickets.mine',
  'fill in a form': 'forms.fillIn',
  'all categories': 'kb.allCategories',
  search: 'common.search',
  'my account': 'account.mine',
  notifications: 'account.notifications',
  settings: 'account.settings',
  'sign in': 'auth.signIn',
  'sign up': 'auth.signUp',
};

export const savedLabel = (label: string, t: Translate): string => {
  const key = DEFAULT_LABELS[label.trim().toLowerCase()];

  return key ? t(key) : label;
};
