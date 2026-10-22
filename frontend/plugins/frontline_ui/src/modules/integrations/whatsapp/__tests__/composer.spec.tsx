import { useQuery } from '@apollo/client';
import { act, render, screen } from '@testing-library/react';
import { WhatsappMessageInputWrapper } from '../WhatsappMessageInputWrapper';
import { getWhatsappAttachmentMaximumBytes } from '../attachmentLimits';

jest.mock('@apollo/client', () => ({
  ...jest.requireActual('@apollo/client'),
  useQuery: jest.fn(),
}));
jest.mock('erxes-ui', () => ({
  useQueryState: () => ['conversation-1'],
}));
jest.mock('../translations', () => ({
  useWhatsappTranslation: () => ({ t: (key: string) => key }),
}));

const HOUR = 60 * 60 * 1000;
const NOW = new Date('2026-10-19T12:00:00Z').getTime();

const withMessages = (
  messages: { customerId?: string; internal?: boolean; createdAt: number }[],
) =>
  jest.mocked(useQuery).mockReturnValue({
    data: {
      conversationMessages: messages.map((message, index) => ({
        _id: `message-${index}`,
        ...message,
        createdAt: new Date(message.createdAt).toISOString(),
      })),
    },
  } as never);

const renderComposer = () =>
  render(
    <WhatsappMessageInputWrapper>
      <textarea aria-label="composer" />
    </WhatsappMessageInputWrapper>,
  );

beforeEach(() => {
  jest.useFakeTimers();
  jest.setSystemTime(NOW);
});

afterEach(() => {
  jest.useRealTimers();
});

describe('WhatsappMessageInputWrapper', () => {
  it('keeps the plain composer inside the 24-hour window', () => {
    withMessages([{ customerId: 'customer-1', createdAt: NOW - 23 * HOUR }]);

    renderComposer();

    expect(screen.queryByText('windowClosedTitle')).toBeNull();
    expect(screen.getByLabelText('composer')).toBeTruthy();
  });

  it('warns once the window closes, measured from the customer and not agent replies', () => {
    withMessages([
      { customerId: 'customer-1', createdAt: NOW - 30 * HOUR },
      { createdAt: NOW - HOUR },
      { customerId: 'customer-1', internal: true, createdAt: NOW - HOUR },
    ]);

    renderComposer();

    expect(screen.getByText('windowClosedTitle')).toBeTruthy();
    // Internal notes still work, so the composer stays.
    expect(screen.getByLabelText('composer')).toBeTruthy();
  });

  it('shows the warning when the window closes while the conversation is open', () => {
    withMessages([
      { customerId: 'customer-1', createdAt: NOW - 24 * HOUR + 1000 },
    ]);

    renderComposer();
    expect(screen.queryByText('windowClosedTitle')).toBeNull();

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(screen.getByText('windowClosedTitle')).toBeTruthy();
  });

  it('does not warn when the customer message is not on the loaded page', () => {
    withMessages([{ createdAt: NOW - 48 * HOUR }]);

    renderComposer();

    expect(screen.queryByText('windowClosedTitle')).toBeNull();
  });
});

describe('getWhatsappAttachmentMaximumBytes', () => {
  it('follows the media type the backend sends the file as', () => {
    const MB = 1024 * 1024;

    expect(getWhatsappAttachmentMaximumBytes('image/jpeg')).toBe(5 * MB);
    expect(getWhatsappAttachmentMaximumBytes('IMAGE/PNG')).toBe(5 * MB);
    expect(getWhatsappAttachmentMaximumBytes('video/mp4')).toBe(16 * MB);
    expect(getWhatsappAttachmentMaximumBytes('audio/ogg')).toBe(16 * MB);
    // Sent as documents, so the document limit applies.
    expect(getWhatsappAttachmentMaximumBytes('image/gif')).toBe(100 * MB);
    expect(getWhatsappAttachmentMaximumBytes('application/pdf')).toBe(100 * MB);
  });
});
