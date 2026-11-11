import { i18n } from '~/i18n';

/**
 * Strings for the home widgets new core adds (old erxes had notifications and
 * favorites there). The rest of home keeps old `common:home.*` keys.
 */
export const HOME_NS = 'core-home';

const en = {
  'group-contacts': 'Contacts',
  'view-all': 'View all',
  unnamed: 'Unnamed',
  widgets: {
    'contacts-overview': 'Contacts at a glance',
    'contacts-overview-description':
      'How many customers, leads, companies and team members you have.',
    'recent-customers': 'Latest customers',
    'recent-customers-description': 'The customers added most recently.',
    'recent-companies': 'Latest companies',
    'recent-companies-description': 'The companies added most recently.',
    'team-members': 'Your team',
    'team-members-description': 'Everyone in your organization and their role.',
  },
  kpi: {
    customers: 'Customers',
    leads: 'Leads',
    companies: 'Companies',
    'team-members': 'Team members',
  },
  empty: {
    customers: 'No customers yet — add one in Contacts and it will show up here.',
    companies: 'No companies yet — add one in Contacts and it will show up here.',
    team: 'Only you so far. Invite your team from Settings.',
  },
  error: 'This could not be loaded.',
  role: { owner: 'Owner', admin: 'Admin', member: 'Member' },
  status: { invited: 'Invited', disabled: 'Disabled' },
};

const mn: typeof en = {
  'group-contacts': 'Харилцагчид',
  'view-all': 'Бүгдийг харах',
  unnamed: 'Нэргүй',
  widgets: {
    'contacts-overview': 'Харилцагчдын тойм',
    'contacts-overview-description': 'Харилцагч, lead, компани, багийн гишүүдийн тоо.',
    'recent-customers': 'Сүүлд нэмэгдсэн харилцагчид',
    'recent-customers-description': 'Хамгийн сүүлд нэмэгдсэн харилцагчид.',
    'recent-companies': 'Сүүлд нэмэгдсэн компаниуд',
    'recent-companies-description': 'Хамгийн сүүлд нэмэгдсэн компаниуд.',
    'team-members': 'Таны баг',
    'team-members-description': 'Байгууллагын бүх гишүүд, тэдний үүрэг.',
  },
  kpi: {
    customers: 'Харилцагч',
    leads: 'Lead',
    companies: 'Компани',
    'team-members': 'Багийн гишүүд',
  },
  empty: {
    customers: 'Одоогоор харилцагч алга — Харилцагчид хэсэгт нэмбэл энд харагдана.',
    companies: 'Одоогоор компани алга — Харилцагчид хэсэгт нэмбэл энд харагдана.',
    team: 'Одоогоор зөвхөн та байна. Тохиргооноос багаа урина уу.',
  },
  error: 'Ачаалж чадсангүй.',
  role: { owner: 'Эзэмшигч', admin: 'Админ', member: 'Гишүүн' },
  status: { invited: 'Уригдсан', disabled: 'Идэвхгүй' },
};

i18n.addResourceBundle('en', HOME_NS, en, true, false);

i18n.addResourceBundle('mn', HOME_NS, mn, true, false);
