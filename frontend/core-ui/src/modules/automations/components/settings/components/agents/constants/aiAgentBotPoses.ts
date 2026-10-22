import { TAiAgentStep } from '@/automations/components/settings/components/agents/constants/aiAgentSteps';

export type TAiAgentBotEye =
  | 'normal'
  | 'happy'
  | 'wink'
  | 'worried'
  | 'side'
  | 'cross'
  | 'sleep';

export type TAiAgentBotProp =
  | 'cheeks'
  | 'headset'
  | 'gears'
  | 'waves'
  | 'lens'
  | 'scan'
  | 'sweat'
  | 'spark'
  | 'zzz'
  | 'okBubble'
  | 'hintBubble'
  | 'warningBubble'
  | 'errorBubble';

export type TAiAgentBotPose = {
  leftHand: [number, number];
  rightHand: [number, number];
  handMotion?: 'wave' | 'pump' | 'shrug';
  eye: TAiAgentBotEye;
  eyeOffset?: [number, number];
  glance?: boolean;
  tilt?: number;
  head?: 'nod' | 'shake';
  body?: 'hop' | 'bounce' | 'panic' | 'breathe';
  antenna?: 'blink' | 'droop';
  fastScan?: boolean;
  fastHands?: boolean;
  // Scene staging: body shift, rising on tiptoe, and the memory bookshelf.
  offsetX?: number;
  lift?: number;
  stretch?: number;
  tiptoe?: boolean;
  shelf?: 'full' | 'empty';
  book?: 'shelf' | 'pulled' | 'held' | 'open';
  heart: 'ok' | 'warning' | 'error' | 'off';
  props: TAiAgentBotProp[];
  mood: string;
};

export const AI_AGENT_BOT_STEP_POSES: Record<TAiAgentStep, TAiAgentBotPose> = {
  identity: {
    leftHand: [41, 100],
    rightHand: [100, 60],
    handMotion: 'wave',
    eye: 'wink',
    tilt: 8,
    body: 'bounce',
    heart: 'ok',
    props: ['cheeks'],
    mood: 'Hi!',
  },
  connection: {
    leftHand: [41, 100],
    rightHand: [104, 54],
    eye: 'normal',
    eyeOffset: [3, 0],
    glance: true,
    tilt: 6,
    antenna: 'blink',
    heart: 'ok',
    props: ['headset', 'waves'],
    mood: 'On the line',
  },
  brain: {
    leftHand: [41, 100],
    rightHand: [80, 82],
    eye: 'normal',
    eyeOffset: [3, -3],
    tilt: -10,
    heart: 'ok',
    props: ['gears'],
    mood: 'Thinking…',
  },
  memory: {
    leftHand: [46, 99],
    rightHand: [82, 99],
    eye: 'normal',
    eyeOffset: [2, 4],
    tilt: 9,
    head: 'nod',
    offsetX: -8,
    shelf: 'full',
    book: 'open',
    heart: 'ok',
    props: [],
    mood: 'Reading…',
  },
  test: {
    leftHand: [41, 100],
    rightHand: [98, 74],
    eye: 'normal',
    eyeOffset: [2, 0],
    tilt: -4,
    heart: 'ok',
    props: ['lens', 'scan'],
    mood: 'Inspecting…',
  },
};

export const AI_AGENT_BOT_TESTING_POSE: TAiAgentBotPose = {
  ...AI_AGENT_BOT_STEP_POSES.test,
  head: 'nod',
  fastScan: true,
  mood: 'Testing…',
};

export const AI_AGENT_BOT_PASSED_POSE: TAiAgentBotPose = {
  leftHand: [28, 66],
  rightHand: [102, 66],
  handMotion: 'pump',
  eye: 'happy',
  body: 'hop',
  heart: 'ok',
  props: ['okBubble', 'cheeks'],
  mood: 'Passed',
};

export const AI_AGENT_BOT_HINT_POSE: TAiAgentBotPose = {
  leftHand: [28, 90],
  rightHand: [102, 90],
  handMotion: 'shrug',
  eye: 'side',
  eyeOffset: [-3, 0],
  tilt: -6,
  heart: 'ok',
  props: ['hintBubble'],
  mood: 'Who am I?',
};

export const AI_AGENT_BOT_WARNING_POSE: TAiAgentBotPose = {
  leftHand: [46, 96],
  rightHand: [84, 96],
  eye: 'worried',
  head: 'shake',
  heart: 'warning',
  props: ['warningBubble', 'sweat'],
  mood: 'Something is off',
};

export const AI_AGENT_BOT_ERROR_POSE: TAiAgentBotPose = {
  leftHand: [36, 44],
  rightHand: [94, 44],
  eye: 'cross',
  body: 'panic',
  antenna: 'droop',
  heart: 'error',
  props: ['spark', 'errorBubble'],
  mood: 'Signal lost',
};

export const AI_AGENT_BOT_ASLEEP_POSE: TAiAgentBotPose = {
  leftHand: [41, 104],
  rightHand: [89, 104],
  eye: 'sleep',
  tilt: 14,
  body: 'breathe',
  heart: 'off',
  props: ['zzz'],
  mood: 'Asleep',
};

export type TAiAgentBotFrame = { pose: TAiAgentBotPose; ms: number };

const SHELF_REST: TAiAgentBotPose = {
  leftHand: [41, 100],
  rightHand: [89, 100],
  eye: 'normal',
  offsetX: -8,
  heart: 'ok',
  props: [],
  mood: 'Looking it up…',
};

const SHELF_REACH: TAiAgentBotPose = {
  ...SHELF_REST,
  leftHand: [50, 72],
  rightHand: [108, 44],
  eyeOffset: [4, -3],
  tilt: -14,
  lift: -7,
  stretch: 1.06,
  tiptoe: true,
};

// Takes a book off the shelf and settles into reading it.
export const AI_AGENT_BOT_MEMORY_READ_FRAMES: TAiAgentBotFrame[] = [
  { pose: { ...SHELF_REST, shelf: 'full', book: 'shelf' }, ms: 400 },
  { pose: { ...SHELF_REACH, shelf: 'full', book: 'shelf' }, ms: 750 },
  { pose: { ...SHELF_REACH, shelf: 'full', book: 'pulled' }, ms: 450 },
  {
    pose: {
      ...SHELF_REST,
      shelf: 'full',
      book: 'held',
      leftHand: [70, 98],
      rightHand: [86, 94],
      tilt: 4,
    },
    ms: 650,
  },
  { pose: AI_AGENT_BOT_STEP_POSES.memory, ms: 0 },
];

// Reaches for a book, finds the shelf bare, and shrugs.
export const AI_AGENT_BOT_MEMORY_EMPTY_FRAMES: TAiAgentBotFrame[] = [
  { pose: { ...SHELF_REST, shelf: 'empty' }, ms: 400 },
  { pose: { ...SHELF_REACH, shelf: 'empty' }, ms: 700 },
  {
    pose: {
      ...SHELF_REACH,
      shelf: 'empty',
      rightHand: [114, 42],
      fastHands: true,
    },
    ms: 220,
  },
  {
    pose: {
      ...SHELF_REACH,
      shelf: 'empty',
      rightHand: [104, 46],
      fastHands: true,
    },
    ms: 220,
  },
  {
    pose: {
      ...SHELF_REACH,
      shelf: 'empty',
      rightHand: [114, 42],
      fastHands: true,
    },
    ms: 220,
  },
  { pose: { ...SHELF_REACH, shelf: 'empty' }, ms: 500 },
  {
    pose: {
      ...SHELF_REST,
      shelf: 'empty',
      tilt: -6,
      eyeOffset: [4, -1],
      mood: 'Hmm…',
    },
    ms: 600,
  },
  {
    pose: {
      ...SHELF_REST,
      shelf: 'empty',
      leftHand: [28, 90],
      rightHand: [102, 90],
      handMotion: 'shrug',
      eye: 'side',
      eyeOffset: [-3, 0],
      tilt: -8,
      props: ['hintBubble'],
      mood: 'Nothing here yet',
    },
    ms: 0,
  },
];
