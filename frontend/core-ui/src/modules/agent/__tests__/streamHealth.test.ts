import {
  AgentsStreamStalledError,
  describeAgentsChatError,
} from '../streamHealth';
import { initAgentI18n, readCommonLocale } from './support/agentI18n';

const interrupted = new Error(
  JSON.stringify({
    error: 'The server restarted while answering. Retry to continue.',
    code: 'AGENTS_RUN_INTERRUPTED',
  }),
);

describe.each(['en', 'mn'] as const)('chat errors in %s', (locale) => {
  const i18n = initAgentI18n(locale);
  const strings = readCommonLocale(locale).agent;
  const t = (key: string, defaultValue: string) =>
    i18n.t(`agent.${key}`, defaultValue);

  it('explains a reply lost to a server restart', () => {
    expect(strings['run-interrupted']).toBeTruthy();
    expect(describeAgentsChatError(interrupted, t)).toBe(
      strings['run-interrupted'],
    );
  });

  it('explains a stream that went silent', () => {
    expect(strings['stream-lost']).toBeTruthy();
    expect(describeAgentsChatError(new AgentsStreamStalledError(), t)).toBe(
      strings['stream-lost'],
    );
  });
});

it('keeps the server text for other failures', () => {
  const t = (_key: string, defaultValue: string) => defaultValue;
  expect(
    describeAgentsChatError(
      new Error(JSON.stringify({ error: 'Add your API key.' })),
      t,
    ),
  ).toBe('Add your API key.');
  expect(describeAgentsChatError(new Error('Rate limited'), t)).toBe(
    'Rate limited',
  );
  expect(describeAgentsChatError(new Error(''), t)).toBe(
    'Something went wrong.',
  );
});
