import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

const en = {
  title: 'WhatsApp',
  description: 'Reply to WhatsApp Business messages from the inbox.',
  connect: 'Connect WhatsApp',
  stepConnect: 'Connect with Meta',
  stepConnectDescription:
    "Sign in with Facebook, then choose or create your business portfolio, WhatsApp Business Account and phone number in Meta's window. No Facebook Page is needed.",
  stepSetup: 'Inbox setup',
  stepSetupDescription:
    'Name this inbox and choose the brand its conversations belong to.',
  continueWithMeta: 'Continue with Meta',
  openingMeta: 'Waiting for Meta…',
  verifying: 'Verifying with Meta…',
  loadingSetup: 'Loading WhatsApp setup…',
  setupLoadFailed: 'Could not load WhatsApp setup.',
  notConfigured: 'WhatsApp is not set up yet',
  notConfiguredDescription:
    'An admin must add the Meta App ID, App Secret and Embedded Signup Configuration ID in Settings → Integrations config.',
  openConfig: 'Open integrations config',
  notConfiguredSaas:
    'WhatsApp is not enabled for this workspace yet. Contact erxes support to turn it on.',
  sdkLoadFailed:
    "Could not load Meta's sign-in. Check your connection or content blockers and try again.",
  popupHint: "Allow pop-ups for this site if Meta's window does not open.",
  connectedNumber: 'Connected number',
  changeNumber: 'Use another number',
  name: 'Inbox name',
  brand: 'Brand',
  chooseBrand: 'Select a brand',
  pin: 'Two-step verification PIN',
  pinHint:
    "WhatsApp registers this number with its 6-digit two-step verification PIN. If the number already has a PIN, enter it. If not, choose 6 digits: they become this number's PIN, so keep them somewhere safe.",
  pinRequired: "Enter the number's 6-digit PIN",
  pinInvalid: 'Enter exactly 6 digits',
  nameRequired: 'Enter an inbox name',
  brandRequired: 'Select a brand',
  finish: 'Create inbox',
  cancel: 'Cancel',
  failed: 'WhatsApp setup failed',
  cancelled: "Meta's window was closed before setup finished.",
  noPhone:
    "Meta finished without a phone number. Add and verify a number in Meta's window, then try again.",
  businessAppUnsupported:
    'Numbers that stay on the WhatsApp Business app are not supported yet. Choose a number that is not used in the app.',
  noSessionInfo:
    "Meta didn't send the account details. Add this site's domain to the Meta app's allowed domains, then try again.",
  metaError: 'Meta reported an error',
  connected: 'WhatsApp number verified',
  connectedDescription: 'Finish the inbox setup to start receiving messages.',
  windowHint:
    "You can reply freely within 24 hours of a customer's last message. Outside that window WhatsApp only accepts approved templates.",
  paymentHint:
    'Add a payment method in WhatsApp Manager before your business starts conversations.',
  statusConnected: 'Connected',
  statusPending: 'Registers when you create the inbox',
  configIntro:
    'One Meta app serves every WhatsApp number connected in this workspace.',
  configStep1:
    'In Meta for Developers, add the WhatsApp product and Facebook Login for Business to your app.',
  configStep2:
    'Create a Facebook Login for Business configuration for WhatsApp Embedded Signup and copy its Configuration ID.',
  configStep3:
    "Add this site's domain to Allowed domains for the JavaScript SDK and to Valid OAuth redirect URIs.",
  configStep4:
    'Under Webhooks → WhatsApp Business Account, enter the callback URL and verify token below, then subscribe to messages.',
  appId: 'App ID',
  appSecret: 'App secret',
  appSecretSaved: 'A secret is saved. Leave empty to keep it.',
  configId: 'Embedded Signup configuration ID',
  verifyToken: 'Webhook verify token',
  verifyTokenHint:
    'Leave empty to have erxes generate one on the first connection.',
  webhookUrl: 'Webhook callback URL',
  copy: 'Copy',
  copied: 'Copied to clipboard',
  copyFailed: 'Could not copy',
  save: 'Save',
  saved: 'WhatsApp settings saved',
  saveFailed: 'Could not save WhatsApp settings',
  loadFailed: 'Could not load WhatsApp settings.',
  retry: 'Retry',
  numericId: 'Enter the numeric ID from Meta',
  appSecretRequired: 'Enter the App secret',
  edit: 'Edit',
  repair: 'Repair',
  repaired: 'WhatsApp connection repaired',
  repairFailed: 'WhatsApp repair failed',
  updated: 'Integration updated',
  updateFailed: 'Could not update the integration',
  created: 'WhatsApp integration created',
  windowClosedTitle: 'The 24-hour reply window has closed',
  windowClosedDescription:
    'WhatsApp only delivers free-form replies within 24 hours of the customer’s last message. Ask the customer to write again, or send an approved template from WhatsApp Manager. Internal notes still work.',
  detailLoadFailed: 'Could not load the integration.',
  phoneNumber: 'Phone number',
  businessName: 'Business name',
  connectionMissing: 'No WhatsApp number is linked to this integration.',
  close: 'Close',
  loading: 'Loading…',
};

const mn: Record<keyof typeof en, string> = {
  title: 'WhatsApp',
  description: 'WhatsApp Business-ийн зурвасад инбоксоос хариулна.',
  connect: 'WhatsApp холбох',
  stepConnect: 'Meta-тай холбох',
  stepConnectDescription:
    'Facebook-ээр нэвтэрч, Meta-гийн цонхонд бизнес портфолио, WhatsApp Business Account болон утасны дугаараа сонгох эсвэл үүсгэнэ үү. Facebook Page шаардлагагүй.',
  stepSetup: 'Инбокс тохируулах',
  stepSetupDescription:
    'Инбоксын нэрийг оруулж, ярианууд хамаарах брэндийг сонгоно уу.',
  continueWithMeta: 'Meta-аар үргэлжлүүлэх',
  openingMeta: 'Meta-г хүлээж байна…',
  verifying: 'Meta-аар баталгаажуулж байна…',
  loadingSetup: 'WhatsApp тохиргоог ачаалж байна…',
  setupLoadFailed: 'WhatsApp тохиргоог ачаалж чадсангүй.',
  notConfigured: 'WhatsApp тохируулагдаагүй байна',
  notConfiguredDescription:
    'Админ Тохиргоо → Интеграцын тохиргоо хэсэгт Meta App ID, App Secret болон Embedded Signup Configuration ID-г оруулах шаардлагатай.',
  openConfig: 'Интеграцын тохиргоо нээх',
  notConfiguredSaas:
    'Энэ ажлын орчинд WhatsApp идэвхжээгүй байна. Идэвхжүүлэхийн тулд erxes-ийн дэмжлэгтэй холбогдоно уу.',
  sdkLoadFailed:
    'Meta-гийн нэвтрэлтийг ачаалж чадсангүй. Холболт эсвэл контент блоклогчоо шалгаад дахин оролдоно уу.',
  popupHint:
    'Meta-гийн цонх нээгдэхгүй бол энэ сайтад pop-up цонх зөвшөөрнө үү.',
  connectedNumber: 'Холбогдсон дугаар',
  changeNumber: 'Өөр дугаар ашиглах',
  name: 'Инбоксын нэр',
  brand: 'Брэнд',
  chooseBrand: 'Брэнд сонгох',
  pin: 'Хоёр шатлалт баталгаажуулалтын PIN',
  pinHint:
    'WhatsApp энэ дугаарыг 6 оронтой хоёр шатлалт баталгаажуулалтын PIN-ээр бүртгэнэ. Дугаарт PIN байгаа бол түүнийг оруулна уу. Байхгүй бол 6 оронтой тоо сонгоно уу: энэ нь дугаарын PIN болох тул найдвартай хадгална уу.',
  pinRequired: 'Дугаарын 6 оронтой PIN-г оруулна уу',
  pinInvalid: 'Яг 6 оронтой тоо оруулна уу',
  nameRequired: 'Инбоксын нэр оруулна уу',
  brandRequired: 'Брэнд сонгоно уу',
  finish: 'Инбокс үүсгэх',
  cancel: 'Цуцлах',
  failed: 'WhatsApp тохиргоо амжилтгүй',
  cancelled: 'Тохиргоо дуусахаас өмнө Meta-гийн цонх хаагдлаа.',
  noPhone:
    'Meta утасны дугааргүйгээр дууслаа. Meta-гийн цонхонд дугаар нэмж баталгаажуулаад дахин оролдоно уу.',
  businessAppUnsupported:
    'WhatsApp Business апп дээр үлдэх дугаарыг одоогоор дэмжихгүй. Апп-д ашиглагдаагүй дугаар сонгоно уу.',
  noSessionInfo:
    'Meta бүртгэлийн мэдээллийг илгээсэнгүй. Энэ сайтын домэйныг Meta app-ийн зөвшөөрөгдсөн домэйнд нэмээд дахин оролдоно уу.',
  metaError: 'Meta алдаа мэдээллээ',
  connected: 'WhatsApp дугаар баталгаажлаа',
  connectedDescription:
    'Зурвас хүлээн авч эхлэхийн тулд инбоксын тохиргоог дуусгана уу.',
  windowHint:
    'Хэрэглэгчийн сүүлийн зурвасаас хойш 24 цагийн дотор чөлөөтэй хариулна. Түүнээс хойш WhatsApp зөвхөн батлагдсан загвар зөвшөөрнө.',
  paymentHint:
    'Бизнес талаас яриа эхлүүлэхээс өмнө WhatsApp Manager-т төлбөрийн хэрэгсэл нэмнэ үү.',
  statusConnected: 'Холбогдсон',
  statusPending: 'Инбокс үүсгэх үед бүртгэгдэнэ',
  configIntro:
    'Энэ ажлын орчинд холбогдсон бүх WhatsApp дугаар нэг Meta app ашиглана.',
  configStep1:
    'Meta for Developers дээр app-даа WhatsApp болон Facebook Login for Business бүтээгдэхүүн нэмнэ үү.',
  configStep2:
    'WhatsApp Embedded Signup-д зориулсан Facebook Login for Business тохиргоо үүсгээд Configuration ID-г хуулна уу.',
  configStep3:
    'Энэ сайтын домэйныг JavaScript SDK-ийн Allowed domains болон Valid OAuth redirect URIs-д нэмнэ үү.',
  configStep4:
    'Webhooks → WhatsApp Business Account хэсэгт доорх callback URL, verify token-ийг оруулаад messages-д бүртгүүлнэ үү.',
  appId: 'App ID',
  appSecret: 'App secret',
  appSecretSaved: 'Нууц үг хадгалагдсан. Хэвээр үлдээх бол хоосон орхино уу.',
  configId: 'Embedded Signup configuration ID',
  verifyToken: 'Webhook verify token',
  verifyTokenHint:
    'Хоосон үлдээвэл анхны холболтын үед erxes автоматаар үүсгэнэ.',
  webhookUrl: 'Webhook callback URL',
  copy: 'Хуулах',
  copied: 'Хуулагдлаа',
  copyFailed: 'Хуулж чадсангүй',
  save: 'Хадгалах',
  saved: 'WhatsApp тохиргоо хадгалагдлаа',
  saveFailed: 'WhatsApp тохиргоог хадгалж чадсангүй',
  loadFailed: 'WhatsApp тохиргоог ачаалж чадсангүй.',
  retry: 'Дахин оролдох',
  numericId: 'Meta-гийн тоон ID-г оруулна уу',
  appSecretRequired: 'App secret оруулна уу',
  edit: 'Засах',
  repair: 'Засварлах',
  repaired: 'WhatsApp холболт засварлагдлаа',
  repairFailed: 'WhatsApp засвар амжилтгүй',
  updated: 'Интеграц шинэчлэгдлээ',
  updateFailed: 'Интеграцыг шинэчилж чадсангүй',
  created: 'WhatsApp интеграц үүслээ',
  windowClosedTitle: '24 цагийн хариулах хугацаа дууссан',
  windowClosedDescription:
    'WhatsApp зөвхөн харилцагчийн сүүлийн мессежээс хойш 24 цагийн дотор чөлөөт хариуг хүргэнэ. Харилцагчаас дахин бичихийг хүсэх эсвэл WhatsApp Manager-аас батлагдсан загвар илгээнэ үү. Дотоод тэмдэглэл ажиллана.',
  detailLoadFailed: 'Интеграцыг ачаалж чадсангүй.',
  phoneNumber: 'Утасны дугаар',
  businessName: 'Бизнесийн нэр',
  connectionMissing: 'Энэ интеграцтай холбосон WhatsApp дугаар алга.',
  close: 'Хаах',
  loading: 'Ачаалж байна…',
};

export type WhatsappTranslationKey = keyof typeof en;

/** Registers plugin-owned English and Mongolian resources with English fallbacks. */
export const useWhatsappTranslation = (): {
  t: (key: WhatsappTranslationKey) => string;
} => {
  const { i18n } = useTranslation('frontline');

  for (const [language, resources] of Object.entries({ en, mn })) {
    if (!i18n.hasResourceBundle(language, 'frontline-whatsapp')) {
      i18n.addResourceBundle(language, 'frontline-whatsapp', resources);
    }
  }

  // Stable across renders so callbacks and effects that use it do not re-run.
  const t = useCallback(
    (key: WhatsappTranslationKey) =>
      i18n.t(key, { ns: 'frontline-whatsapp', defaultValue: en[key] }),
    [i18n],
  );

  return { t };
};
