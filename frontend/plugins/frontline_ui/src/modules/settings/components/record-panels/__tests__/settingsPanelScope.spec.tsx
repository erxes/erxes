import { render, screen } from '@testing-library/react';
import type { ComponentType, PropsWithChildren } from 'react';
import type { IRecordPanelProps } from 'ui-modules';
import { PipelineRecordPanel } from '../PipelineRecordPanel';
import { ResponseTemplateRecordPanel } from '../ResponseTemplateRecordPanel';
import { TicketConfigRecordPanel } from '../TicketConfigRecordPanel';
import { TicketStatusRecordPanel } from '../TicketStatusRecordPanel';
import {
  SettingsPanelContext,
  useSettingsParams,
} from '@/settings/contexts/SettingsPanelContext';

interface ScopeDefaults {
  channelId?: string;
  pipelineId?: string;
  statusType?: number;
}
let mockDrafts: Record<string, ScopeDefaults>;
let mockRoute: { id?: string; pipelineId?: string };
let mockPipeline: { _id: string; name: string; channelId: string } | undefined;
let mockResponse: { _id: string; name: string; channelId: string } | undefined;
let mockConfig:
  | { id: string; name: string; channelId: string; pipelineId: string }
  | undefined;
let mockStatus:
  | { _id: string; name: string; pipelineId: string; type: number }
  | undefined;
const mockPipelineQuery = jest.fn<void, [string | undefined]>();
const mockStatusTypeQuery = jest.fn<void, [number]>();

const MockScopeSnapshot = ({
  formChannelId,
  statusType,
}: {
  formChannelId?: string;
  statusType?: number;
}) => {
  const scope = useSettingsParams();
  return (
    <output aria-label="Resolved scope">
      {JSON.stringify({
        channelId: scope.id,
        pipelineId: scope.pipelineId,
        formChannelId,
        statusType,
      })}
    </output>
  );
};

jest.mock('react-router-dom', () => ({
  useParams: () => mockRoute,
  Link: ({ children }: PropsWithChildren) => <span>{children}</span>,
}));
jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
jest.mock('erxes-ui', () => {
  const Container = ({ children }: PropsWithChildren) => <div>{children}</div>;
  return {
    Button: 'button',
    Empty: Object.assign(Container, {
      Header: Container,
      Content: Container,
      Title: Container,
      Description: Container,
    }),
    ScrollArea: Container,
    Spinner: Container,
    Skeleton: Container,
    Tabs: Object.assign(Container, {
      List: Container,
      Trigger: Container,
      Content: Container,
    }),
  };
});
jest.mock('ui-modules', () => ({
  useSidePanelDraft: (contentType: string) => mockDrafts[contentType] ?? {},
  useSidePanel: () => ({
    back: jest.fn(),
    close: jest.fn(),
    canGoBack: false,
    openRecord: jest.fn(),
    setTab: jest.fn(),
  }),
  ActivityLogs: () => null,
  getSidePanelRecordPath: ({
    contentType,
    contentId,
  }: {
    contentType: string;
    contentId: string;
  }) => `/detail/${contentType}/${contentId}`,
}));
jest.mock('@/settings/components/SettingsPanelForm', () => ({
  SettingsPanelForm: ({ children }: PropsWithChildren) => <div>{children}</div>,
}));
jest.mock('@/pipelines/hooks/useGetPipeline', () => ({
  useGetPipeline: (id?: string) => {
    mockPipelineQuery(id);
    return { pipeline: mockPipeline, loading: false };
  },
}));
jest.mock('@/responseTemplate/hooks/useGetRespone', () => ({
  useGetResponse: () => ({ response: mockResponse, loading: false }),
}));
jest.mock(
  '@/pipelines/components/configs/hooks/useGetTicketConfigDetail',
  () => ({
    useGetTicketConfigDetail: () => ({
      ticketConfigDetail: mockConfig,
      loading: false,
    }),
  }),
);
jest.mock('@/status/hooks/useGetTicketStatus', () => ({
  useGetTicketStatusById: () => ({ status: mockStatus, loading: false }),
  useGetTicketStatus: (type: number) => {
    mockStatusTypeQuery(type);
    return { statuses: mockStatus ? [mockStatus] : [], loading: false };
  },
}));
jest.mock('@/pipelines/components/CreatePipeline', () => ({
  CreatePipelinePanelForm: ({ channelId }: { channelId: string }) => (
    <MockScopeSnapshot formChannelId={channelId} />
  ),
}));
jest.mock('@/responseTemplate/components/ResponseDetail', () => ({
  ResponseTemplateEditor: ({ channelId }: { channelId: string }) => (
    <MockScopeSnapshot formChannelId={channelId} />
  ),
}));
jest.mock('@/pipelines/components/configs/components/CreateConfig', () => ({
  TicketConfigEditor: () => <MockScopeSnapshot />,
}));
jest.mock('@/status/components/StatusSheet', () => ({
  StatusPanelForm: ({ statusType }: { statusType: number }) => (
    <MockScopeSnapshot statusType={statusType} />
  ),
}));
jest.mock('~/pages/PipelineDetailPage', () => ({
  PipelineDetailPage: () => <MockScopeSnapshot />,
}));
jest.mock('~/pages/PipelinePropertiesPage', () => ({
  PipelinePropertiesPage: () => <MockScopeSnapshot />,
}));

const panels: {
  label: string;
  Panel: ComponentType<IRecordPanelProps>;
  contentType: string;
  encodedId: string;
  encodedScope: ScopeDefaults & { formChannelId?: string };
}[] = [
  {
    label: 'pipeline',
    Panel: PipelineRecordPanel,
    contentType: 'frontline:pipeline',
    encodedId: 'new~encoded-channel',
    encodedScope: {
      channelId: 'encoded-channel',
      formChannelId: 'encoded-channel',
    },
  },
  {
    label: 'response',
    Panel: ResponseTemplateRecordPanel,
    contentType: 'frontline:response-template',
    encodedId: 'new~encoded-channel',
    encodedScope: {
      channelId: 'encoded-channel',
      formChannelId: 'encoded-channel',
    },
  },
  {
    label: 'configuration',
    Panel: TicketConfigRecordPanel,
    contentType: 'frontline:ticket-config',
    encodedId: 'new~encoded-channel~encoded-pipeline',
    encodedScope: {
      channelId: 'encoded-channel',
      pipelineId: 'encoded-pipeline',
    },
  },
  {
    label: 'status',
    Panel: TicketStatusRecordPanel,
    contentType: 'frontline:ticket-status',
    encodedId: 'new~encoded-pipeline~4',
    encodedScope: { pipelineId: 'encoded-pipeline', statusType: 4 },
  },
];
const readScope = async (): Promise<unknown> =>
  JSON.parse(
    (await screen.findByLabelText('Resolved scope')).textContent ?? '{}',
  );

beforeEach(() => {
  mockRoute = { id: 'route-channel', pipelineId: 'route-pipeline' };
  mockDrafts = Object.fromEntries(
    panels.map(({ contentType }) => [
      contentType,
      {
        channelId: 'draft-channel',
        pipelineId: 'draft-pipeline',
        statusType: 2,
      },
    ]),
  );
  mockPipeline = undefined;
  mockResponse = undefined;
  mockConfig = undefined;
  mockStatus = undefined;
  mockPipelineQuery.mockClear();
  mockStatusTypeQuery.mockClear();
});

test.each(panels)(
  'encoded $label scope overrides stale draft and host-route defaults',
  async ({ Panel, contentType, encodedId, encodedScope }) => {
    render(
      <Panel contentType={contentType} contentId={encodedId} view="detail" />,
    );
    expect(await readScope()).toMatchObject(encodedScope);
  },
);

test.each(panels)(
  'a plain new $label uses draft defaults before the host route',
  async ({ Panel, contentType, label }) => {
    render(<Panel contentType={contentType} contentId="new" view="new" />);
    const expected =
      label === 'status'
        ? { pipelineId: 'draft-pipeline', statusType: 2 }
        : label === 'configuration'
          ? { channelId: 'draft-channel', pipelineId: 'draft-pipeline' }
          : { channelId: 'draft-channel', formChannelId: 'draft-channel' };
    expect(await readScope()).toEqual(expected);
  },
);

test.each(panels)(
  'a plain new $label falls back to the host route when no draft exists',
  async ({ Panel, contentType, label }) => {
    mockDrafts = {};
    render(<Panel contentType={contentType} contentId="new" view="new" />);
    const expected =
      label === 'status'
        ? { pipelineId: 'route-pipeline', statusType: 1 }
        : label === 'configuration'
          ? { channelId: 'route-channel', pipelineId: 'route-pipeline' }
          : { channelId: 'route-channel', formChannelId: 'route-channel' };
    expect(await readScope()).toEqual(expected);
  },
);

test('a saved pipeline section queries its real ID and supplies its own scope', async () => {
  mockPipeline = {
    _id: 'saved-pipeline',
    name: 'Saved',
    channelId: 'saved-channel',
  };
  render(
    <PipelineRecordPanel
      contentType="frontline:pipeline"
      contentId="saved-pipeline~properties"
      view="detail"
    />,
  );
  expect(await readScope()).toEqual({
    channelId: 'saved-channel',
    pipelineId: 'saved-pipeline',
  });
  expect(mockPipelineQuery).toHaveBeenCalledWith('saved-pipeline');
});

test('a saved response supplies its own channel instead of stale defaults', async () => {
  mockResponse = {
    _id: 'saved-response',
    name: 'Saved',
    channelId: 'saved-channel',
  };
  render(
    <ResponseTemplateRecordPanel
      contentType="frontline:response-template"
      contentId="saved-response"
      view="detail"
    />,
  );
  expect(await readScope()).toEqual({
    channelId: 'saved-channel',
    formChannelId: 'saved-channel',
  });
});

test('a saved configuration supplies its own channel and pipeline', async () => {
  mockConfig = {
    id: 'saved-config',
    name: 'Saved',
    channelId: 'saved-channel',
    pipelineId: 'saved-pipeline',
  };
  render(
    <TicketConfigRecordPanel
      contentType="frontline:ticket-config"
      contentId="saved-config"
      view="detail"
    />,
  );
  expect(await readScope()).toEqual({
    channelId: 'saved-channel',
    pipelineId: 'saved-pipeline',
  });
});

test('a saved status supplies its own pipeline and category', async () => {
  mockStatus = {
    _id: 'saved-status',
    name: 'Saved',
    pipelineId: 'saved-pipeline',
    type: 6,
  };
  render(
    <TicketStatusRecordPanel
      contentType="frontline:ticket-status"
      contentId="saved-status"
      view="detail"
    />,
  );
  expect(await readScope()).toEqual({
    pipelineId: 'saved-pipeline',
    statusType: 6,
  });
  expect(mockStatusTypeQuery).toHaveBeenCalledWith(6);
});

test.each(['1.5', '0', '7', 'invalid'])(
  'an invalid encoded status category %s uses the default category',
  async (category) => {
    mockDrafts = {};
    render(
      <TicketStatusRecordPanel
        contentType="frontline:ticket-status"
        contentId={`new~encoded-pipeline~${category}`}
        view="detail"
      />,
    );
    expect(await readScope()).toEqual({
      pipelineId: 'encoded-pipeline',
      statusType: 1,
    });
  },
);

test.each([
  {
    scope: { channelId: 'panel-channel' },
    expected: { channelId: 'panel-channel' },
  },
  {
    scope: { pipelineId: 'panel-pipeline' },
    expected: { pipelineId: 'panel-pipeline' },
  },
])(
  'an explicit panel context does not borrow missing scope from the host route',
  async ({ scope, expected }) => {
    render(
      <SettingsPanelContext.Provider value={scope}>
        <MockScopeSnapshot />
      </SettingsPanelContext.Provider>,
    );
    expect(await readScope()).toEqual(expected);
  },
);
