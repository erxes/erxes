export const FACEBOOK_MESSAGE_TRIGGER_TYPE = 'frontline:facebook.messages';
export const FACEBOOK_COMMENT_TRIGGER_TYPE = 'frontline:facebook.comments';

/**
 * Action types carry their method, unlike triggers — see
 * `getAutomationNodeType` in erxes-api-shared.
 */
export const FACEBOOK_MESSAGE_ACTION_TYPE =
  'frontline:facebook.messages.create';
export const FACEBOOK_COMMENT_ACTION_TYPE =
  'frontline:facebook.comments.create';
export const AI_AGENT_ACTION_TYPE = 'aiAgent';
