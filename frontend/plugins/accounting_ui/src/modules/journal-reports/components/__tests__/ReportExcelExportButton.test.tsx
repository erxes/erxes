import { MockedProvider, MockedResponse } from '@apollo/client/testing';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ReportExcelExportButton } from '@/journal-reports/components/ReportExcelExportButton';
import { JOURNAL_REPORT_ORGANIZATION_QUERY } from '@/journal-reports/graphql/reportQueries';

const mockExport = jest.fn();
const mockToast = jest.fn();

jest.mock('react-i18next', () => {
  const translate = (key: string) => key;

  return { useTranslation: () => ({ t: translate }) };
});
jest.mock('erxes-ui', () => ({
  Button: ({
    children,
    disabled,
    onClick,
  }: {
    children: React.ReactNode;
    disabled?: boolean;
    onClick?: () => void;
  }) => (
    <button type="button" disabled={disabled} onClick={onClick}>
      {children}
    </button>
  ),
  useQueryState: (key: string) =>
    [
      {
        report: 'tb',
        fromDate: '2026-10-01',
        toDate: '2026-10-31',
      }[key],
    ] as const,
  useToast: () => ({ toast: mockToast }),
}));
jest.mock('jotai', () => ({ useAtomValue: () => null }));
jest.mock('ui-modules', () => ({ currentOrganizationState: {} }));
jest.mock('@/journal-reports/utils/exportJournalReportExcel', () => ({
  exportJournalReportExcel: (...args: unknown[]) => mockExport(...args),
}));

const STRUCTURE_RESPONSE: MockedResponse = {
  request: { query: JOURNAL_REPORT_ORGANIZATION_QUERY },
  delay: 30,
  result: {
    data: {
      structureDetail: { _id: 'company', title: 'Altai Taiga Tour LLC' },
    },
  },
};

const renderButton = () =>
  render(
    <MockedProvider mocks={[STRUCTURE_RESPONSE]} addTypename={false}>
      <ReportExcelExportButton
        reportContainerRef={{ current: document.createElement('div') }}
      />
    </MockedProvider>,
  );

describe('ReportExcelExportButton organization name', () => {
  beforeEach(() => {
    mockExport.mockReset();
    mockExport.mockResolvedValue({});
  });

  it('cannot be clicked while the company name is still loading', () => {
    renderButton();

    const button = screen.getByRole('button', { name: /download-excel/ });
    fireEvent.click(button);

    expect(button).toHaveProperty('disabled', true);
    expect(mockExport).not.toHaveBeenCalled();
  });

  it('writes the Settings → Structure company name into the workbook', async () => {
    renderButton();

    const button = screen.getByRole('button', { name: /download-excel/ });
    await waitFor(() => expect(button).toHaveProperty('disabled', false));
    fireEvent.click(button);

    await waitFor(() => expect(mockToast).toHaveBeenCalled());
    expect(mockExport).toHaveBeenCalledWith(
      expect.any(HTMLDivElement),
      expect.objectContaining({
        organizationName: 'Altai Taiga Tour LLC',
        dateRange: '2026-10-01 - 2026-10-31',
      }),
    );
  });
});
