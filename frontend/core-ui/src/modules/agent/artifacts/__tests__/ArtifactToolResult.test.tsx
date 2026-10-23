/** @jest-environment jsdom */
import { render, screen } from '@testing-library/react';
import { ArtifactToolResult } from '../ArtifactToolResult';
import { readArtifactResult } from '../artifactResult';
import { mapStoredMessagesToUIMessages } from '../../mapStoredMessages';
import { groupAgentWorkSteps } from '../../utils/agentWorkSteps';

jest.mock('../HtmlPreview', () => ({
  HtmlPreview: () => <div>Report preview</div>,
}));
jest.mock('erxes-ui', () => ({ Button: 'button' }));

const output = {
  kind: 'artifact',
  version: 1,
  artifact: {
    type: 'html',
    title: 'Sales',
    filename: 'Sales.html',
    content: '<p>20</p>',
  },
};
const tool = {
  toolName: 'createArtifact',
  toolCallId: 'file-1',
  state: 'output-available',
  output,
};

it('renders actual file controls from a completed tool result', () => {
  render(<ArtifactToolResult tool={tool} />);
  expect(screen.getByText('Report preview')).toBeTruthy();
  expect(
    screen.getByRole('button', { name: 'Download artifact' }),
  ).toBeTruthy();
  expect(screen.getByRole('button', { name: 'View source' })).toBeTruthy();
});

it.each([
  null,
  '<p>Hello</p>',
  { ...output, version: 2 },
  { ...output, artifact: { ...output.artifact, filename: '../Sales.html' } },
  { ...output, artifact: { ...output.artifact, filename: 'Sales.pdf' } },
])('rejects invalid result data', (invalid) => {
  expect(readArtifactResult(invalid)).toBeNull();
  render(<ArtifactToolResult tool={{ ...tool, output: invalid }} />);
  expect(screen.getByRole('alert')).toBeTruthy();
  expect(screen.queryByRole('button')).toBeNull();
});

it('never displays partial tool input as a downloadable file', () => {
  const pending = {
    ...tool,
    state: 'input-streaming',
    input: output.artifact,
    output: undefined,
  };
  const { rerender } = render(
    <ArtifactToolResult tool={pending} isStreaming />,
  );
  expect(screen.queryByRole('status')).toBeNull();
  expect(screen.queryByRole('button')).toBeNull();
  rerender(<ArtifactToolResult tool={pending} />);
  expect(screen.getByRole('alert').textContent).toContain(
    'stopped before completion',
  );
});

it.each(['output-error', 'output-denied'])(
  'shows %s without file controls',
  (state) => {
    render(<ArtifactToolResult tool={{ ...tool, state }} />);
    expect(screen.getByRole('alert')).toBeTruthy();
    expect(screen.queryByRole('button')).toBeNull();
  },
);

it('preserves a structured artifact after history reload and keeps it out of work steps', () => {
  const messages = mapStoredMessagesToUIMessages(
    JSON.parse(
      JSON.stringify([
        {
          id: 'message-1',
          role: 'assistant',
          content: {
            format: 2,
            parts: [
              {
                type: 'tool-invocation',
                toolInvocation: {
                  toolName: 'createArtifact',
                  toolCallId: 'file-1',
                  state: 'result',
                  args: output.artifact,
                  result: output,
                },
              },
            ],
          },
        },
      ]),
    ),
  );
  const items = groupAgentWorkSteps(messages[0].parts);
  expect(items).toHaveLength(1);
  expect(items[0].kind).toBe('part');
  expect(messages[0].parts[0]).toMatchObject({
    type: 'dynamic-tool',
    toolName: 'createArtifact',
    state: 'output-available',
    output,
  });
  const part = messages[0].parts[0];
  if (part.type !== 'dynamic-tool') throw new Error('Expected tool part');
  render(<ArtifactToolResult tool={part} />);
  expect(
    screen.getByRole('button', { name: 'Download artifact' }),
  ).toBeTruthy();
});
