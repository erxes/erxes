import type { IAskUserQuestionEntry } from './components/AskUserPrompt';

/** One answered question, ready for the transcript card. */
export interface IAskUserAnswerEntry {
  question: string;
  answer: string;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

/**
 * Normalizes the askUser tool input into a question list: the batched
 * `questions` array, or the legacy single `question` object used by older
 * suspensions. Malformed entries are skipped; questions without text never
 * render.
 */
export const readAskUserQuestionsFromInput = (
  input: unknown,
): IAskUserQuestionEntry[] => {
  if (!isRecord(input)) {
    return [];
  }

  const raw = (
    Array.isArray(input.questions) && input.questions.length
      ? input.questions
      : [input]
  ) as Record<string, unknown>[];

  const questions: IAskUserQuestionEntry[] = [];

  for (const entry of raw) {
    if (
      !isRecord(entry) ||
      typeof entry.question !== 'string' ||
      !entry.question
    ) {
      continue;
    }

    const options = Array.isArray(entry.options)
      ? entry.options.filter(
          (option): option is { label: string; description?: string } =>
            isRecord(option) && typeof option.label === 'string',
        )
      : undefined;

    questions.push({
      question: entry.question,
      ...(options?.length ? { options } : {}),
      ...(entry.selectionMode === 'multi_select'
        ? { selectionMode: 'multi_select' as const }
        : {}),
    });
  }

  return questions;
};

const HEADER = 'User answered:';
const LEGACY_INLINE = 'User answered: ';

/**
 * Formats parsed answers back into the exact text legacy threads stored as
 * the answer's own user message: a multi-select answer is already joined
 * with ', ' at parse time, and questions are separated with ' · '. The
 * transcript compares this against a following user bubble to hide that
 * stored duplicate.
 */
export const formatAskUserAnswers = (answers: IAskUserAnswerEntry[]): string =>
  answers.map((entry) => entry.answer).join(' · ');

/**
 * Pairs the askUser questions (from the tool input) with the user's answers
 * (from the tool result) for the answered transcript card. Accepts either
 * the tool result's structured `answers` array or the stored
 * `content` text the backend persists (`User answered:\n<q>: <a>` lines, or
 * the legacy single-line `User answered: <answer>`). Returns null when
 * nothing parseable is there — the caller then hides the card instead of
 * rendering garbage.
 */
export const readAskUserAnswers = (
  questions: IAskUserQuestionEntry[],
  output: unknown,
): IAskUserAnswerEntry[] | null => {
  if (!questions.length || !isRecord(output)) {
    return null;
  }

  const result = output as { content?: unknown; answers?: unknown };

  // The structured form is the tool result's array; a bare string is accepted
  // for symmetry with the resume shapes (it answers a single question).
  const structured = Array.isArray(result.answers)
    ? result.answers
    : typeof result.answers === 'string'
    ? [result.answers]
    : null;

  if (structured) {
    const perQuestion =
      questions.length === 1 && !Array.isArray(structured[0])
        ? [structured]
        : (structured as unknown[]);

    const entries: IAskUserAnswerEntry[] = [];

    for (let index = 0; index < questions.length; index += 1) {
      const raw = perQuestion[index];
      const answer = Array.isArray(raw)
        ? raw.every((part) => typeof part === 'string')
          ? raw.join(', ')
          : null
        : typeof raw === 'string'
        ? raw
        : null;

      if (answer === null) {
        return null;
      }

      entries.push({ question: questions[index]!.question, answer });
    }

    return entries;
  }

  const content = typeof result.content === 'string' ? result.content : '';

  // Legacy built-in format: a single question answered on one line.
  if (content.startsWith(LEGACY_INLINE) && !content.includes('\n')) {
    const answer = content.slice(LEGACY_INLINE.length).trim();

    return questions.length === 1 && answer
      ? [{ question: questions[0]!.question, answer }]
      : null;
  }

  // Stored plugin format: "User answered:\n<question>: <answer>" per line.
  if (!content.startsWith(`${HEADER}\n`)) {
    return null;
  }

  const body = content.slice(HEADER.length + 1);
  const entries: { start: number; end: number; question: string }[] = [];

  // Locate each question's `<question>: ` prefix in order; a question's
  // answer is everything up to the next question's prefix, so answers that
  // span lines stay intact.
  let searchFrom = 0;

  for (const question of questions) {
    const prefix = `${question.question}: `;
    const start = body.indexOf(prefix, searchFrom);

    if (start === -1) {
      return null;
    }

    entries.push({
      start,
      end: start + prefix.length,
      question: question.question,
    });
    searchFrom = start + prefix.length;
  }

  return entries.map((entry, index) => {
    const nextStart =
      index + 1 < entries.length ? entries[index + 1]!.start : body.length;

    return {
      question: entry.question,
      answer: body.slice(entry.end, nextStart).trimEnd(),
    };
  });
};
