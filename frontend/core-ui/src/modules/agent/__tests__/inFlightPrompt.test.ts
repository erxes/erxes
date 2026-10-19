import { pageSelectionsPart } from '../pageSelections';
import { agentsFilesPart } from '../agentsFiles';
import {
  decodeInFlightPrompt,
  encodeInFlightPrompt,
  inFlightPromptMatches,
} from '../inFlightPrompt';

it('preserves legacy text-only prompt storage', () => {
  const parts = [{ type: 'text' as const, text: 'hello' }];
  expect(encodeInFlightPrompt(parts)).toBe('hello');
  expect(decodeInFlightPrompt('hello')).toEqual(parts);
});

it('restores attachment chips during a live run', () => {
  const files = agentsFilesPart([
    { name: 'notes.txt', url: 'notes-key', type: 'text/plain', size: 5 },
  ]);
  const encoded = encodeInFlightPrompt([
    { type: 'text', text: 'hello' },
    files,
  ]);
  expect(decodeInFlightPrompt(encoded)).toEqual([
    { type: 'text', text: 'hello' },
    files,
  ]);
});

it('does not treat two file-only prompts with different files as the same turn', () => {
  const first = [
    { type: 'text' as const, text: 'Uploaded files' },
    agentsFilesPart([
      { name: 'a.txt', url: 'a-key', type: 'text/plain', size: 1 },
    ]),
  ];
  const second = [
    { type: 'text' as const, text: 'Uploaded files' },
    agentsFilesPart([
      { name: 'b.txt', url: 'b-key', type: 'text/plain', size: 1 },
    ]),
  ];
  expect(inFlightPromptMatches(second, { role: 'user', parts: first })).toBe(
    false,
  );
});

const selection = {
  id: '47b58525-fceb-48ee-9262-dcd040c63bb2',
  title: 'Төгсжаргалант мандал ХХК',
  path: '/contacts/companies',
  text: 'Company information',
  width: 240,
  height: 80,
  snapshot: { url: 'selection.png', type: 'image/png' as const, size: 68 },
};

it('restores typed page context during reconnect without manufacturing a file attachment', () => {
  const parts = [
    { type: 'text' as const, text: 'Explain this company' },
    pageSelectionsPart([selection]),
  ];
  const restored = decodeInFlightPrompt(encodeInFlightPrompt(parts));
  expect(restored).toEqual(parts);
  expect(restored.some((part) => part.type === 'data-agents-files')).toBe(
    false,
  );
  expect(inFlightPromptMatches(restored, { role: 'user', parts })).toBe(true);
  expect(
    inFlightPromptMatches(restored, {
      role: 'user',
      parts: [
        parts[0],
        pageSelectionsPart([
          { ...selection, id: 'bf74b228-950a-4cce-b886-fe02079ade64' },
        ]),
      ],
    }),
  ).toBe(false);
});
