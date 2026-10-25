import type { TextUIPart, UIMessage } from 'ai';

import {
  agentMessageActivity,
  isReasoningPart,
  isStandalonePart,
  isToolPart,
  toAgentWorkStep,
  type TAgentWorkStep,
} from './agentWorkSteps';

// `ai` is ESM-only — `import type` only so jest (CJS) can load this util.
type TUIPart = UIMessage['parts'][number];

const isTextPart = (part: TUIPart): part is TextUIPart => part.type === 'text';

const hasText = (part: TUIPart): part is TextUIPart =>
  isTextPart(part) && part.text.trim().length > 0;

/**
 * Work that folds into the turn's activity timeline. A settled reasoning
 * part with no text carries nothing to show; a streaming one is the start
 * of new thinking and already counts.
 */
const isTimelineWork = (part: TUIPart): boolean => {
  if (isReasoningPart(part)) {
    return (
      part.text.trim().length > 0 ||
      (part as { state?: string }).state === 'streaming'
    );
  }

  return isToolPart(part) && !isStandalonePart(part);
};

/**
 * How one text part of an assistant turn is presented:
 * - `narration` — progress commentary between steps; folds into the
 *   activity timeline as a step title;
 * - `intro` — the leading plan sentence, kept visible above the answer;
 * - `answer` — the response body. Copy and export use only these.
 */
export type TAgentTextRole = 'intro' | 'narration' | 'answer';

/**
 * What the text at `index` leads into: more work (so it was narration), a
 * standalone card it introduces (approval, question, file), or nothing yet.
 * Other text, step boundaries and data parts are transparent.
 */
const nextAnchor = (
  parts: UIMessage['parts'],
  index: number,
): 'work' | 'card' | 'end' => {
  for (let next = index + 1; next < parts.length; next += 1) {
    const part = parts[next];

    if (isTimelineWork(part)) {
      return 'work';
    }

    if (isStandalonePart(part)) {
      return 'card';
    }
  }

  return 'end';
};

/**
 * Classifies a turn's non-empty text parts. Text followed by more tool or
 * reasoning work is narration; text before a standalone card, or after the
 * last work, is the answer. The first text before any tool call is the
 * intro when it is narration.
 *
 * While streaming, the trailing text is provisionally the answer: if the
 * model then calls another tool, it becomes narration on the next render.
 * A settled turn without any answer text promotes its last narration, so an
 * interrupted or tool-terminated turn never collapses to nothing.
 */
export const classifyAgentTurnText = (
  parts: UIMessage['parts'],
  { streaming }: { streaming: boolean },
): Map<number, TAgentTextRole> => {
  const roles = new Map<number, TAgentTextRole>();
  let seenTool = false;
  let seenText = false;

  parts.forEach((part, index) => {
    if (isToolPart(part)) {
      seenTool = true;
      return;
    }

    if (!hasText(part)) {
      return;
    }

    const first = !seenText;
    seenText = true;

    if (nextAnchor(parts, index) !== 'work') {
      roles.set(index, 'answer');
      return;
    }

    roles.set(index, first && !seenTool ? 'intro' : 'narration');
  });

  if (!streaming && ![...roles.values()].includes('answer')) {
    const last = [...roles.keys()].pop();

    if (last !== undefined) {
      roles.set(last, 'answer');
    }
  }

  return roles;
};

export interface IAgentTimelineStep {
  /** Stable React key: the tool call id, or the part index for reasoning. */
  key: string;
  /** Index of the step's part in the turn. */
  index: number;
  step: TAgentWorkStep;
}

/** One narration sentence and the work that followed it. */
export interface IAgentTimelineSection {
  key: string;
  /** Plain narration text; absent for work before the first narration. */
  title?: string;
  steps: IAgentTimelineStep[];
}

/** A part rendered in the response body, in original order. */
export interface IAgentTurnBodyPart {
  index: number;
  part: TUIPart;
  /** Set for text parts. */
  role?: Exclude<TAgentTextRole, 'narration'>;
}

export interface IAgentTurnLayout {
  /** Activity timeline; empty when the turn did no folded work. */
  sections: IAgentTimelineSection[];
  /** Intro, answer and standalone parts shown outside the timeline. */
  body: IAgentTurnBodyPart[];
  toolCount: number;
  reasoningCount: number;
  /** Index of the newest content part — the live one while streaming. */
  activeIndex: number;
  /** Answer text only, for copy and export. */
  answerText: string;
}

const HTML_ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  '#39': "'",
  nbsp: ' ',
};

/**
 * Narration as one line of plain text: HTML tags, common entities and
 * Markdown emphasis/heading/list markers are removed; reference tokens
 * stay intact for the chip renderer.
 */
export const narrationText = (text: string): string =>
  text
    .replace(/<\/?[a-z][^<>]*>/gi, ' ')
    .replace(/&(amp|lt|gt|quot|apos|#39|nbsp);/g, (_, entity: string) =>
      entity in HTML_ENTITIES ? HTML_ENTITIES[entity] : _,
    )
    .replace(/^\s{0,3}(?:#{1,6}\s+|[-*+]\s+|>\s?)/gm, '')
    .replace(/\*\*|`/g, '')
    .replace(/\s+/g, ' ')
    .trim();

/** The final sentence: what narration says the agent is doing now. */
const lastSentence = (text: string): string => {
  const sentences = text
    .split(/(?<=[.!?…])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);

  return sentences[sentences.length - 1] ?? text;
};

/**
 * Reasoning summaries (e.g. OpenAI's) title each section with a bold
 * line. The newest title names the current thought; plain thinking has
 * none.
 */
export const reasoningHeading = (text: string): string | null => {
  const headings = [...text.matchAll(/^\s*\*\*([^*\n]+)\*\*\s*$/gm)];
  const heading = headings[headings.length - 1]?.[1]?.trim();

  return heading || null;
};

/**
 * Splits one assistant turn (a transcript row, possibly merged across
 * hidden turns) into its activity timeline and its visible body.
 */
export const buildAgentTurnLayout = (
  parts: UIMessage['parts'],
  { streaming }: { streaming: boolean },
): IAgentTurnLayout => {
  const roles = classifyAgentTurnText(parts, { streaming });
  const sections: IAgentTimelineSection[] = [];
  const body: IAgentTurnBodyPart[] = [];
  const answers: string[] = [];
  let current: IAgentTimelineSection | null = null;
  let toolCount = 0;
  let reasoningCount = 0;
  let activeIndex = -1;

  parts.forEach((part, index) => {
    if (part.type === 'step-start') {
      return;
    }

    activeIndex = index;
    const role = roles.get(index);

    if (isTextPart(part)) {
      if (role === 'narration') {
        current = {
          key: `narration-${index}`,
          title: narrationText(part.text),
          steps: [],
        };
        sections.push(current);
      } else if (role) {
        body.push({ index, part, role });

        if (role === 'answer') {
          answers.push(part.text);
        }
      }

      return;
    }

    if (isTimelineWork(part)) {
      const step = toAgentWorkStep(part);

      if (!step) {
        return;
      }

      if (!current) {
        current = { key: 'lead', steps: [] };
        sections.push(current);
      }

      current.steps.push({
        key: step.kind === 'tool' ? step.tool.toolCallId : `reasoning-${index}`,
        index,
        step,
      });

      if (step.kind === 'tool') {
        toolCount += 1;
      } else {
        reasoningCount += 1;
      }

      return;
    }

    if (isReasoningPart(part)) {
      return;
    }

    body.push({ index, part });
  });

  return {
    sections,
    body,
    toolCount,
    reasoningCount,
    activeIndex,
    answerText: answers.join('\n\n'),
  };
};

/** The answer text of a settled turn, for copy and Markdown export. */
export const agentTurnAnswerText = (parts: UIMessage['parts']): string =>
  buildAgentTurnLayout(parts, { streaming: false }).answerText;

/**
 * The turn's single live status label: a running tool's action, the
 * current reasoning title, "Writing…" for reply text, or — between steps —
 * the last sentence of the newest narration.
 */
export const agentTurnActivity = (parts: UIMessage['parts']): string => {
  for (let index = parts.length - 1; index >= 0; index -= 1) {
    const part = parts[index];

    if (isTextPart(part)) {
      if (part.text.trim()) {
        return 'Writing…';
      }
      continue;
    }

    if (isReasoningPart(part)) {
      return reasoningHeading(part.text) ?? 'Thinking…';
    }

    if (!isToolPart(part)) {
      continue;
    }

    if (part.state === 'input-streaming' || part.state === 'input-available') {
      return agentMessageActivity([part]);
    }

    for (let previous = index - 1; previous >= 0; previous -= 1) {
      const candidate = parts[previous];

      if (hasText(candidate)) {
        const text = narrationText(candidate.text);

        return text ? lastSentence(text) : 'Working…';
      }
    }

    return 'Working…';
  }

  return 'Working…';
};

/** Compact elapsed time: `42s`, `3m 05s`, `1h 2m`. */
export const formatAgentDuration = (ms: number): string => {
  const seconds = Math.max(1, Math.round(ms / 1000));

  if (seconds < 60) {
    return `${seconds}s`;
  }

  const minutes = Math.floor(seconds / 60);

  if (minutes < 60) {
    const rest = seconds % 60;

    return rest
      ? `${minutes}m ${String(rest).padStart(2, '0')}s`
      : `${minutes}m`;
  }

  const rest = minutes % 60;

  return rest ? `${Math.floor(minutes / 60)}h ${rest}m` : `${minutes / 60}h`;
};
