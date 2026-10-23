import type { TextUIPart, UIMessage } from 'ai';

// `ai` is ESM-only — this util stays `import type`-only so jest (CJS) can
// load it; the predicate is local, same rule as `utils/agentWorkSteps.ts`.
const isTextPart = (part: UIMessage['parts'][number]): part is TextUIPart =>
  part.type === 'text';

/**
 * Ask_user answers travel through the send pipeline as user messages (the
 * transport reroutes them to the answer endpoint), but they display as the
 * assistant's answered Q&A card — never as a bubble of their own. The send
 * marks them with `metadata.agentsAnswer`.
 */
export const isAgentsAnswerTurn = (message: UIMessage): boolean => {
  const { metadata } = message;

  return (
    !!metadata &&
    typeof metadata === 'object' &&
    !Array.isArray(metadata) &&
    (metadata as { agentsAnswer?: unknown }).agentsAnswer === true
  );
};

/** Joins a message's text parts — the only parts shown as bubbles. */
export const getMessageText = (message: UIMessage): string =>
  message.parts
    .filter(isTextPart)
    .map((part) => part.text)
    .join('');
