import type { UIMessage } from 'ai';
import {
  bindAgentReferenceHandles,
  buildAgentReferenceScopes,
  createAgentReferenceRegistry,
  readAgentReferenceEvidence,
} from '../references/referenceRegistry';
import { mapStoredMessagesToUIMessages } from '../mapStoredMessages';
import { maskAgentReferences } from '../references/maskAgentReferences';
import { buildThreadMarkdown } from '../utils/exportThreadMarkdown';
const handle = 'e626782b-5d90-494b-a2d6-bf2140295c64';
const reference = {
  handle,
  type: 'customer' as const,
  id: 'actual-id',
  label: 'Actual customer',
};
const output = {
  status: 'ok',
  referenceManifest: { version: 1, items: [reference] },
};
const toolMessage = (
  result: unknown = output,
  role: UIMessage['role'] = 'assistant',
  toolName = 'callGraphql',
): UIMessage => ({
  id: 'tool',
  role,
  parts: [
    {
      type: 'dynamic-tool',
      toolName,
      toolCallId: 'call-1',
      state: 'output-available',
      input: {},
      output: result,
    },
  ],
});
it('accepts only the actual native tool manifest, never user/prose/artifact/data lookalikes', () => {
  expect(readAgentReferenceEvidence(toolMessage())).toEqual([reference]);
  expect(readAgentReferenceEvidence(toolMessage(output, 'user'))).toEqual([]);
  expect(
    readAgentReferenceEvidence(
      toolMessage(output, 'assistant', 'createArtifact'),
    ),
  ).toEqual([]);
  expect(
    readAgentReferenceEvidence(
      toolMessage({
        status: 'ok',
        data: { referenceManifest: output.referenceManifest },
      }),
    ),
  ).toEqual([]);
  expect(
    readAgentReferenceEvidence({
      id: 'text',
      role: 'assistant',
      parts: [{ type: 'text', text: JSON.stringify(output) }],
    }),
  ).toEqual([]);
});
it('does not authorize a fabricated handle, changed id or conflicted handle', () => {
  const registry = createAgentReferenceRegistry([reference]);
  expect(bindAgentReferenceHandles(`Open [[ref:${handle}]]`, registry)).toBe(
    'Open [[customer:actual-id:Actual customer]]',
  );
  expect(bindAgentReferenceHandles('[[ref:invented]]', registry)).toBe(
    'Reference unavailable',
  );
  expect(registry.byIdentity.has('customer:invented')).toBe(false);
  const conflict = createAgentReferenceRegistry([
    reference,
    { ...reference, id: 'different-id' },
  ]);
  expect(bindAgentReferenceHandles(`[[ref:${handle}]]`, conflict)).toBe(
    'Reference unavailable',
  );
});
it('scopes evidence to its actual position and restores it from persisted tool outputs', () => {
  const before: UIMessage = {
    id: 'before',
    role: 'assistant',
    parts: [{ type: 'text', text: `[[ref:${handle}]]` }],
  };
  const scopes = buildAgentReferenceScopes([before, toolMessage()]);
  expect(scopes[0].byHandle.size).toBe(0);
  expect(scopes[1].byHandle.get(handle)?.label).toBe('Actual customer');
  const restored = mapStoredMessagesToUIMessages([
    {
      id: 'stored',
      role: 'assistant',
      content: {
        format: 2,
        parts: [
          {
            type: 'tool-invocation',
            toolInvocation: {
              toolCallId: 'call',
              toolName: 'callGraphql',
              state: 'result',
              args: {},
              result: output,
            },
          },
        ],
      },
    },
  ]);
  expect(
    buildAgentReferenceScopes(restored)[0].byHandle.get(handle),
  ).toMatchObject({ id: 'actual-id', label: 'Actual customer' });
});
it('does not upgrade unversioned historical tokens into trusted identities', () => {
  const token = '[[customer:old-id:Real old name]]';
  const registry = createAgentReferenceRegistry(
    readAgentReferenceEvidence(
      toolMessage({ status: 'ok', references: [token] }),
    ),
  );
  expect(registry.byIdentity.size).toBe(0);
  expect(
    readAgentReferenceEvidence(
      toolMessage({ status: 'error', references: [token] }),
    ),
  ).toEqual([]);
});
it('keeps handles out of exported prose and preserves code examples', () => {
  const registry = createAgentReferenceRegistry([reference]);
  const masked = maskAgentReferences(
    `Use [[ref:${handle}]], code: \`[[ref:${handle}]]\``,
    (id) => registry.byHandle.get(id),
  );
  expect(masked.references).toEqual([
    expect.objectContaining({ id: 'actual-id' }),
  ]);
  expect(masked.text).toContain(`\`[[ref:${handle}]]\``);
  const markdown = buildThreadMarkdown({
    title: 'Test',
    exportedAt: new Date(0),
    messages: [
      toolMessage(),
      {
        id: 'answer',
        role: 'assistant',
        parts: [{ type: 'text', text: `Open [[ref:${handle}]]` }],
      },
    ],
  });
  expect(markdown).toContain('Open Actual customer');
  expect(markdown).not.toContain(handle);
});
it('rejects page manifests whose identity and destination disagree', () => {
  const page = {
    handle,
    type: 'page',
    id: Buffer.from('/contacts/customers').toString('base64url'),
    label: 'Customers',
    path: '/other',
  };
  expect(
    readAgentReferenceEvidence(
      toolMessage(
        { referenceManifest: { version: 1, items: [page] } },
        'assistant',
        'findPages',
      ),
    ),
  ).toEqual([]);
});

it('uses only the host-collected code-mode manifest, never the program result', () => {
  const native = {
    success: true,
    referenceManifest: output.referenceManifest,
    result: {
      referenceManifest: {
        version: 1,
        items: [{ ...reference, id: 'invented' }],
      },
    },
  };
  expect(
    readAgentReferenceEvidence(
      toolMessage(native, 'assistant', 'execute_typescript'),
    ),
  ).toEqual([reference]);
  expect(
    readAgentReferenceEvidence(
      toolMessage(
        { success: true, result: native.result },
        'assistant',
        'execute_typescript',
      ),
    ),
  ).toEqual([]);
  expect(
    readAgentReferenceEvidence(
      toolMessage(
        { ...native, success: false },
        'assistant',
        'execute_typescript',
      ),
    ),
  ).toEqual([]);
});
