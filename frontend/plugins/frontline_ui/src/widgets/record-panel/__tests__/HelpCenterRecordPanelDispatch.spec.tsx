import './fixtures/ticketPanelDependencies';
import { render, screen } from '@testing-library/react';
import type { IRecordPanelProps } from 'ui-modules';
import { CONFIG } from '~/config';
import { RecordPanel } from '../RecordPanel';

jest.mock('erxes-ui', () => ({
  Spinner: () => <span>Loading</span>,
  Skeleton: () => null,
}));
jest.mock('ui-modules', () => ({}));
jest.mock('react-router-dom', () => ({ useParams: () => ({}) }));
jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
jest.mock('~/searchProviders', () => ({ SEARCH_PROVIDERS: [] }));
jest.mock('../HelpCenterRecordPanel', () => ({
  HelpCenterRecordPanel: ({
    contentType,
    contentId,
    view,
  }: IRecordPanelProps) => (
    <output>{`${contentType}:${contentId}:${view}`}</output>
  ),
}));

it.each<[string, IRecordPanelProps['view']]>([
  ['frontline:helpcenter', 'new'],
  ['frontline:helpcenter', 'detail'],
  ['frontline:helpcenter', 'activity'],
])('dispatches %s %s', async (contentType, view) => {
  const contentId = view === 'new' ? 'new' : 'record-1';
  render(
    <RecordPanel contentType={contentType} contentId={contentId} view={view} />,
  );
  expect(
    await screen.findByText(`${contentType}:${contentId}:${view}`),
  ).toBeTruthy();
});

it('registers only this module record types', () => {
  expect(CONFIG.widgets?.recordPanels).toEqual(
    expect.arrayContaining([
      {
        contentType: 'frontline:helpcenter',
        properties: false,
        draftTitle: true,
      },
    ]),
  );
});

it('ignores an unsupported content type', () => {
  const { container } = render(
    <RecordPanel
      contentType="other:record"
      contentId="record-1"
      view="detail"
    />,
  );
  expect(container.firstChild).toBeNull();
});
