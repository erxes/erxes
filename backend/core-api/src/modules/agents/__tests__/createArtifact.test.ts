import {
  buildCreateArtifactTool,
  createAgentsArtifact,
  AGENTS_ARTIFACT_MAX_CONTENT,
} from '../createArtifact';

it.each(['html', 'xlsx', 'docx', 'pdf'] as const)(
  'creates a versioned %s file result with a safe filename',
  (type) => {
    const result = createAgentsArtifact({
      type,
      title: '../Sales: report?',
      content: 'Complete content',
    });
    expect(result).toEqual({
      kind: 'artifact',
      version: 1,
      artifact: {
        type,
        title: '../Sales: report?',
        filename: `Sales-report.${type}`,
        content: 'Complete content',
      },
    });
    expect(JSON.parse(JSON.stringify(result))).toEqual(result);
  },
);

it('preserves non-Latin report titles', () => {
  expect(
    createAgentsArtifact({
      type: 'html',
      title: 'Борлуулалтын тайлан',
      content: '<p>20</p>',
    }).artifact.filename,
  ).toBe('Борлуулалтын-тайлан.html');
});

it.each([
  { type: 'exe', title: 'Report', content: 'text' },
  { type: 'html', title: ' ', content: 'text' },
  { type: 'html', title: 'Report', content: ' ' },
  {
    type: 'html',
    title: 'Report',
    content: 'x'.repeat(AGENTS_ARTIFACT_MAX_CONTENT + 1),
  },
])('rejects unsupported or incomplete deliverables', (input) => {
  expect(() =>
    createAgentsArtifact(input as Parameters<typeof createAgentsArtifact>[0]),
  ).toThrow();
});

it('executes through the installed Mastra tool contract', async () => {
  const tool = await buildCreateArtifactTool();
  expect(tool.id).toBe('createArtifact');
  const result = await tool.execute?.({
    type: 'html',
    title: 'Sales',
    content: '<p>20</p>',
  });
  expect(result).toMatchObject({
    kind: 'artifact',
    version: 1,
    artifact: { filename: 'Sales.html' },
  });
});
