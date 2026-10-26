/** @jest-environment jsdom */
import { render, screen, within } from '@testing-library/react';
import type { UIMessage } from 'ai';
import type { ReactNode } from 'react';
import { I18nextProvider } from 'react-i18next';

import { AgentTurnActivity } from '../components/AgentTurnActivity';
import {
  agentTurnActivity,
  buildAgentTurnLayout,
} from '../utils/agentTurnTimeline';
import { initAgentI18n, readCommonLocale } from './support/agentI18n';

jest.mock('erxes-ui', () => {
  const Wrapper = ({ children }: { children?: ReactNode }) => <>{children}</>;
  return {
    Collapsible: Object.assign(Wrapper, {
      Trigger: Wrapper,
      Content: Wrapper,
    }),
    cn: (...values: unknown[]) => values.filter(Boolean).join(' '),
  };
});
jest.mock('../components/TextWithAgentReferences', () => ({
  TextWithAgentReferences: ({ text }: { text: string }) => <>{text}</>,
}));

type TPart = UIMessage['parts'][number];

let callId = 0;
const graphql = (query: string, state = 'output-available'): TPart => {
  callId += 1;
  return {
    type: 'dynamic-tool',
    toolName: 'callGraphql',
    toolCallId: `call-${callId}`,
    state,
    input: { query },
    ...(state === 'output-available' ? { output: { data: {} } } : {}),
  } as TPart;
};
const typeLookup = (name: string, state?: string) =>
  graphql(`{ __type(name: "${name}") { name fields { name } } }`, state);
const schemaLookup = () => graphql('{ __schema { queryType { name } } }');
const stepStart: TPart = { type: 'step-start' };
/** The turn's step timeline (the first list; step details hold none). */
const timeline = () => screen.getAllByRole('list')[0];

const renderTurn = (
  locale: 'en' | 'mn',
  parts: TPart[],
  streaming = false,
) => {
  const i18n = initAgentI18n(locale);
  const t = (key: string, defaultValue: string) =>
    i18n.t(`agent.${key}`, defaultValue);
  return render(
    <I18nextProvider i18n={i18n}>
      <AgentTurnActivity
        layout={buildAgentTurnLayout(parts, { streaming })}
        streaming={streaming}
        activity={agentTurnActivity(parts, t)}
      />
    </I18nextProvider>,
  );
};

const lookups = [
  stepStart,
  typeLookup('Deal'),
  typeLookup('Stage'),
  stepStart,
  typeLookup('Pipeline'),
  schemaLookup(),
];

describe.each([
  ['en', readCommonLocale('en').agent],
  ['mn', readCommonLocale('mn').agent],
] as const)('schema look-ups in %s', (locale, strings) => {
  it('shows repeated introspection as one plain step beside real queries', () => {
    renderTurn(locale, [...lookups, graphql('{ deals { _id } }')]);
    const label = String(strings['schema-checked']);

    expect(label).toBeTruthy();
    expect(within(timeline()).getAllByText(label)).toHaveLength(1);
    expect(within(timeline()).getByText('Queried deals')).toBeTruthy();
    expect(screen.queryByText(/^Queried __/)).toBeNull();
    expect(
      screen.getByRole('button', {
        name: String(strings['step-count_other']).replace('{{count}}', '2'),
      }),
    ).toBeTruthy();
  });

  it('summarizes a turn that only read the schema with the plain label', () => {
    renderTurn(locale, lookups);
    const [header] = screen.getAllByRole('button');
    expect(header.textContent).toBe(String(strings['schema-checked']));
  });

  it('says it is checking the schema while a look-up runs', () => {
    renderTurn(
      locale,
      [...lookups.slice(0, 3), typeLookup('Board', 'input-available')],
      true,
    );
    expect(
      screen.getByRole('button', {
        name: String(strings['schema-checking']),
      }),
    ).toBeTruthy();
    expect(
      within(timeline()).getAllByText(
        String(strings['schema-checked']),
      ),
    ).toHaveLength(1);
  });
});

it('keeps look-ups separated by other work as separate steps', () => {
  renderTurn('en', [
    typeLookup('Deal'),
    graphql('{ deals { _id } }'),
    typeLookup('Stage'),
  ]);
  expect(
    within(timeline()).getAllByText(
      'Checked the API schema',
    ),
  ).toHaveLength(2);
  expect(screen.getByRole('button', { name: '3 steps' })).toBeTruthy();
});
