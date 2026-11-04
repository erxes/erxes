import type { ComponentProps, PropsWithChildren } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { TicketFields } from '@/ticket/components/ticket-detail/TicketFields';
import type { ITicketDetail } from '@/ticket/types';
import { TicketPanelDetail } from '~/widgets/record-panel/TicketPanelDetail';

const mockUpdateTicket = jest.fn();
const mockSelect = ({ disabled }: { disabled?: boolean }) => (
  <button disabled={disabled}>Select</button>
);
const mockPipeline: {
  _id: string;
  userId: string;
  memberIds: string[];
  visibility: string;
} = {
  _id: 'pipeline-1',
  userId: 'owner-1',
  memberIds: [],
  visibility: 'public',
};
const mockStatus: {
  _id: string;
  memberIds: string[];
  canEditMemberIds: string[];
  canMoveMemberIds: string[];
  visibilityType: string;
} = {
  _id: 'status-1',
  memberIds: [],
  canEditMemberIds: ['other-user'],
  canMoveMemberIds: [],
  visibilityType: 'public',
};
let mockPipelineLoading = false;
let mockStatusLoading = false;
let mockPipelineError: Error | undefined;
let mockStatusError: Error | undefined;
let mockStatusMissing = false;

jest.mock('@/pipelines/hooks/useGetPipeline', () => ({
  useGetPipeline: () => ({
    pipeline: mockPipeline,
    loading: mockPipelineLoading,
    error: mockPipelineError,
  }),
}));
jest.mock('@/status/hooks/useGetTicketStatus', () => ({
  useGetTicketStatusById: () => ({
    status: mockStatusMissing ? undefined : mockStatus,
    loading: mockStatusLoading,
    error: mockStatusError,
  }),
}));
jest.mock('@/ticket/hooks/useUpdateTicket', () => ({
  useUpdateTicket: () => ({ updateTicket: mockUpdateTicket, loading: false }),
}));
jest.mock('@/ticket/components/attachments/AttachmentUploader', () => ({
  AttachmentUploader: () => (
    <>
      <button>Add attachments</button>
      <button onClick={() => mockUpdateTicket()}>Remove attachment</button>
    </>
  ),
}));
jest.mock('@/activity/components/ActivityList', () => ({
  ActivityList: () => null,
}));
jest.mock(
  '@/ticket/components/ticket-selects/SelectAssignedMembersTicket',
  () => ({
    SelectAssignedMembersTicket: (props: { disabled?: boolean }) =>
      mockSelect(props),
  }),
);
jest.mock('@/ticket/components/ticket-selects/SelectAssigneeTicket', () => ({
  SelectAssigneeTicket: (props: { disabled?: boolean }) => mockSelect(props),
}));
jest.mock('@/ticket/components/ticket-selects/SelectBranchTicket', () => ({
  SelectBranchTicket: (props: { disabled?: boolean }) => mockSelect(props),
}));
jest.mock('@/ticket/components/ticket-selects/SelectChannel', () => ({
  SelectChannel: (props: { disabled?: boolean }) => mockSelect(props),
}));
jest.mock('@/ticket/components/ticket-selects/SelectDateTicket', () => ({
  formatDateLabel: jest.requireActual<
    typeof import('@/ticket/components/ticket-selects/SelectDateTicket')
  >('@/ticket/components/ticket-selects/SelectDateTicket').formatDateLabel,
  SelectDateTicket: (props: { disabled?: boolean }) => mockSelect(props),
}));
jest.mock('@/ticket/components/ticket-selects/SelectDepartmentTicket', () => ({
  SelectDepartmentTicket: (props: { disabled?: boolean }) => mockSelect(props),
}));
jest.mock('@/ticket/components/ticket-selects/SelectPipeline', () => ({
  SelectPipeline: (props: { disabled?: boolean }) => mockSelect(props),
}));
jest.mock('@/ticket/components/ticket-selects/SelectPriorityTicket', () => ({
  SelectPriorityTicket: (props: { disabled?: boolean }) => mockSelect(props),
}));
jest.mock('@/ticket/components/ticket-selects/SelectStatusTicket', () => ({
  SelectStatusTicket: (props: { disabled?: boolean }) => mockSelect(props),
}));
jest.mock('@/ticket/components/ticket-selects/SelectTagsTicket', () => ({
  SelectTagsTicket: (props: { disabled?: boolean }) => mockSelect(props),
}));
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => fallback ?? key,
  }),
}));
jest.mock('ui-modules', () => {
  const { atom } = jest.requireActual<typeof import('jotai')>('jotai');
  const Container = ({ children }: PropsWithChildren) => <div>{children}</div>;
  return {
    currentUserState: atom({ _id: 'user-1' }),
    ContactRecordChip: () => null,
    PanelField: Container,
    PanelDescriptionField: () => null,
    useSidePanel: () => ({ openRecord: jest.fn() }),
  };
});
jest.mock('erxes-ui', () => {
  const Container = ({ children }: PropsWithChildren) => <div>{children}</div>;
  const Dialog = Object.assign(Container, {
    Trigger: Container,
    Content: Container,
  });
  return {
    Button: ({
      asChild,
      children,
      ...props
    }: ComponentProps<'button'> & { asChild?: boolean }) =>
      asChild ? children : <button {...props}>{children}</button>,
    Dialog,
    Popover: Container,
    Combobox: {
      ChipTrigger: ({
        children,
        disabled,
      }: PropsWithChildren<{ disabled?: boolean }>) => (
        <button disabled={disabled}>{children}</button>
      ),
    },
    ScrollArea: Container,
    Tooltip: Object.assign(Container, {
      Trigger: Container,
      Content: Container,
    }),
    TextField: ({ value, disabled }: { value: string; disabled?: boolean }) => (
      <input value={value} disabled={disabled} readOnly />
    ),
    Input: (props: ComponentProps<'input'>) => <input {...props} />,
    Editor: () => null,
    BlockEditor: () => null,
    Separator: () => null,
    useBlockEditor: () => ({ document: undefined }),
    useConfirm: () => ({ confirm: jest.fn() }),
    formatBytes: (size: number) => `${size} bytes`,
    getFileIcon: () => null,
    readImage: (url: string) =>
      url.startsWith('http') ? url : `/read-file?key=${url}`,
    getCloudflareStreamBase: (url: string) =>
      url.startsWith('https://customer-test.cloudflarestream.com/video-id/')
        ? 'https://customer-test.cloudflarestream.com/video-id'
        : null,
    cn: (...classes: (string | boolean | undefined)[]) =>
      classes.filter(Boolean).join(' '),
  };
});

const ticket: ITicketDetail = {
  _id: 'ticket-1',
  name: 'Ticket name',
  pipelineId: 'pipeline-1',
  statusId: 'status-1',
  assigneeId: 'user-1',
  attachments: [
    {
      url: 'document.pdf',
      name: 'Document',
      type: 'application/pdf',
      size: 12,
      duration: null,
    },
  ],
  description: null,
  priority: null,
  labelIds: null,
  tagIds: null,
  assignedMembers: null,
  userId: null,
  startDate: null,
  targetDate: null,
  createdAt: null,
  createdBy: null,
  updatedAt: null,
  channelId: null,
  branchId: null,
  departmentId: null,
  statusChangedDate: null,
  number: null,
  state: null,
  propertiesData: null,
  customerId: null,
  companyId: null,
  isSubscribed: null,
};

beforeEach(() => {
  jest.clearAllMocks();
  mockPipeline.visibility = 'public';
  mockPipelineLoading = false;
  mockStatusLoading = false;
  mockPipelineError = undefined;
  mockStatusError = undefined;
  mockStatusMissing = false;
  mockStatus.canEditMemberIds = ['other-user'];
});

describe.each([
  ['record panel', TicketPanelDetail],
  ['legacy detail', TicketFields],
] as const)('%s attachments', (_name, Detail) => {
  it('shows downloadable attachments without upload or removal for a readonly status', () => {
    render(<Detail ticket={ticket} />);
    expect(
      screen.queryByRole('button', { name: 'Add attachments' }),
    ).toBeNull();
    expect(
      screen.queryByRole('button', { name: /Remove attachment/ }),
    ).toBeNull();
    expect(
      screen.getByRole('link', { name: /Document/ }).getAttribute('href'),
    ).toBe('/read-file?key=document.pdf');
    expect(mockUpdateTicket).not.toHaveBeenCalled();
  });

  it.each([
    'pipeline loading',
    'status loading',
    'pipeline error',
    'status error',
    'status missing',
  ])('keeps editing disabled during %s', (state) => {
    mockStatus.canEditMemberIds = [];
    mockPipelineLoading = state === 'pipeline loading';
    mockStatusLoading = state === 'status loading';
    mockPipelineError =
      state === 'pipeline error' ? new Error('Unavailable') : undefined;
    mockStatusError =
      state === 'status error' ? new Error('Unavailable') : undefined;
    mockStatusMissing = state === 'status missing';
    render(<Detail ticket={ticket} />);
    expect(screen.getByRole<HTMLInputElement>('textbox').disabled).toBe(true);
    expect(
      screen.queryByRole('button', { name: 'Add attachments' }),
    ).toBeNull();
  });

  it('allows the assigned user to edit a private pipeline when the status allows it', () => {
    mockPipeline.visibility = 'private';
    mockStatus.canEditMemberIds = ['user-1'];
    render(<Detail ticket={ticket} />);
    expect(screen.getByRole<HTMLInputElement>('textbox').disabled).toBe(false);
    expect(
      screen.getByRole('button', { name: 'Add attachments' }),
    ).toBeTruthy();
  });

  it('keeps external media covered until reveal and preserves Cloudflare playback', () => {
    const { container } = render(
      <Detail
        ticket={{
          ...ticket,
          attachments: [
            {
              url: 'https://media.test/image.jpg',
              name: 'Customer image',
              type: 'image',
              size: 1,
              duration: null,
            },
            {
              url: 'https://media.test/audio.mp3',
              name: 'Customer audio',
              type: 'audio',
              size: 1,
              duration: null,
            },
            {
              url: 'https://customer-test.cloudflarestream.com/video-id/manifest/video.m3u8',
              name: 'Customer video',
              type: 'video/mp4',
              size: 1,
              duration: null,
            },
          ],
        }}
      />,
    );
    expect(container.querySelector('img, audio, video, iframe')).toBeNull();
    const reveal = screen.getAllByRole('button', { name: /Show/ });
    expect(reveal).toHaveLength(3);
    reveal.forEach((button) => fireEvent.click(button));
    expect(screen.getAllByAltText('Customer image').length).toBeGreaterThan(0);
    expect(container.querySelector('audio')?.getAttribute('src')).toBe(
      'https://media.test/audio.mp3',
    );
    const player = container.querySelector<HTMLIFrameElement>(
      'iframe[title="Customer video"]',
    );
    expect(player?.getAttribute('src')).toBe(
      'https://customer-test.cloudflarestream.com/video-id/iframe',
    );
    expect(player?.getAttribute('sandbox')).toBe(
      'allow-scripts allow-same-origin allow-presentation',
    );
    expect(player?.hasAttribute('allowfullscreen')).toBe(true);
    expect(mockUpdateTicket).not.toHaveBeenCalled();
  });
});

it('restores the editable uploader after permissions reload without enabling it during loading', () => {
  mockStatus.canEditMemberIds = ['user-1'];
  const { rerender } = render(<TicketPanelDetail ticket={ticket} />);
  expect(screen.getByRole('button', { name: 'Add attachments' })).toBeTruthy();
  mockStatusLoading = true;
  rerender(<TicketPanelDetail ticket={ticket} />);
  expect(screen.queryByRole('button', { name: 'Add attachments' })).toBeNull();
  mockStatusLoading = false;
  rerender(<TicketPanelDetail ticket={ticket} />);
  expect(screen.getByRole('button', { name: 'Add attachments' })).toBeTruthy();
});

it('preserves the existing read-only status changed date in the record panel', () => {
  render(
    <TicketPanelDetail
      ticket={{ ...ticket, statusChangedDate: '2024-10-09T00:00:00.000Z' }}
    />,
  );
  expect(
    screen.getByRole<HTMLButtonElement>('button', { name: 'Oct 9, 2024' })
      .disabled,
  ).toBe(true);
  fireEvent.click(screen.getByRole('button', { name: 'Oct 9, 2024' }));
  expect(mockUpdateTicket).not.toHaveBeenCalled();
});

it('shows the empty status changed date as a locked unspecified chip', () => {
  render(<TicketPanelDetail ticket={ticket} />);
  expect(
    screen.getByRole<HTMLButtonElement>('button', { name: 'not-specified' })
      .disabled,
  ).toBe(true);
});

it.each([
  'http://customer-test.cloudflarestream.com/video-id/manifest/video.m3u8',
  'https://evil.test/video-id/iframe',
  'https://customer-test.cloudflarestream.com.evil.test/video-id/iframe',
  'https://user:password@customer-test.cloudflarestream.com/video-id/iframe',
  'https://customer-test.cloudflarestream.com:444/video-id/iframe',
])('does not embed an untrusted Stream URL: %s', (url) => {
  const { container } = render(
    <TicketPanelDetail
      ticket={{
        ...ticket,
        attachments: [
          {
            url,
            name: 'Untrusted video',
            type: 'video/mp4',
            size: 1,
            duration: null,
          },
        ],
      }}
    />,
  );
  expect(container.querySelector('iframe')).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: /Show/ }));
  expect(container.querySelector('iframe')).toBeNull();
  expect(container.querySelector('video')?.getAttribute('src')).toBe(url);
});
