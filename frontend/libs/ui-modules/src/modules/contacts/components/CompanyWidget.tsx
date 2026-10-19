import { Button, Separator, SideMenu, Spinner } from 'erxes-ui';
import {
  IconBuilding,
  IconBuildingCog,
  IconCaretDownFilled,
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';

import { CompaniesInline } from './CompaniesInline';
import { SelectCompaniesBulk } from './SelectCompaniesBulk';
import { useCompanyDetail } from '../hooks/useCompanyDetail';

interface CompanyWidgetProps {
  companyIds: string[];
  scope: string;
  onManageCompanies?: (companyIds: string[]) => void;
}

const CompanyWidgetItem = ({
  companyId,
  scope,
}: {
  companyId: string;
  scope: string;
}) => {
  const navigate = useNavigate();

  const { companyDetail, loading } = useCompanyDetail(
    {
      variables: {
        _id: companyId,
      },
    },
    true,
  );
  const { primaryEmail, primaryPhone } = companyDetail || {};

  if (loading) {
    return (
      <Spinner containerClassName="py-6 bg-background rounded-lg shadow-xs" />
    );
  }

  return (
    <CompaniesInline.Provider companies={companyDetail ? [companyDetail] : []}>
      <div className="bg-background rounded-lg shadow-xs">
        <div className="p-3 space-y-2">
          <div className="flex items-center gap-2">
            <CompaniesInline.Avatar size="xl" />
            <CompaniesInline.Title />
          </div>
          <div className="text-sm text-accent-foreground flex items-center gap-2 justify-between">
            Company phone
            <span className="text-foreground">{primaryPhone || '-'}</span>
          </div>
          <div className="text-sm text-accent-foreground flex items-center gap-2 justify-between">
            Company email
            <span className="text-foreground">{primaryEmail || '-'}</span>
          </div>
        </div>
        <Separator />
        <div className="py-1 px-3">
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-accent-foreground"
            onClick={() =>
              navigate(`/contacts/companies?companyId=${companyId}`)
            }
          >
            View details
            <IconCaretDownFilled />
          </Button>
        </div>
      </div>
    </CompaniesInline.Provider>
  );
};

const CompanyWidgetContent = ({
  companyIds,
  scope,
  updateCompanyIds,
}: {
  companyIds: string[];
  scope: string;
  updateCompanyIds?: (companyIds: string[]) => void;
}) => {
  if (!companyIds || companyIds.length === 0) {
    return <div className="p-4">No companies found</div>;
  }

  return (
    <div className="p-4 space-y-2">
      {companyIds.map((companyId: string) => {
        return (
          <CompanyWidgetItem
            key={companyId}
            companyId={companyId}
            scope={scope}
          />
        );
      })}
    </div>
  );
};

const CompanyWidgetHeader = ({
  companyIds,
  onManageCompanies,
}: {
  companyIds?: string[];
  onManageCompanies?: (companyIds: string[]) => void;
}) => {
  return (
    <SideMenu.Header label="Companies" Icon={IconBuilding} className="px-4">
      {onManageCompanies && (
        <SelectCompaniesBulk
          onSelect={onManageCompanies}
          companyIds={companyIds}
        >
          <Button variant="ghost" size="sm">
            <IconBuildingCog className="h-4 w-4" />
          </Button>
        </SelectCompaniesBulk>
      )}
    </SideMenu.Header>
  );
};

export const CompanyWidget = ({
  companyIds,
  scope,
  onManageCompanies,
}: CompanyWidgetProps) => {
  return (
    <SideMenu.Content
      value="company"
      className="bg-sidebar data-[state=active]:w-full data-[state=active]:border-l-0"
    >
      <CompanyWidgetHeader
        companyIds={companyIds}
        onManageCompanies={onManageCompanies}
      />
      <CompanyWidgetContent companyIds={companyIds} scope={scope} />
    </SideMenu.Content>
  );
};

export const CompanyWidgetTrigger = () => (
  <SideMenu.Trigger value="company" label="Companies" Icon={IconBuilding} />
);
