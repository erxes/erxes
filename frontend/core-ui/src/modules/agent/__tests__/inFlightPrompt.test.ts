import type { UIMessage } from 'ai';
import { pageSelectionsPart } from '../pageSelections';
import { agentsFilesPart } from '../agentsFiles';
import {
  decodeInFlightPrompt,
  encodeInFlightPrompt,
  inFlightPromptMatches,
  encodeInFlightTurn,
  decodeInFlightTurn,
  restoreInFlightTurn,
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

const prompt: UIMessage = {
  id: 'actual-sdk-user-id',
  role: 'user',
  parts: [{ type: 'text', text: 'Sales report in last month' }],
};
const savedUser: UIMessage = {
  ...prompt,
  parts: [
    {
      type: 'text',
      text: '[Page context] The user is viewing /settings/products.',
    },
    ...prompt.parts,
  ],
};
const savedReply: UIMessage = {
  id: 'native-reply',
  role: 'assistant',
  parts: [{ type: 'text', text: 'Saved response' }],
};
it('matches legacy prompt context without inserting the reported second user bubble', () => {
  expect(inFlightPromptMatches(prompt.parts, savedUser)).toBe(true);
  expect(
    restoreInFlightTurn(
      [savedUser, savedReply],
      decodeInFlightTurn('Sales report in last month'),
      'thread',
      true,
    ),
  ).toEqual([savedUser]);
});
it('restores by SDK message identity and replaces the active reply rather than appending a full replay', () => {
  const turn = decodeInFlightTurn(encodeInFlightTurn(prompt));
  expect(turn.id).toBe(prompt.id);
  expect(
    restoreInFlightTurn([savedUser, savedReply], turn, 'thread', true),
  ).toEqual([savedUser]);
  expect(
    restoreInFlightTurn([savedUser, savedReply], turn, 'thread', false),
  ).toEqual([savedUser, savedReply]);
});
it('preserves identical earlier prompts and uses the real pending id before storage catches up', () => {
  const previous = { ...savedUser, id: 'previous-turn' };
  const history = [previous, savedReply];
  const turn = decodeInFlightTurn(encodeInFlightTurn(prompt));
  expect(restoreInFlightTurn(history, turn, 'thread', true)).toEqual([
    ...history,
    prompt,
  ]);
  expect(
    restoreInFlightTurn(
      [...history, savedUser, { ...savedReply, id: 'active-reply' }],
      turn,
      'thread',
      true,
    ),
  ).toEqual([...history, savedUser]);
});
it('does not remove a suspended reply that is waiting for user input', () => {
  expect(
    restoreInFlightTurn(
      [savedUser, savedReply],
      decodeInFlightTurn(encodeInFlightTurn(prompt)),
      'thread',
      false,
    ),
  ).toEqual([savedUser, savedReply]);
});
