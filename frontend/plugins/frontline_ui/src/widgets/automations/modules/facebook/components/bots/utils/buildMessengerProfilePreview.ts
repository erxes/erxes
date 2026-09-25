import { TFacebookBotForm } from '~/widgets/automations/modules/facebook/components/bots/states/facebookBotForm';

type TPersistentMenuType = TFacebookBotForm['persistentMenus'][number]['type'];

/** Facebook accepts at most five actions per persistent-menu level. */
export const FACEBOOK_PERSISTENT_MENU_LIMIT = 5;

/**
 * The backend always prepends its own Get Started action, so the form may only
 * offer one fewer than Facebook's own limit.
 */
export const FACEBOOK_PERSISTENT_MENU_USER_LIMIT =
  FACEBOOK_PERSISTENT_MENU_LIMIT - 1;

export const FACEBOOK_GREETING_LIMIT = 160;

/** Facebook accepts at most four ice breakers, each question up to 80 chars. */
export const FACEBOOK_ICE_BREAKER_LIMIT = 4;
export const FACEBOOK_ICE_BREAKER_QUESTION_LIMIT = 80;

export const FACEBOOK_GET_STARTED_TITLE = 'Get Started';

/** The preview key of the Get Started action, which has no menu item of its own. */
export const GET_STARTED_KEY = 'get-started';

const BACK_BUTTON_FALLBACK_TITLE = 'Back';

export type TMessengerMenuItemKind = 'getStarted' | 'postback' | 'webUrl';

export type TMessengerMenuPreviewItem = {
  key: string;
  title: string;
  kind: TMessengerMenuItemKind;
  url?: string;
  sourceId?: string;
  // Only a plain button reaches the automation trigger; the other types are
  // consumed before it. Kept so the preview can say which is which.
  sourceType?: TPersistentMenuType;
  warning?: string;
};

export type TMessengerIceBreakerPreviewItem = {
  key: string;
  question: string;
};

export type TMessengerProfilePreview = {
  greeting?: string;
  greetingWarning?: string;
  items: TMessengerMenuPreviewItem[];
  iceBreakers: TMessengerIceBreakerPreviewItem[];
  droppedIceBreakerCount: number;
  droppedCount: number;
  isOverLimit: boolean;
};

type TPreviewInput = Pick<
  TFacebookBotForm,
  | 'persistentMenus'
  | 'iceBreakers'
  | 'getStartedText'
  | 'greetText'
  | 'isEnabledBackBtn'
>;

/**
 * Mirrors `FacebookBots.connectBotPageMessenger` — the only place that decides
 * what actually reaches Facebook. Both must change together.
 */
export const buildMessengerProfilePreview = ({
  persistentMenus = [],
  iceBreakers = [],
  getStartedText,
  greetText,
  isEnabledBackBtn,
}: TPreviewInput): TMessengerProfilePreview => {
  const items: TMessengerMenuPreviewItem[] = [
    {
      key: GET_STARTED_KEY,
      title: getStartedText?.trim() || FACEBOOK_GET_STARTED_TITLE,
      kind: 'getStarted',
    },
  ];

  let droppedCount = 0;
  let hasBackButtonMenu = false;

  for (const { _id, type, text, link } of persistentMenus) {
    const title = type === 'back_button' ? text || BACK_BUTTON_FALLBACK_TITLE : text;

    if (!title) {
      droppedCount += 1;
      continue;
    }

    if (type === 'link' && link) {
      items.push({
        key: _id,
        sourceId: _id,
        title,
        kind: 'webUrl',
        url: link,
        sourceType: type,
      });
      continue;
    }

    if (type === 'back_button') {
      hasBackButtonMenu = true;
    }

    items.push({
      key: _id,
      sourceId: _id,
      title,
      kind: 'postback',
      sourceType: type,
      warning:
        type === 'link'
          ? 'No link given, so this is sent as a plain button.'
          : undefined,
    });
  }

  if (Boolean(isEnabledBackBtn) && !hasBackButtonMenu) {
    items.push({
      key: 'auto-back',
      title: BACK_BUTTON_FALLBACK_TITLE,
      kind: 'postback',
      sourceType: 'back_button',
    });
  }

  const greeting = greetText?.trim() ? greetText : undefined;
  const previewIceBreakers = iceBreakers
    .filter(({ question }) => Boolean(question))
    .map(({ _id, question }) => ({ key: _id, question }));

  return {
    greeting,
    iceBreakers: previewIceBreakers,
    droppedIceBreakerCount: iceBreakers.length - previewIceBreakers.length,
    greetingWarning:
      greeting && greeting.length > FACEBOOK_GREETING_LIMIT
        ? `Facebook truncates the greeting at ${FACEBOOK_GREETING_LIMIT} characters.`
        : undefined,
    items,
    droppedCount,
    isOverLimit: items.length > FACEBOOK_PERSISTENT_MENU_LIMIT,
  };
};
