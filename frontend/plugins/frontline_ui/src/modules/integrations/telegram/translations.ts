import { useTranslation } from 'react-i18next';

const en = {
  reply: 'Reply',
  message: 'Message',
  replyingTo: 'Replying to:',
  albumPart: 'Part of a Telegram album',
  edited: 'Edited',
  pollVoting: 'Vote in Telegram. Results update when Telegram supplies them.',
  observedReactions:
    'Reactions received by this bot; earlier reactions may be unavailable.',
  title: 'Telegram',
  connect: 'Connect Telegram',
  configure: 'Configure Telegram',
  description: 'Connect bot messages from private chats, groups, and channels.',
  bot: 'Saved bot',
  newBot: 'Use a new bot',
  token: 'Bot token',
  replacementToken: 'Replacement token (optional)',
  tokenHint:
    'Get the token from @BotFather. It is stored on the server and never shown again.',
  name: 'Integration name',
  brand: 'Brand',
  chooseBrand: 'Select a brand',
  callback: 'Public Frontline address',
  callbackHint:
    'Paste the public HTTPS address of your Frontline server. For local testing, use your tunnel address.',
  callbackAutomatic: 'erxes adds the webhook path automatically.',
  callbackPreview: 'Webhook URL (generated)',
  callbackPending: 'The bot ID is filled in after your token is verified.',
  callbackInvalid:
    'Enter a valid HTTPS address without a login, query string or fragment.',
  save: 'Save connection',
  cancel: 'Cancel',
  refresh: 'Refresh status',
  disconnect: 'Disconnect',
  disconnectPrompt:
    'Disconnect this bot? Existing conversations remain. Reconnect the webhook to receive messages again.',
  success: 'Telegram connection updated',
  disconnected: 'Telegram disconnected',
  failed: 'Telegram setup failed',
  saved: 'Bot saved. Continue connecting it to an inbox.',
  linked: 'Inbox linked. Register the webhook to finish.',
  loading: 'Loading Telegram bots…',
  loadError: 'Could not load Telegram bots.',
  retry: 'Retry',
  missing: 'No saved bot is linked to this integration.',
  status: 'Webhook status',
  registered: 'Webhook registered',
  unregistered: 'Webhook not registered',
  pending: 'Pending updates',
  lastError: 'Last delivery error',
  oldError:
    'Telegram retains the last error after delivery recovers. Compare its time with your latest test.',
  groups: 'Groups and channels',
  groupHint:
    'Add the bot to your group. To receive ordinary messages, make it an admin or disable Group Privacy in @BotFather and re-add it. What Telegram delivers depends on the bot’s permissions.',
  channelHint:
    'Add the bot as a channel admin with permission to post. Replies from this inbox become new channel posts. Forum topics keep separate conversations.',
  privacyOn: 'Group privacy is enabled',
  privacyOff: 'Bot can read all group messages',
  noGroups: 'This bot cannot join groups; enable it in @BotFather.',
  files:
    'Text, photos, files, audio, video, stickers, contacts, locations, polls, and edits are imported. Other content appears as a notice. Downloads are limited to 20 MB; replies can upload up to 10 files totaling 50 MB.',
  internal: 'Internal notes stay in erxes and are never sent to Telegram.',
  channelUpdates:
    'Some message updates are missing. Save the webhook again to enable edits, polls, channels, and reactions. Reaction updates also require the bot to be an admin.',
  statusFailed: 'Could not read webhook status.',
};
const mn: Record<keyof typeof en, string> = {
  reply: 'Хариулах',
  message: 'Зурвас',
  replyingTo: 'Хариулж буй зурвас:',
  albumPart: 'Telegram цомгийн хэсэг',
  edited: 'Зассан',
  pollVoting:
    'Telegram дээр саналаа өгнө үү. Telegram шинэчлэлт илгээхэд үр дүн шинэчлэгдэнэ.',
  observedReactions:
    'Ботод ирсэн хариу үйлдэл. Өмнөх хариу үйлдлүүд дутуу байж болно.',
  title: 'Telegram',
  connect: 'Telegram холбох',
  configure: 'Telegram тохируулах',
  description: 'Ботын хувийн чат, бүлэг, сувгийн зурвасыг холбоно.',
  bot: 'Хадгалсан бот',
  newBot: 'Шинэ бот ашиглах',
  token: 'Ботын токен',
  replacementToken: 'Шинэ токен (заавал биш)',
  tokenHint:
    '@BotFather-оос токен авна уу. Сервер дээр хадгалж, дахин харуулахгүй.',
  name: 'Интеграцийн нэр',
  brand: 'Брэнд',
  chooseBrand: 'Брэнд сонгох',
  callback: 'Frontline-ийн нийтийн хаяг',
  callbackHint:
    'Frontline серверийн нийтийн HTTPS хаягийг оруулна уу. Локал тестэд туннелийн хаягаа ашиглана.',
  callbackAutomatic: 'erxes webhook-ийн замыг автоматаар нэмнэ.',
  callbackPreview: 'Webhook URL (автомат)',
  callbackPending: 'Токеныг шалгасны дараа ботын ID автоматаар бөглөгдөнө.',
  callbackInvalid:
    'Нэвтрэх мэдээлэл, query эсвэл fragment агуулаагүй зөв HTTPS хаяг оруулна уу.',
  save: 'Холболт хадгалах',
  cancel: 'Цуцлах',
  refresh: 'Төлөв шинэчлэх',
  disconnect: 'Холболт салгах',
  disconnectPrompt:
    'Ботын холболтыг салгах уу? Ярианууд хадгалагдана. Дахин зурвас авахын тулд webhook-ийг холбоно.',
  success: 'Telegram холболт шинэчлэгдлээ',
  disconnected: 'Telegram холболт саллаа',
  failed: 'Telegram тохиргоо амжилтгүй',
  saved: 'Бот хадгалагдлаа. Инбокстой холбож үргэлжлүүлнэ үү.',
  linked: 'Инбокс холбогдлоо. Webhook бүртгэж дуусгана уу.',
  loading: 'Telegram ботуудыг ачаалж байна…',
  loadError: 'Telegram ботуудыг ачаалж чадсангүй.',
  retry: 'Дахин оролдох',
  missing: 'Энэ интеграцтай холбосон бот олдсонгүй.',
  status: 'Webhook төлөв',
  registered: 'Webhook бүртгэгдсэн',
  unregistered: 'Webhook бүртгэгдээгүй',
  pending: 'Хүлээгдэж буй шинэчлэлт',
  lastError: 'Сүүлийн хүргэлтийн алдаа',
  oldError:
    'Хүргэлт сэргэсэн ч Telegram сүүлийн алдааг хадгалдаг. Алдааны цагийг сүүлийн тесттэйгээ харьцуулна уу.',
  groups: 'Бүлэг ба суваг',
  groupHint:
    'Ботыг бүлэгт нэмнэ үү. Энгийн зурвас авахын тулд админ болгох эсвэл @BotFather дээр Group Privacy-г унтраагаад дахин нэмнэ. Ирэх зурвасууд ботын эрхээс хамаарна.',
  channelHint:
    'Ботыг нийтлэх эрхтэй сувгийн админ болгоно уу. Инбоксын хариу нь шинэ сувгийн нийтлэл болно. Форумын сэдэв бүр тусдаа яриатай.',
  privacyOn: 'Бүлгийн нууцлал идэвхтэй',
  privacyOff: 'Бот бүлгийн бүх зурвасыг унших эрхтэй',
  noGroups:
    'Бот бүлэгт нэгдэх боломжгүй байна. @BotFather дээр идэвхжүүлнэ үү.',
  files:
    'Текст, зураг, файл, дуу, видео, стикер, холбоо барих мэдээлэл, байршил, санал асуулга, засварыг оруулна. Бусад агуулгыг мэдэгдлээр харуулна. Татах хэмжээ 20 MB; нэг хариунд нийт 50 MB хүртэлх 10 файл илгээж болно.',
  internal:
    'Дотоод тэмдэглэл зөвхөн erxes-д хадгалагдаж, Telegram руу илгээгдэхгүй.',
  channelUpdates:
    'Зарим шинэчлэлт идэвхгүй. Засвар, санал асуулга, суваг, хариу үйлдлийг авахын тулд webhook-ийг дахин хадгална уу. Хариу үйлдэл авахад бот админ байх шаардлагатай.',
  statusFailed: 'Webhook төлөв авч чадсангүй.',
};

export const useTelegramTranslation = (): {
  t: (key: keyof typeof en) => string;
} => {
  const { i18n } = useTranslation('frontline');
  // Plugin-owned resources keep the integration independently deployable.
  for (const [language, resources] of Object.entries({ en, mn })) {
    if (!i18n.hasResourceBundle(language, 'frontline-telegram')) {
      i18n.addResourceBundle(language, 'frontline-telegram', resources);
    }
  }
  return {
    t: (key) =>
      i18n.t(key, { ns: 'frontline-telegram', defaultValue: en[key] }),
  };
};
