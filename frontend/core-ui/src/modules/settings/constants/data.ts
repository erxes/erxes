import {
  SettingsPath,
  SettingsWorkspacePath,
  TSettingPath,
} from '@/types/paths/SettingsPath';
import {
  IconAdjustmentsAlt,
  IconBuilding,
  IconChessKnight,
  IconFile,
  IconHierarchy2,
  IconMail,
  IconNotification,
  IconPassword,
  IconShoppingCart,
  IconTag,
  IconUserCircle,
  IconUsersGroup,
} from '@tabler/icons-react';
import { TFunction } from 'i18next';

export const KEY_LABELS = {
  UPLOAD_FILE_TYPES: 'Upload File Types',
  WIDGETS_UPLOAD_FILE_TYPES: 'Upload File Types of Widget',
  UPLOAD_SERVICE_TYPE: 'Upload Service Type',
  FILE_SYSTEM_PUBLIC: 'Bucket file system type',
  CLOUDFLARE_ACCESS_KEY_ID: 'Cloudflare Access Key id',
  CLOUDFLARE_SECRET_ACCESS_KEY: 'Cloudflare Secret Access Key',
  CLOUDFLARE_BUCKET_NAME: 'Cloudflare R2 Bucket Name',
  CLOUDFLARE_ACCOUNT_ID: 'Cloudflare Account id',
  CLOUDFLARE_API_TOKEN: 'Cloudflare API Token',
  CLOUDFLARE_USE_CDN: 'Use Cloudflare Images and Stream',
  CLOUDFLARE_ACCOUNT_HASH: 'Cloudflare Account Hash',
  AWS_ACCESS_KEY_ID: 'AWS Access Key Id',
  AWS_SECRET_ACCESS_KEY: 'AWS Secret Access Key',
  AWS_BUCKET: 'AWS Bucket',
  AWS_PREFIX: 'AWS Prefix',
  AWS_COMPATIBLE_SERVICE_ENDPOINT: 'AWS Compatible Service Endpoint',
  AWS_FORCE_PATH_STYLE: 'AWS Force Path Style',
  AWS_SES_ACCESS_KEY_ID: 'AWS SES Access Key id',
  AWS_SES_SECRET_ACCESS_KEY: 'AWS SES Secret Access Key',
  AWS_REGION: 'AWS Region',
  AWS_SES_CONFIG_SET: 'AWS SES Config Set',
  COMPANY_EMAIL_FROM: 'From Email',
  DEFAULT_EMAIL_SERVICE: 'Default Email Service',
  MAIL_SERVICE: 'Mail Service Name',
  MAIL_PORT: 'Port',
  MAIL_USER: 'Username',
  MAIL_PASS: 'Password',
  MAIL_HOST: 'Host',
  TWITTER_CONSUMER_KEY: 'Twitter Consumer Key',
  TWITTER_CONSUMER_SECRET: 'Twitter Consumer secret',
  TWITTER_ACCESS_TOKEN: 'Twitter Access Token',
  TWITTER_ACCESS_TOKEN_SECRET: 'Twitter Access Token Secret',
  TWITTER_WEBHOOK_ENV: 'Twitter Webhook Env',
  NYLAS_CLIENT_ID: 'Nylas Client Id',
  NYLAS_CLIENT_SECRET: 'Nylas Client Secret',
  NYLAS_WEBHOOK_CALLBACK_URL: 'Nylas Webhook Callback Url',
  MICROSOFT_CLIENT_ID: 'Microsoft Client Id',
  MICROSOFT_CLIENT_SECRET: 'Microsoft Client Secret',
  ENCRYPTION_KEY: 'Encryption Key',
  ALGORITHM: 'Algorithm',
  USE_NATIVE_GMAIL: 'Use Default Gmail Service',
  GOOGLE_PROJECT_ID: 'Google Project Id',
  GOOGLE_GMAIL_TOPIC: 'Google Gmail Topic',
  GOOGLE_APPLICATION_CREDENTIALS: 'Google Application Credentials',
  GOOGLE_APPLICATION_CREDENTIALS_JSON: 'Google Application Credentials JSON',
  GOOGLE_GMAIL_SUBSCRIPTION_NAME: 'Google Gmail Subscription Name',
  GOOGLE_CLIENT_ID: 'Google Client Id',
  GOOGLE_CLIENT_SECRET: 'Google Client Secret',
  GOOGLE_MAP_API_KEY: 'Google Map Api Key',

  DAILY_API_KEY: 'Daily api key',
  DAILY_END_POINT: 'Daily end point',
  VIDEO_CALL_TIME_DELAY_BETWEEN_REQUESTS:
    'Time delay (seconds) between requests',
  VIDEO_CALL_MESSAGE_FOR_TIME_DELAY: 'Message for time delay',

  SMOOCH_APP_KEY_ID: 'Smooch App Key Id',
  SMOOCH_APP_KEY_SECRET: 'Smooch App Key Secret',
  SMOOCH_APP_ID: 'Smooch App Id',
  SMOOCH_WEBHOOK_CALLBACK_URL: 'Smooch Webhook Callback Url',

  CHAT_API_UID: 'Chat-API API key',
  CHAT_API_WEBHOOK_CALLBACK_URL: 'Chat-API Webhook Callback Url',

  TELNYX_API_KEY: 'Telnyx API key',
  TELNYX_PHONE: 'Telnyx phone number',
  TELNYX_PROFILE_ID: 'Telnyx messaging profile id',

  sex_choices: 'Pronoun choices',
  company_industry_types: 'Company industry types',
  social_links: 'Social links',

  THEME_LOGO: 'Logo',
  THEME_MOTTO: 'Motto',
  THEME_LOGIN_PAGE_DESCRIPTION: 'Login page description',
  THEME_FAVICON: 'Favicon',
  THEME_TEXT_COLOR: 'Text color',
  THEME_BACKGROUND: 'Background',

  NOTIFICATION_DATA_RETENTION: 'Notification data retention',
  LOG_DATA_RETENTION: 'Log data retention',

  MESSAGE_PRO_API_KEY: 'MessagePro api key',
  MESSAGE_PRO_PHONE_NUMBER: 'MessagePro phone number',
};

export const SETTINGS_PATH_DATA = (
  t: TFunction = ((key: string) => key) as TFunction,
): { [key: string]: TSettingPath[] } => ({
  account: [
    {
      name: t('profile'),
      icon: IconUserCircle,
      path: SettingsPath.Profile,
    },
    {
      name: t('notification'),
      icon: IconNotification,
      path: SettingsPath.Notification,
    },
    {
      name: t('change-password'),
      icon: IconPassword,
      path: SettingsPath.ChangePassword,
    },
  ],
  nav: [
    {
      name: t('general'),
      icon: IconAdjustmentsAlt,
      path: SettingsWorkspacePath.General,
    },
    {
      name: t('team-member'),
      icon: IconUsersGroup,
      path: SettingsWorkspacePath.TeamMember,
    },
    // {
    //   name: t('structure'),
    //   icon: IconHierarchy,
    //   path: SettingsWorkspacePath.Structure,
    // },
    {
      name: t('tags'),
      icon: IconTag,
      path: SettingsWorkspacePath.Tags,
    },
    {
      name: t('brands'),
      icon: IconChessKnight,
      path: SettingsWorkspacePath.Brands,
    },
    {
      name: 'Properties',
      icon: IconHierarchy2,
      path: SettingsWorkspacePath.Properties,
    },
    {
      name: 'Products',
      icon: IconShoppingCart,
      path: SettingsWorkspacePath.Products,
    },
  ],
  developer: [
    {
      name: 'Client portal',
      icon: IconBuilding,
      path: SettingsWorkspacePath.ClientPortals,
    },
    {
      name: 'System Logs',
      icon: IconFile,
      path: SettingsWorkspacePath.Logs,
    },
  ],
});

export const GET_SETTINGS_PATH_DATA = (version?: boolean, t?: TFunction) => {
  const settingsData = SETTINGS_PATH_DATA(t);
  const account = [...settingsData.account];
  const nav = [...settingsData.nav];
  const developer = [...settingsData.developer];

  if (version) {
    nav.push(
      {
        name: 'File upload',
        icon: IconFile,
        path: SettingsWorkspacePath.FileUpload,
      },
      {
        name: 'Mail config',
        icon: IconMail,
        path: SettingsWorkspacePath.MailConfig,
      },
    );
  }

  return {
    account,
    nav,
    developer,
  };
};
