export const LANGUAGES = [
  { label: 'English', value: 'en' },
  { label: 'Mongolian', value: 'mn' },
  { label: 'French', value: 'fr' },
  { label: 'Deustch', value: 'de' },
  { label: 'Italian', value: 'it' },
  { label: 'Korean', value: 'ko' },
  { label: 'Spanish', value: 'es' },
  { label: 'Portuguese', value: 'pt-br' },
  { label: 'Japanese', value: 'ja' },
  { label: 'Russian', value: 'ru' },
  { label: 'Chinese', value: 'zh-cn' },
  { label: 'Hindi', value: 'hi' },
  { label: 'Vietnam', value: 'vi' },
  { label: 'Indonesian', value: 'yi' },
  { label: 'Republic of Serbia', value: 'en_RS' },
  { label: 'Dutch', value: 'nl' },
  { label: 'Turkish', value: 'tr_TR' },
  { label: 'bengali', value: 'Bg' }
];

export const SERVICE_TYPES = [
  { label: 'Local', value: 'local' },
  { label: 'Amazon Web Service', value: 'AWS' },
  { label: 'Google Cloud Service', value: 'GCS' }
];

export const FILE_SYSTEM_TYPES = [
  { label: 'Public', value: 'true' },
  { label: 'Private', value: 'false' }
];

export const DATA_RETENTION_DURATION = [
  { label: '3 months', value: 3 },
  { label: '4 months', value: 4 },
  { label: '5 months', value: 5 },
  { label: '6 months', value: 6 },
  { label: '9 months', value: 9 },
  { label: '12 months', value: 12 }
];

export const MEASUREMENTS = [
  { label: 'Bag BG', value: 'BG' },
  { label: 'Barrel BA', value: 'BA' },
  { label: 'Bolt BT', value: 'BT' },
  { label: 'Box BOX', value: 'BOX' },
  { label: 'Bunch BH', value: 'BH' },
  { label: 'Bundle BE', value: 'BE' },
  { label: 'Butt BU', value: 'BU' },
  { label: 'Canister CI', value: 'CI' },
  { label: 'Carton CT', value: 'CT' },
  { label: 'Case CS', value: 'CS' },
  { label: 'Centimeter CM', value: 'CM' },
  { label: 'Container CON', value: 'CON' },
  { label: 'Crate CR', value: 'CR' },
  { label: 'Cylinder CY', value: 'CY' },
  { label: 'Dozen DOZ', value: 'DOZ' },
  { label: 'Each/Number EA', value: 'EA' },
  { label: 'Envelope EN', value: 'EN' },
  { label: 'Foot FT', value: 'FT' },
  { label: 'Kilogram KG', value: 'KG' },
  { label: 'Kilograms KGS', value: 'KGS' },
  { label: 'Liter L', value: 'L' },
  { label: 'Man hour H', value: 'H' },
  { label: 'Meter M', value: 'M' },
  { label: 'Package PK', value: 'PK' },
  { label: 'Packet PA', value: 'PA' },
  { label: 'Pair PAR', value: 'PAR' },
  { label: 'Pairs PRS', value: 'PRS' },
  { label: 'Pallet PAL', value: 'PAL' },
  { label: 'Piece PC', value: 'PC' },
  { label: 'Pieces PCS', value: 'PCS' },
  { label: 'Pound LB', value: 'LB' },
  { label: 'Proof Liter PF', value: 'PF' },
  { label: 'Roll ROL', value: 'ROL' },
  { label: 'Set SET', value: 'SET' },
  { label: 'Square Meter SME', value: 'SME' },
  { label: 'Square Yard SYD', value: 'SYD' },
  { label: 'Tube TU', value: 'TU' },
  { label: 'Yard YD', value: 'YD' }
];

export const KEY_LABELS = {
  UPLOAD_FILE_TYPES: 'Upload File Types',
  WIDGETS_UPLOAD_FILE_TYPES: 'Upload File Types of Widget',
  UPLOAD_SERVICE_TYPE: 'Upload Service Type',
  FILE_SYSTEM_PUBLIC: 'Bucket file system type',
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
  FACEBOOK_APP_ID: 'Facebook App Id',
  FACEBOOK_APP_SECRET: 'Facebook App Secret',
  FACEBOOK_VERIFY_TOKEN: 'Facebook Verify Token',
  FACEBOOK_PERMISSIONS: 'Facebook permissions',
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

  NOTIFICATION_DATA_RETENTION: 'Notification data retention'
};

export const FILE_MIME_TYPES = [
  // images
  {
    value: 'image/gif',
    label: 'Graphics Interchange Format',
    extension: '.gif'
  },
  {
    value: 'image/vnd.microsoft.icon',
    label: 'Icon format',
    extension: '.ico'
  },
  {
    value: 'image/tiff',
    label: 'Tagged Image File Format',
    extension: '.tif'
  },
  {
    value: 'image/jpeg',
    label: 'JPEG image',
    extension: '.jpeg'
  },
  {
    value: 'image/bmp',
    label: 'Windows OS/2 Bitmap Graphics',
    extension: '.bmp'
  },
  {
    value: 'image/png',
    label: 'Portable Network Graphics',
    extension: '.png'
  },
  {
    value: 'image/svg+xml',
    label: 'Scalable Vector Graphics',
    extension: '.svg'
  },
  {
    value: 'image/webp',
    label: 'WEBP image',
    extension: '.webp'
  },
  {
    value: 'image/heic',
    label: 'High Efficiency Image Coding',
    extension: '.heic'
  },
  {
    value: 'image/heif',
    label: 'High Efficiency Image Format',
    extension: '.heif'
  },
  // documents
  {
    value: 'text/csv',
    label: 'Comma-separated values',
    extension: '.csv'
  },
  {
    value: 'application/msword',
    label: 'Microsoft Word',
    extension: '.doc'
  },
  {
    value:
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    label: 'Microsoft Word (OpenXML)',
    extension: '.docx'
  },
  {
    value: 'application/vnd.ms-excel',
    label: 'Microsoft Excel',
    extension: '.xls'
  },
  {
    value: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    label: 'Microsoft Excel OpenXML',
    extension: '.xlsx'
  },
  {
    value: 'application/vnd.ms-powerpoint',
    label: 'Microsoft PowerPoint',
    extension: '.ppt'
  },
  {
    value:
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    label: 'Microsoft PowerPoint (OpenXML)',
    extension: '.pptx'
  },
  {
    value: 'application/vnd.oasis.opendocument.presentation',
    label: 'OpenDocument presentation document',
    extension: '.odp'
  },
  {
    value: 'application/vnd.oasis.opendocument.spreadsheet',
    label: 'OpenDocument spreadsheet document',
    extension: '.ods'
  },
  {
    value: 'application/vnd.oasis.opendocument.text',
    label: 'OpenDocument text document',
    extension: '.odt'
  },
  {
    value: 'application/pdf',
    label: 'Adobe Portable Document Format',
    extension: '.pdf'
  },
  {
    value: 'application/rtf',
    label: 'Rich Text Format',
    extension: '.rtf'
  },
  {
    value: 'text/plain',
    label: 'Plain text',
    extension: '.txt'
  },
  // media
  {
    value: 'audio/aac',
    label: 'AAC audio',
    extension: '.aac'
  },
  {
    value: 'audio/mpeg',
    label: 'MP3 audio',
    extension: '.mp3'
  },
  {
    value: 'audio/ogg',
    label: 'OGG audio',
    extension: '.oga'
  },
  {
    value: 'audio/3gpp',
    label: '3GPP audio/video container',
    extension: '.3gpp'
  },
  {
    value: 'audio/3gpp2',
    label: '3GPP audio/video container',
    extension: '.3gpp2'
  },
  {
    value: 'video/mpeg',
    label: 'MPEG video',
    extension: '.mpeg'
  },
  {
    value: 'video/ogg',
    label: 'OGG video',
    extension: '.ogv'
  },
  {
    value: 'video/mp4',
    label: 'MP4 video',
    extension: '.mp4'
  },
  // archives
  {
    value: 'application/vnd.rar',
    label: 'RAR archive',
    extension: '.rar'
  },
  {
    value: 'application/x-tar',
    label: 'Tape archive',
    extension: '.tar'
  },
  {
    value: 'application/x-7z-compressed',
    label: '7-zip archive',
    extension: '.7z'
  },
  {
    value: 'application/gzip',
    label: 'GZip Compressed Archive',
    extension: '.gz'
  }
];
