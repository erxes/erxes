import {
  CompaniesInlineContext,
  useCompaniesInlineContext,
} from '../contexts/CompaniesInlineContext';
import {
  Avatar,
  AvatarProps,
  Badge,
  cn,
  Combobox,
  isUndefinedOrNull,
  Tooltip,
} from 'erxes-ui';
import { ICompany } from '../types';
import { useEffect, useState } from 'react';
import { useCompaniesInline } from '../hooks/useCompanies';

interface CompaniesInlineProviderProps {
  children: React.ReactNode;
  companyIds?: string[];
  companies?: ICompany[];
  placeholder?: string;
  updateCompanies?: (companies: ICompany[]) => void;
}

const CompaniesInlineProvider = ({
  children,
  placeholder,
  companyIds,
  companies,
  updateCompanies,
}: CompaniesInlineProviderProps) => {
  const [_companies, _setCompanies] = useState<ICompany[]>(companies || []);

  return (
    <CompaniesInlineContext.Provider
      value={{
        companies: companies || _companies,
        loading: false,
        placeholder: isUndefinedOrNull(placeholder)
          ? 'Select Companies'
          : placeholder,
        updateCompanies: updateCompanies || _setCompanies,
      }}
    >
      <Tooltip.Provider>{children}</Tooltip.Provider>
      {companyIds?.some(
        (id) => !companies?.some((company) => company._id === id),
      ) && (
        <CompanyInlineEffectComponent
          companyIdsWithNoDetails={companyIds.filter(
            (id) => !companies?.some((company) => company._id === id),
          )}
        />
      )}
    </CompaniesInlineContext.Provider>
  );
};

const CompanyInlineEffectComponent = ({
  companyIdsWithNoDetails,
}: {
  companyIdsWithNoDetails: string[];
}) => {
  const { updateCompanies, companies } = useCompaniesInlineContext();
  const { companies: detailMissingCompanies } = useCompaniesInline({
    variables: {
      ids: companyIdsWithNoDetails,
    },
  });

  useEffect(() => {
    if (detailMissingCompanies && detailMissingCompanies.length > 0) {
      const existingCompaniesMap = new Map(
        companies.map((company) => [company._id, company]),
      );
      const newCompanies = detailMissingCompanies.filter(
        (company) => !existingCompaniesMap.has(company._id),
      );

      if (newCompanies.length > 0) {
        updateCompanies?.([...companies, ...newCompanies]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detailMissingCompanies, updateCompanies, companyIdsWithNoDetails]);

  return null;
};

const CompaniesInlineAvatar = ({ className, ...props }: AvatarProps) => {
  const { companies, loading, companyIds } = useCompaniesInlineContext();

  if (loading)
    return (
      <div className="flex -space-x-1.5">
        {companyIds?.map((companyId) => (
          <Avatar key={companyId} className={cn('bg-background', className)}>
            <Avatar.Fallback />
          </Avatar>
        ))}
      </div>
    );

  const renderAvatar = (company: ICompany) => {
    const { avatar, primaryName } = company;

    return (
      <Tooltip delayDuration={100}>
        <Tooltip.Trigger asChild>
          <Avatar
            key={company._id}
            className={cn(
              'bg-background',
              companies.length > 1 && 'ring-2 ring-background',
              className,
            )}
            size="lg"
            {...props}
          >
            <Avatar.Image src={avatar} />
            <Avatar.Fallback>{primaryName?.charAt(0) || ''}</Avatar.Fallback>
          </Avatar>
        </Tooltip.Trigger>
        <Tooltip.Content>
          <p>{primaryName}</p>
        </Tooltip.Content>
      </Tooltip>
    );
  };

  if (companies.length === 0) return null;

  if (companies.length === 1) return renderAvatar(companies[0]);

  const withAvatar = companies.slice(0, companies.length > 3 ? 2 : 3);
  const restMembers = companies.slice(withAvatar.length);

  return (
    <div className="flex -space-x-1.5">
      {withAvatar.map(renderAvatar)}
      {restMembers.length > 0 && (
        <Tooltip delayDuration={100}>
          <Tooltip.Trigger asChild>
            <Avatar
              key={restMembers[0]._id}
              className={cn('ring-2 ring-background bg-background', className)}
              {...props}
              size="lg"
            >
              <Avatar.Fallback className="bg-primary/10 text-primary">
                +{restMembers.length}
              </Avatar.Fallback>
            </Avatar>
          </Tooltip.Trigger>
          <Tooltip.Content>
            <p>{restMembers.map((c) => c.primaryName).join(', ')}</p>
          </Tooltip.Content>
        </Tooltip>
      )}
    </div>
  );
};
CompaniesInlineAvatar.displayName = 'CompaniesInline.Avatar';

const CompaniesInlineTitle = () => {
  const { companies, loading, placeholder } = useCompaniesInlineContext();

  const getDisplayValue = () => {
    if (companies.length === 0) return undefined;

    if (companies.length === 1) {
      if (!companies[0].primaryName) {
        return;
      }
      return companies[0].primaryName;
    }

    return `${companies.length} companies`;
  };

  return (
    <Combobox.Value
      value={getDisplayValue()}
      loading={loading}
      placeholder={placeholder}
    />
  );
};
CompaniesInlineTitle.displayName = 'CompaniesInline.Title';

const CompaniesInlineRoot = ({
  companyIds,
  companies,
  placeholder,
  updateCompanies,
}: Omit<CompaniesInlineProviderProps, 'children'>) => {
  return (
    <CompaniesInlineProvider
      companyIds={companyIds}
      companies={companies}
      placeholder={placeholder}
      updateCompanies={updateCompanies}
    >
      <CompaniesInlineAvatar />
      <CompaniesInlineTitle />
    </CompaniesInlineProvider>
  );
};

const CompanyNameBadges = ({
  ...props
}: React.ComponentProps<typeof Badge>) => {
  const { companies } = useCompaniesInlineContext();
  return (
    <div className="flex gap-2 flex-wrap">
      {companies.map((company) => (
        <Badge key={company._id} {...props}>
          {company.primaryName}
        </Badge>
      ))}
    </div>
  );
};
CompanyNameBadges.displayName = 'CompaniesInline.CompanyNameBadges';

const CompaniesInlineWithBadges = ({
  companyIds,
  companies,
  placeholder,
  updateCompanies,
  badgeClassName,
  badgeVariant,
}: Omit<CompaniesInlineProviderProps, 'children'> & {
  badgeClassName?: string;
  badgeVariant?:
    | 'default'
    | 'destructive'
    | 'secondary'
    | 'success'
    | 'warning';
}) => {
  return (
    <CompaniesInlineProvider
      companyIds={companyIds}
      companies={companies}
      placeholder={placeholder}
      updateCompanies={updateCompanies}
    >
      <CompanyNameBadges className={badgeClassName} variant={badgeVariant} />
    </CompaniesInlineProvider>
  );
};
CompaniesInlineWithBadges.displayName = 'CompaniesInline.WithBadges';

const CompaniesInlineWithoutAvatar = ({
  companyIds,
  companies,
  placeholder,
  updateCompanies,
}: Omit<CompaniesInlineProviderProps, 'children'>) => {
  return (
    <CompaniesInlineProvider
      companyIds={companyIds}
      companies={companies}
      placeholder={placeholder}
      updateCompanies={updateCompanies}
    >
      <CompaniesInlineTitle />
    </CompaniesInlineProvider>
  );
};

CompaniesInlineWithoutAvatar.displayName = 'CompaniesInline.WithoutAvatar';

export const CompaniesInline = Object.assign(CompaniesInlineRoot, {
  Provider: CompaniesInlineProvider,
  Avatar: CompaniesInlineAvatar,
  Title: CompaniesInlineTitle,
  Badges: CompaniesInlineWithBadges,
  WithoutAvatar: CompaniesInlineWithoutAvatar,
});
