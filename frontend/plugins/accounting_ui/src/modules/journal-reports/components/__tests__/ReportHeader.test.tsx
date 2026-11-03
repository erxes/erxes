import { MockedProvider, MockedResponse } from '@apollo/client/testing';
import { render, screen, waitFor } from '@testing-library/react';
import { ReportHeader } from '@/journal-reports/components/ReportHeader';
import { JOURNAL_REPORT_ORGANIZATION_QUERY } from '@/journal-reports/graphql/reportQueries';

let mockOrganization: { name?: string; type?: string } | null = null;

jest.mock('react-i18next', () => {
  const t = (key: string) => key;

  return { useTranslation: () => ({ t }) };
});
jest.mock('erxes-ui', () => ({
  Separator: () => <hr />,
  useQueryState: (key: string) =>
    [
      {
        report: 'tb',
        fromDate: '2026-10-01',
        toDate: '2026-10-31',
      }[key],
    ] as const,
}));
jest.mock('jotai', () => ({ useAtomValue: () => mockOrganization }));
jest.mock('ui-modules', () => ({ currentOrganizationState: {} }));
jest.mock('@/journal-reports/components/ReportExcelExportButton', () => ({
  ReportExcelExportButton: () => null,
}));

const structureResponse = (title: string | null): MockedResponse => ({
  request: { query: JOURNAL_REPORT_ORGANIZATION_QUERY },
  result: {
    data: {
      structureDetail: title === null ? null : { _id: 'company', title },
    },
  },
});

const failingStructureResponse: MockedResponse = {
  request: { query: JOURNAL_REPORT_ORGANIZATION_QUERY },
  error: new Error('Login required'),
};

const renderHeader = (mocks: MockedResponse[]) =>
  render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <ReportHeader reportContainerRef={{ current: null }} />
    </MockedProvider>,
  );

const organizationLine = () =>
  screen.getByText('organization-name').parentElement?.firstElementChild;

describe('ReportHeader organization name', () => {
  beforeEach(() => {
    mockOrganization = { type: 'os' };
  });

  it('prints the company name from Settings → Structure on a self-hosted install', async () => {
    renderHeader([structureResponse('Altai Taiga Tour LLC')]);

    expect(await screen.findByText('Altai Taiga Tour LLC')).toBeTruthy();
    expect(screen.queryByText('OrgName')).toBeNull();
  });

  it('falls back to the SaaS organization name when the structure has no title', async () => {
    mockOrganization = { name: 'Nomad Trading' };
    renderHeader([structureResponse('   ')]);

    expect(await screen.findByText('Nomad Trading')).toBeTruthy();
  });

  it('leaves a blank line to sign by hand when no company name is configured', async () => {
    renderHeader([structureResponse(null)]);

    await screen.findByText('2026-10-01 - 2026-10-31');
    expect(screen.queryByText('OrgName')).toBeNull();
    expect(organizationLine()?.textContent).toBe('');
  });

  it('does not print a fake name when the structure request fails', async () => {
    renderHeader([failingStructureResponse]);

    await waitFor(() => expect(organizationLine()?.textContent).toBe(''));
    expect(screen.queryByText('OrgName')).toBeNull();
  });
});
