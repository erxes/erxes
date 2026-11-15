import { TAiAgentBotPose } from '@/automations/components/settings/components/agents/constants/aiAgentBotPoses';

// The erxes bot greeting the gallery
export const TEMPLATE_BOT_WAVE_POSE: TAiAgentBotPose = {
  leftHand: [41, 100],
  rightHand: [100, 60],
  handMotion: 'wave',
  eye: 'wink',
  tilt: 8,
  body: 'bounce',
  heart: 'ok',
  props: ['cheeks'],
  mood: 'Hi!',
};

// Looking through the shelves while a search is typed
export const TEMPLATE_BOT_SEARCH_POSE: TAiAgentBotPose = {
  leftHand: [41, 100],
  rightHand: [98, 74],
  eye: 'normal',
  eyeOffset: [3, 0],
  glance: true,
  tilt: 4,
  heart: 'ok',
  props: ['lens'],
  mood: 'Looking…',
};

// Nothing matched
export const TEMPLATE_BOT_EMPTY_POSE: TAiAgentBotPose = {
  leftHand: [28, 90],
  rightHand: [102, 90],
  handMotion: 'shrug',
  eye: 'side',
  eyeOffset: [-3, 0],
  tilt: -6,
  heart: 'ok',
  props: ['hintBubble'],
  mood: 'Nothing here',
};
