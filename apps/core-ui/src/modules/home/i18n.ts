import { i18n } from '~/i18n';

/**
 * Strings for the home widgets new core adds (old erxes had notifications and
 * favorites there). The rest of home keeps old `common:home.*` keys.
 */
export const HOME_NS = 'core-home';

const en = {
  'group-contacts': 'Contacts',
  'group-reports': 'Reports',
  'view-all': 'View all',
  unnamed: 'Unnamed',
  widgets: {
    'contacts-overview': 'Contacts at a glance',
    'contacts-overview-description': 'How many customers, leads, companies and team members you have.',
    'recent-customers': 'Latest customers',
    'recent-customers-description': 'The customers added most recently.',
    'recent-companies': 'Latest companies',
    'recent-companies-description': 'The companies added most recently.',
    'team-members': 'Your team',
    'team-members-description': 'Everyone in your organization and their role.',
    'lead-summary': 'Lead numbers',
    'lead-summary-description': 'New leads, conversions, conversion rate and time to convert in the last 30 days.',
    'lead-funnel': 'Lead stages',
    'lead-funnel-description': 'Leads in each stage, how many reached it, and how long they stay.',
    'lead-sources': 'Lead sources',
    'lead-sources-description': 'Where the last 30 days’ leads came from and how many became customers.',
    'lead-reasons': 'Why leads were lost',
    'lead-reasons-description': 'The most common reasons leads were disqualified.',
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
  'group-reports': 'Тайлан',
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
    'lead-summary': 'Lead-ийн тоо',
    'lead-summary-description': 'Сүүлийн 30 хоногийн шинэ lead, хөрвөлт, хөрвөлтийн хувь, хугацаа.',
    'lead-funnel': 'Lead-ийн үе шат',
    'lead-funnel-description': 'Үе шат бүрт байгаа lead, хүрсэн тоо, хэр удаж байгаа.',
    'lead-sources': 'Lead-ийн эх сурвалж',
    'lead-sources-description': 'Сүүлийн 30 хоногийн lead хаанаас ирсэн, хэд нь харилцагч болсон.',
    'lead-reasons': 'Lead алдсан шалтгаан',
    'lead-reasons-description': 'Lead-ийг хасах хамгийн түгээмэл шалтгаанууд.',
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
