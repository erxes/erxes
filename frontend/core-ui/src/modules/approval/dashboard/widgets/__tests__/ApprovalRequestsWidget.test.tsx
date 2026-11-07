/** @jest-environment jsdom */
import { fireEvent, render, screen } from '@testing-library/react';
import { type ReactNode } from 'react';
import { ApprovalRequestsWidget } from '../ApprovalRequestsWidget';

const mockOpenRecord = jest.fn();
jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
jest.mock('react-router-dom', () => ({
  Link: ({ children }: { children: ReactNode }) => <span>{children}</span>,
}));
jest.mock('erxes-ui', () => ({
  Badge: ({ children }: { children: ReactNode }) => <span>{children}</span>,
  Button: ({ children }: { children: ReactNode }) => (
    <button>{children}</button>
  ),
  RelativeDateDisplay: { Value: () => <span>Today</span> },
}));
jest.mock('ui-modules', () => ({
  useSidePanel: () => ({ openRecord: mockOpenRecord }),
  usePermissionCheck: () => ({
    isLoaded: true,
    hasModulePermission: () => false,
  }),
  DashboardWidgetCard: ({ children }: { children: ReactNode }) => (
    <section>{children}</section>
  ),
  DashboardWidgetEmptyState: () => null,
  DashboardWidgetListSkeleton: () => null,
}));
jest.mock('@/approval/dashboard/hooks/useApprovalDashboardRequests', () => ({
  useApprovalDashboardRequests: () => ({
    list: [
      {
        _id: 'request-1',
        contentType: 'core:customer',
        content: { label: 'Approve customer' },
        status: 'pending',
        requester: { email: 'owner@example.test' },
        decisions: [],
        createdAt: '2026-11-01',
      },
    ],
    loading: false,
    userId: 'user-1',
  }),
}));

it('opens the selected approval through the shared record navigator', () => {
  render(<ApprovalRequestsWidget config={{ scope: 'toDecide' }} />);
  fireEvent.click(screen.getByRole('button', { name: /Approve customer/ }));
  expect(mockOpenRecord).toHaveBeenCalledWith({
    contentType: 'core:approvalRequest',
    contentId: 'request-1',
  });
});
