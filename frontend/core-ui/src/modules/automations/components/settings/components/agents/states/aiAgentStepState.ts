import { TAiAgentStep } from '@/automations/components/settings/components/agents/constants/aiAgentSteps';
import { atom } from 'jotai';

// Step of an agent sheet opened outside its route, where `?tab=` is not ours.
export const aiAgentSheetStepAtom = atom<TAiAgentStep | null>(null);
