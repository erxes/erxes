import { atomWithStorage } from 'jotai/utils';

export const onboardingStepState = atomWithStorage<number>('erxes-onboarding-step', 1);

/*
 * Old erxes kept `isOnboarded` on the user (server). The new users API has no
 * such field yet, so the flag lives in this browser, per user id: someone who
 * signs in on another browser sees the welcome steps again there.
 */
const createOnboardedState = (userId: string) =>
  atomWithStorage<boolean>(`erxes-onboarded:${userId}`, false, undefined, { getOnInit: true });

const onboardedStates = new Map<string, ReturnType<typeof createOnboardedState>>();

export const onboardedState = (userId: string) => {
  let state = onboardedStates.get(userId);

  if (!state) {
    state = createOnboardedState(userId);
    onboardedStates.set(userId, state);
  }

  return state;
};
