import { ruleSchema } from 'erxes-api-shared/core-modules';
import { channelSchema } from '~/modules/channel/db/definitions/channel';
import { integrationSchema } from '~/modules/inbox/db/definitions/integrations';

export const MODULE_NAMES = {
  CHANNEL: 'channel',
  EMAIL_TEMPLATE: 'emailTemplate',
  RESPONSE_TEMPLATE: 'responseTemplate',
  CONVERSATION: 'conversation',
  CONVERSATION_MESSAGE: 'conversation_message',
  INTEGRATION: 'integration',
  SCRIPT: 'script',
};

export const LOG_MAPPINGS = [
  {
    name: MODULE_NAMES.CHANNEL,
    schemas: [channelSchema],
  },
  {
    name: MODULE_NAMES.RESPONSE_TEMPLATE,
    schemas: [],
  },
  {
    name: MODULE_NAMES.INTEGRATION,
    schemas: [integrationSchema, ruleSchema],
  },
];

export const CONVERSATION_INFO = {
  opened: 'Opened',
  channels: 'Channels',
  brand: 'Brand',
  integration: 'Integration',
  count: 'Conversations',
  ALL: [
    { field: 'opened', label: 'Opened' },
    { field: 'channels', label: 'Channels' },
    { field: 'brand', label: 'Brand' },
    { field: 'integration', label: 'Integration' },
    { field: 'count', label: 'Conversations' },
  ],
};

export const NOTIFICATION_MODULES = [
  {
    name: 'conversations',
    description: 'Conversations',
    icon: 'chat',
    types: [
      {
        name: 'conversationStateChange',
        text: 'State change',
      },
      {
        name: 'conversationAssigneeChange',
        text: 'Assignee change',
      },
      {
        name: 'conversationAddMessage',
        text: 'Add message',
      },
    ],
  },
  {
    name: 'channels',
    description: 'Channels',
    icon: 'laptop',
    types: [
      {
        name: 'channelMembersChange',
        text: 'Members change',
      },
    ],
  },
];

export const VERIFY_EMAIL_TRANSLATIONS = {
  en: 'Click here to verify your email',
  mn: 'Имэйл хаягаа баталгаажуулахын тулд энд дарна уу',
  tr: 'E-postanızı doğrulamak için buraya tıklayın',
  zh: '点击此处验证您的电子邮件',
  es: 'Haga clic aquí para verificar su correo electrónico',
  pt: 'Clique aqui para verificar seu email',
  fr: 'Cliquez ici pour vérifier votre email',
  de: 'Klicken Sie hier, um Ihre E-Mail zu bestätigen',
  it: 'Clicca qui per verificare la tua email',
  ru: 'Нажмите здесь, чтобы подтвердить свой электронный адрес',
  ja: 'ここをクリックしてメールアドレスを確認してください',
  nl: 'Klik hier om uw e-mail te verifiëren',
  ko: '이메일을 확인하려면 여기를 클릭하세요',
  ro: 'Faceți clic aici pentru a vă verifica adresa de email',
  pl: 'Kliknij tutaj, aby zweryfikować swój adres e-mail',
  hu: 'Kattintson ide az e-mail címének ellenőrzéséhez',
  sv: 'Klicka här för att verifiera din e-postadress',
};

export const IMPORT_EXPORT_TYPES = [
  {
    text: 'Conversations',
    contentType: 'conversation',
    icon: 'chat',
  },
];
