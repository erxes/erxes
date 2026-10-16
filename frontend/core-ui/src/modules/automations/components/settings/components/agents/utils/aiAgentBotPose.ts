import {
  AI_AGENT_BOT_ASLEEP_POSE,
  AI_AGENT_BOT_ERROR_POSE,
  AI_AGENT_BOT_HINT_POSE,
  AI_AGENT_BOT_MEMORY_EMPTY_FRAMES,
  AI_AGENT_BOT_MEMORY_READ_FRAMES,
  AI_AGENT_BOT_PASSED_POSE,
  AI_AGENT_BOT_STEP_POSES,
  AI_AGENT_BOT_TESTING_POSE,
  AI_AGENT_BOT_WARNING_POSE,
  TAiAgentBotFrame,
  TAiAgentBotPose,
} from '@/automations/components/settings/components/agents/constants/aiAgentBotPoses';
import {
  TAiAgentStep,
  TAiAgentStepState,
} from '@/automations/components/settings/components/agents/constants/aiAgentSteps';

// Brain and memory keep their props so the worry reads as "about this step".
const STEPS_KEEPING_PROPS: TAiAgentStep[] = ['brain', 'memory'];

type TAiAgentBotSceneInput = {
  step: TAiAgentStep;
  state: TAiAgentStepState;
  asleep: boolean;
};

export type TAiAgentBotScene = { key: string; frames: TAiAgentBotFrame[] };

const resolveAiAgentBotPose = ({
  step,
  state,
  asleep,
}: TAiAgentBotSceneInput): TAiAgentBotPose => {
  const base = AI_AGENT_BOT_STEP_POSES[step];
  const mood = state.message || undefined;

  if (state.status === 'error') {
    return {
      ...AI_AGENT_BOT_ERROR_POSE,
      mood: mood || AI_AGENT_BOT_ERROR_POSE.mood,
    };
  }

  if (asleep) {
    return AI_AGENT_BOT_ASLEEP_POSE;
  }

  if (state.status === 'warning') {
    if (STEPS_KEEPING_PROPS.includes(step)) {
      return {
        ...base,
        eye: 'worried',
        heart: 'warning',
        props: [...base.props, 'sweat', 'warningBubble'],
        mood: mood || base.mood,
      };
    }

    return {
      ...AI_AGENT_BOT_WARNING_POSE,
      mood: mood || AI_AGENT_BOT_WARNING_POSE.mood,
    };
  }

  if (state.status === 'hint') {
    return {
      ...AI_AGENT_BOT_HINT_POSE,
      mood: mood || AI_AGENT_BOT_HINT_POSE.mood,
    };
  }

  if (step === 'test') {
    if (state.status === 'pending') {
      return AI_AGENT_BOT_TESTING_POSE;
    }

    if (state.status === 'done') {
      return AI_AGENT_BOT_PASSED_POSE;
    }
  }

  return base;
};

/**
 * What the bot plays for a step. Memory is a short scene ending in the
 * step's pose: a book taken off the shelf, or a bare shelf when empty.
 */
export const resolveAiAgentBotScene = (
  input: TAiAgentBotSceneInput,
): TAiAgentBotScene => {
  const { step, state, asleep } = input;
  const pose = resolveAiAgentBotPose(input);
  const key = `${step}:${state.status}:${asleep}`;

  if (step !== 'memory' || asleep || state.status === 'error') {
    return { key, frames: [{ pose, ms: 0 }] };
  }

  if (state.status === 'missing') {
    return { key, frames: AI_AGENT_BOT_MEMORY_EMPTY_FRAMES };
  }

  return {
    key,
    frames: [...AI_AGENT_BOT_MEMORY_READ_FRAMES.slice(0, -1), { pose, ms: 0 }],
  };
};
