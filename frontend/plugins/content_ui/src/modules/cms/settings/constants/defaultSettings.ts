import { SettingsFormState } from '../types/settingsTypes';

export const DEFAULT_SETTINGS: SettingsFormState = {
  websiteName: 'My Awesome Site',
  clientPortalKind: 'portal-a',
  shortDescription: 'A brief description of what this site is about...',
  domain: 'example.com',
  publicUrl: 'https://example.com',
  metaTitle: '',
  metaDescription: 'Fallback meta description for pages without one...',
  metaKeywords: ['cms', 'blog', 'content management'],
  indexing: 'index',
  gaTrackingId: 'G-XXXXXXXXXX',
  googleTagManagerId: '',
  customHeadScripts: '<!-- e.g. Facebook Pixel, Hotjar, custom tracking -->',
  postUrlField: 'slug',
  postsPerPage: '10',
  defaultPostStatus: 'draft',
  allowComments: false,
  languages: ['mn', 'en'],
  defaultLanguage: 'mn',
};
