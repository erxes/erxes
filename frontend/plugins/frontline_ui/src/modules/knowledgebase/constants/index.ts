import {
  IconAlarm,
  IconAlertTriangle,
  IconArrowsShuffle,
  IconArticle,
  IconBell,
  IconBinoculars,
  IconBook,
  IconBrain,
  IconBriefcase,
  IconBulb,
  IconCamera,
  IconChartBar,
  IconChartPie,
  IconClipboard,
  IconClipboardCopy,
  IconClock,
  IconCompass,
  IconCreditCard,
  IconDatabase,
  IconDeviceDesktop,
  IconDiamond,
  IconEye,
  IconFlag,
  IconFolder,
  IconGift,
  IconGraph,
  IconHeart,
  IconHome,
  IconHourglass,
  IconInbox,
  IconLanguage,
  IconLock,
  IconMail,
  IconMedal,
  IconMessage,
  IconMessageDots,
  IconMoodSmile,
  IconMoon,
  IconMusic,
  IconNote,
  IconPalette,
  IconPaperclip,
  IconPencil,
  IconPhoneCall,
  IconPigMoney,
  IconPuzzle,
  IconRocket,
  IconScale,
  IconSearch,
  IconSend,
  IconSettings,
  IconShieldLock,
  IconSpeakerphone,
  IconStar,
  IconSunset,
  IconThumbUp,
  IconTicket,
  IconTool,
  IconTools,
  IconTrees,
  IconUmbrella,
  IconUser,
  IconUsers,
  IconVideo,
  IconWorld,
  type Icon,
} from '@tabler/icons-react';

export const KNOWLEDGE_BASE_PATH = '/frontline/knowledgebase';

export const TOPICS_PER_PAGE = 100;
export const CATEGORIES_PER_PAGE = 100;
export const ARTICLES_PER_PAGE = 100;

export const TOPICS_TABLE_ID = 'frontline_kb_topics_record_table';
export const CATEGORIES_TABLE_ID = 'frontline_kb_categories_record_table';
export const ARTICLES_TABLE_ID = 'frontline_kb_articles_record_table';

export const TOPICS_FILTER_ID = 'frontline-kb-topics-filter';
export const CATEGORIES_FILTER_ID = 'frontline-kb-categories-filter';
export const ARTICLES_FILTER_ID = 'frontline-kb-articles-filter';

export const ARTICLE_STATUSES = [
  { value: 'draft', key: 'kb-draft', label: 'Draft' },
  { value: 'publish', key: 'kb-published', label: 'Published' },
  { value: 'archived', key: 'archived', label: 'Archived' },
] as const;

const ICON_ENTRIES: [string, Icon, string?][] = [
  ['alarm', IconAlarm],
  ['briefcase', IconBriefcase],
  ['earthgrid', IconWorld],
  ['compass', IconCompass],
  ['idea', IconBulb],
  ['diamond', IconDiamond],
  ['piggybank', IconPigMoney],
  ['piechart', IconChartPie],
  ['scale', IconScale],
  ['megaphone', IconSpeakerphone],
  ['tools', IconTools],
  ['umbrella', IconUmbrella],
  ['bar-chart', IconChartBar, 'bar chart'],
  ['star', IconStar],
  ['head-1', IconBrain, 'brain'],
  ['settings', IconSettings],
  ['users', IconUsers],
  ['paintpalette', IconPalette, 'paint palette'],
  ['flag', IconFlag],
  ['phone-call', IconPhoneCall, 'phone call'],
  ['home', IconHome],
  ['puzzle', IconPuzzle],
  ['medal', IconMedal],
  ['like', IconThumbUp],
  ['book', IconBook],
  ['clipboard', IconClipboard],
  ['computer', IconDeviceDesktop],
  ['paste', IconClipboardCopy],
  ['folder-1', IconFolder, 'folder'],
  ['sunset', IconSunset],
  ['heart-alt', IconHeart, 'heart'],
  ['music-1', IconMusic, 'music'],
  ['pencil', IconPencil],
  ['database', IconDatabase],
  ['videocamera', IconVideo, 'video'],
  ['clipboard-1', IconNote, 'note'],
  ['camera', IconCamera],
  ['shuffle-1', IconArrowsShuffle, 'shuffle'],
  ['hourglass', IconHourglass],
  ['envelope-alt', IconMail],
  ['graph-bar', IconGraph, 'graph bar'],
  ['comment-alt-message', IconMessageDots, 'comment'],
  ['chat', IconMessage],
  ['smile', IconMoodSmile],
  ['wallclock', IconClock, 'clock'],
  ['trees', IconTrees],
  ['gift', IconGift],
  ['moon-1', IconMoon, 'night'],
  ['rocket', IconRocket],
  ['credit-card', IconCreditCard, 'credit card'],
  ['lock', IconLock],
  ['shield', IconShieldLock],
  ['ticket', IconTicket],
  ['article', IconArticle],
  ['inbox', IconInbox],
  ['search', IconSearch],
  ['bell', IconBell],
  ['eye', IconEye],
  ['alert', IconAlertTriangle],
  ['wrench', IconTool],
  ['binoculars', IconBinoculars],
  ['send', IconSend],
  ['paperclip', IconPaperclip],
  ['user', IconUser],
  ['language', IconLanguage],
];

export const ICONS = ICON_ENTRIES.map(([value, icon, label = value]) => ({
  value,
  label,
  icon,
}));

const REACTION_ICONS: [string, string][] = [
  ['sad', 'Sad'],
  ['neutral', 'Neutral'],
  ['grinning', 'Happy'],
  ['like', 'Like'],
  ['dislike', 'Dislike'],
];

export const REACTIONS = REACTION_ICONS.map(([name, label]) => ({
  value: `https://erxes.s3.amazonaws.com/icons/${name}.svg`,
  label,
}));

const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English',
  mn: 'Mongolian',
  zh: 'Chinese',
  ja: 'Japanese',
  ko: 'Korean',
  ru: 'Russian',
};

export const LANGUAGES = Object.entries(LANGUAGE_NAMES).map(
  ([value, label]) => ({ value, label }),
);
