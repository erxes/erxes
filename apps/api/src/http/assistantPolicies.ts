import { needs } from './policyRules';

/** The assistant's part of the access map (`ACCESS` in `./policies`). */
export const ASSISTANT_ACCESS = {
  'assistant.connections': needs('assistant.chat'),
  'assistant.saveConnection': needs('assistant.chat'),
  'assistant.removeConnection': needs('assistant.chat'),
  'assistant.setDefaultProvider': needs('assistant.chat'),
  'assistant.models': needs('assistant.chat'),
  'assistant.verifyModel': needs('assistant.chat'),
  'assistant.threads': needs('assistant.chat'),
  'assistant.thread': needs('assistant.chat'),
  'assistant.updateThread': needs('assistant.chat'),
  'assistant.removeThread': needs('assistant.chat'),
  'assistant.reference': needs('assistant.chat'),
  'assistant.record': needs('assistant.chat'),
  'assistant.settings': needs('assistant.chat'),
  'assistant.updateSettings': needs('assistant.manage'),
  'assistant.appearance': needs('assistant.chat'),
  'assistant.updateAppearance': needs('assistant.chat'),
} as const;
