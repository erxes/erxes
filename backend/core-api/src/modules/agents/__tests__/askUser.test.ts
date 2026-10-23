import { buildAskUserTool } from '@/agents/askUser';

// Mastra's `createTool` wraps execute with validation; pass the definition
// through so the test drives the plugin's own resume handling.
jest.mock('@mastra/core/tools', () => ({
  createTool: (definition: unknown) => definition,
}));

const questions = [
  { question: 'Which subjects?' },
  { question: 'Which period?' },
];

const resumeWith = async (resumeData: unknown, asked = questions) => {
  const tool = (await buildAskUserTool()) as unknown as {
    execute: (
      input: { questions: typeof questions },
      context: { agent: { resumeData: unknown } },
    ) => Promise<unknown>;
  };
  return tool.execute({ questions: asked }, { agent: { resumeData } });
};

describe('ask_user resume contract', () => {
  it('answers each question in order, including multi-select and custom text', async () => {
    await expect(
      resumeWith({
        answers: [['Sales', 'Support', 'Regional only'], 'Last month'],
      }),
    ).resolves.toEqual({
      content:
        'User answered:\nWhich subjects?: Sales, Support, Regional only\nWhich period?: Last month',
      answers: [['Sales', 'Support', 'Regional only'], 'Last month'],
      isError: false,
    });
  });

  it('trims answers', async () => {
    await expect(
      resumeWith(
        { answers: ['  Inventory\nWarehouses only '] },
        questions.slice(0, 1),
      ),
    ).resolves.toEqual(
      expect.objectContaining({ answers: ['Inventory\nWarehouses only'] }),
    );
  });

  it.each([
    null,
    'Sales',
    ['Sales', 'Last month'],
    { answers: [] },
    { answers: ['Sales'] },
    { answers: ['Sales', ' '] },
    { answers: [[], 'Last month'] },
    { answers: ['Sales', 'Last month', 'Extra'] },
  ])(
    'rejects missing, empty, and malformed answers: %j',
    async (resumeData) => {
      await expect(resumeWith(resumeData)).resolves.toEqual(
        expect.objectContaining({ isError: true }),
      );
    },
  );
});
