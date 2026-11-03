import type { UIMessage } from 'ai';

import {
  agentTurnActivity,
  agentTurnAnswerText,
  buildAgentTurnLayout,
  classifyAgentTurnText,
  formatAgentDuration,
  narrationText,
  reasoningHeading,
} from '../utils/agentTurnTimeline';

type TPart = UIMessage['parts'][number];

const text = (value: string): TPart => ({ type: 'text', text: value });
const reasoning = (value: string, state?: 'streaming' | 'done'): TPart =>
  state
    ? { type: 'reasoning', text: value, state }
    : { type: 'reasoning', text: value };
const stepStart: TPart = { type: 'step-start' };
let callId = 0;
const tool = (
  toolName: string,
  state: string,
  input: unknown = {},
  extra: Record<string, unknown> = {},
): TPart => {
  callId += 1;
  return {
    type: 'dynamic-tool',
    toolName,
    toolCallId: `call-${callId}`,
    state,
    input,
    ...extra,
  } as TPart;
};
const query = (state = 'output-available', fields = 'deals { _id }') =>
  tool('callGraphql', state, { query: `{ ${fields} }` });

const roleList = (parts: TPart[], streaming: boolean): [number, string][] => [
  ...classifyAgentTurnText(parts, { streaming }).entries(),
];

describe('classifyAgentTurnText', () => {
  it('folds text followed by more work into narration and keeps the trailing text as the answer', () => {
    const parts = [
      stepStart,
      reasoning('Plan the query'),
      text("I'll pull together your sales data. Let me find it first."),
      query(),
      stepStart,
      text('Found the sales data. Now fetching…'),
      tool('execute_typescript', 'output-available', { code: '1' }),
      text('The month filter came back empty, so let me check…'),
      reasoning('Check the filter'),
      query(),
      text('Here is your September report.'),
    ];

    expect(roleList(parts, false)).toEqual([
      [2, 'intro'],
      [5, 'narration'],
      [7, 'narration'],
      [10, 'answer'],
    ]);
  });

  it('treats the first text as narration, not intro, once a tool ran before it', () => {
    const parts = [query(), text('Got it. Next…'), query(), text('Done.')];

    expect(roleList(parts, false)).toEqual([
      [1, 'narration'],
      [3, 'answer'],
    ]);
  });

  it('keeps text that introduces a standalone card visible', () => {
    const parts = [
      text('I will create the deal once you approve.'),
      tool('callGraphql', 'approval-requested', {
        query: 'mutation { dealsAdd { _id } }',
      }),
      { type: 'data-tool-call-approval', data: {} } as TPart,
    ];

    expect(roleList(parts, false)).toEqual([[0, 'answer']]);
  });

  it('keeps a question lead-in visible even when work resumes after the answer', () => {
    const parts = [
      reasoning('Need a period'),
      text('Which month should I use?'),
      tool('askUser', 'output-available', { questions: [] }, { output: {} }),
      query(),
      text('September totals: 12 deals.'),
    ];

    expect(roleList(parts, false)).toEqual([
      [1, 'answer'],
      [4, 'answer'],
    ]);
  });

  it('ignores empty text and lets step boundaries and data parts stay transparent', () => {
    const parts = [
      text('   '),
      text('Looking up deals.'),
      stepStart,
      { type: 'data-progress', data: {} } as TPart,
      query(),
      text(''),
      text('Answer'),
    ];

    expect(roleList(parts, false)).toEqual([
      [1, 'intro'],
      [6, 'answer'],
    ]);
  });

  it('does not let settled empty reasoning turn the answer into narration', () => {
    const parts = [query(), text('Answer'), reasoning('')];

    expect(roleList(parts, true)).toEqual([[1, 'answer']]);
  });

  it('treats a streaming reasoning part as new work even before it has text', () => {
    const parts = [
      query(),
      text('Checking another source.'),
      reasoning('', 'streaming'),
    ];

    expect(roleList(parts, true)).toEqual([[1, 'narration']]);
  });

  describe('streaming', () => {
    it('shows the trailing text as the answer until more work follows it', () => {
      const before = [query(), text('Found the endpoints. Now fetching')];
      expect(roleList(before, true)).toEqual([[1, 'answer']]);

      const after = [...before, query('input-streaming')];
      expect(roleList(after, true)).toEqual([[1, 'narration']]);
    });

    it('keeps an in-progress turn without answer text folded', () => {
      const parts = [text('Let me check.'), query('input-available')];

      expect(roleList(parts, true)).toEqual([[0, 'intro']]);
    });

    it('promotes the last narration to the answer once a turn settles without one', () => {
      const parts = [
        text('Let me check.'),
        query(),
        text('Trying the other endpoint.'),
        query('output-error'),
      ];

      expect(roleList(parts, true)).toEqual([
        [0, 'intro'],
        [2, 'narration'],
      ]);
      expect(roleList(parts, false)).toEqual([
        [0, 'intro'],
        [2, 'answer'],
      ]);
    });

    it('promotes a lone intro when the run stopped before anything else', () => {
      expect(roleList([text('Let me check.'), query()], false)).toEqual([
        [0, 'answer'],
      ]);
    });
  });
});

describe('buildAgentTurnLayout', () => {
  it('builds titled sections with nested steps and keeps the body to intro, cards and answer', () => {
    const intro = text('Plan: pull the sales data.');
    const approval = tool('callGraphql', 'approval-requested', {
      query: 'mutation { dealsEdit { _id } }',
    });
    const answer = text('All set.');
    const parts = [
      stepStart,
      reasoning('**Planning the report**\n\nThe user wants…'),
      intro,
      query(),
      text('<p>Found <b>12</b> deals &amp; 3 tasks.</p>'),
      tool('execute_typescript', 'output-available', { code: '1' }),
      reasoning('More'),
      text('I need approval to update the deal.'),
      approval,
      query(),
      answer,
    ];
    const layout = buildAgentTurnLayout(parts, { streaming: false });

    expect(
      layout.sections.map((section) => ({
        title: section.title,
        steps: section.steps.map((entry) => entry.step.kind),
      })),
    ).toEqual([
      { title: undefined, steps: ['reasoning', 'tool'] },
      {
        title: 'Found 12 deals & 3 tasks.',
        steps: ['tool', 'reasoning', 'tool'],
      },
    ]);
    expect(layout.body.map((item) => [item.index, item.role])).toEqual([
      [2, 'intro'],
      [7, 'answer'],
      [8, undefined],
      [10, 'answer'],
    ]);
    expect(layout.toolCount).toBe(3);
    expect(layout.reasoningCount).toBe(2);
    expect(layout.activeIndex).toBe(10);
    expect(layout.answerText).toBe(
      'I need approval to update the deal.\n\nAll set.',
    );
  });

  it('gives steps stable keys from tool call ids and part indexes', () => {
    const call = query();
    const layout = buildAgentTurnLayout([reasoning('a'), call], {
      streaming: true,
    });

    expect(layout.sections[0].steps.map((entry) => entry.key)).toEqual([
      'reasoning-0',
      (call as { toolCallId: string }).toolCallId,
    ]);
  });

  it('has no timeline for a plain answer', () => {
    const layout = buildAgentTurnLayout([stepStart, text('Hello!')], {
      streaming: false,
    });

    expect(layout.sections).toEqual([]);
    expect(layout.body).toHaveLength(1);
    expect(layout.answerText).toBe('Hello!');
  });

  it('keeps artifacts, files and data parts in the body', () => {
    const artifact = tool('createArtifact', 'output-available', {});
    const files = { type: 'data-agents-files', data: {} } as TPart;
    const layout = buildAgentTurnLayout([query(), artifact, files], {
      streaming: false,
    });

    expect(layout.body.map((item) => item.part)).toEqual([artifact, files]);
  });

  it('moves streamed narration out of the body once the next tool call starts', () => {
    const base = [
      text('Plan.'),
      query(),
      text('Now fetching September deals.'),
    ];
    const streamingAnswer = buildAgentTurnLayout(base, { streaming: true });

    expect(streamingAnswer.body.map((item) => item.index)).toEqual([0, 2]);
    expect(streamingAnswer.sections).toHaveLength(1);

    const folded = buildAgentTurnLayout([...base, query('input-streaming')], {
      streaming: true,
    });

    expect(folded.body.map((item) => item.index)).toEqual([0]);
    expect(folded.sections.map((section) => section.title)).toEqual([
      undefined,
      'Now fetching September deals.',
    ]);
    expect(folded.answerText).toBe('');
  });

  it('skips settled empty reasoning', () => {
    const layout = buildAgentTurnLayout([reasoning(''), text('Hi')], {
      streaming: false,
    });

    expect(layout.sections).toEqual([]);
    expect(layout.body.map((item) => item.index)).toEqual([1]);
  });
});

describe('agentTurnAnswerText', () => {
  it('returns only the answer for copy and export', () => {
    expect(
      agentTurnAnswerText([
        text('Let me look.'),
        query(),
        text('Found it, checking details…'),
        query(),
        text('Final answer'),
      ]),
    ).toBe('Final answer');
  });
});

describe('agentTurnActivity', () => {
  it('describes a running tool', () => {
    expect(
      agentTurnActivity([
        text('Checking.'),
        query('input-available'),
        stepStart,
      ]),
    ).toBe('Querying deals');
  });

  it('uses the newest narration sentence between steps', () => {
    expect(
      agentTurnActivity([
        query(),
        text('Found the sales endpoints. Now fetching September deals…'),
        query(),
        stepStart,
      ]),
    ).toBe('Now fetching September deals…');
  });

  it('uses the current reasoning summary title', () => {
    expect(
      agentTurnActivity([
        reasoning(
          '**Reviewing data**\n\nFirst…\n\n**Summarizing your intended research**\n\nNext',
        ),
      ]),
    ).toBe('Summarizing your intended research');
    expect(agentTurnActivity([reasoning('plain thoughts')])).toBe('Thinking…');
  });

  it('reports writing for reply text and has a default', () => {
    expect(agentTurnActivity([query(), text('The report')])).toBe('Writing…');
    expect(agentTurnActivity([])).toBe('Working…');
    expect(agentTurnActivity([query()])).toBe('Working…');
  });
});

describe('narrationText', () => {
  it('strips markup but keeps comparisons and reference tokens', () => {
    expect(
      narrationText(
        '<p>**Checking** `deals` where x < 5 and y > 3 for [[deal:d1:Big deal]]</p>',
      ),
    ).toBe('Checking deals where x < 5 and y > 3 for [[deal:d1:Big deal]]');
    expect(narrationText('## Heading\n- item one\n> quote')).toBe(
      'Heading item one quote',
    );
  });
});

describe('reasoningHeading', () => {
  it('reads the latest bold summary title', () => {
    expect(reasoningHeading('**One**\n\ntext\n\n**Two**\nmore')).toBe('Two');
    expect(reasoningHeading('no **inline** titles')).toBeNull();
  });
});

describe('formatAgentDuration', () => {
  it('formats seconds, minutes and hours compactly', () => {
    expect(formatAgentDuration(200)).toBe('1s');
    expect(formatAgentDuration(42_000)).toBe('42s');
    expect(formatAgentDuration(65_000)).toBe('1m 05s');
    expect(formatAgentDuration(120_000)).toBe('2m');
    expect(formatAgentDuration(3_720_000)).toBe('1h 2m');
    expect(formatAgentDuration(7_200_000)).toBe('2h');
  });
});
