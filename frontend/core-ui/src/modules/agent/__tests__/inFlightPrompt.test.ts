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
