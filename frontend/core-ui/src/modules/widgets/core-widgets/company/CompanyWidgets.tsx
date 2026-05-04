import { Button, Spinner } from 'erxes-ui';
import {
  CompanyWidget,
  IRelationWidgetProps,
  SelectCompaniesBulk,
  useManageRelations,
  useRelations,
} from 'ui-modules';
import { IconBuildingSkyscraper, IconPlus } from '@tabler/icons-react';

export const CompanyWidgets = ({
  contentId,
  contentType,
  companyId,
}: IRelationWidgetProps) => {
  const { manageRelations } = useManageRelations();
  const { ownEntities, loading } = useRelations({
    variables: {
      contentId,
      contentType,
      relatedContentType: 'core:company',
    },
    skip: companyId ? true : false,
  });

  const handleSelectCompanies = (companyIds: string[]) => {
    manageRelations({ contentType, contentId, relatedContentType: 'core:company', relatedContentIds: companyIds })
  };

  if (loading) {
    return <Spinner className="size-4" />;
  }

  const companyIds = companyId
    ? [companyId]
    : ownEntities?.map((entity) => entity.contentId);

  if (ownEntities?.length === 0) {
    return (
      <div className="flex flex-auto flex-col gap-4 justify-center items-center text-muted-foreground">
        <div className="border border-dashed p-6 bg-background rounded-xl">
          <IconBuildingSkyscraper />
        </div>
        <span className="text-sm">No companies to display at the moment.</span>
        <SelectCompaniesBulk onSelect={handleSelectCompanies}>
          <Button variant="outline" size="sm">
            <IconPlus className="mr-2 h-4 w-4" />
            Add Company
          </Button>
        </SelectCompaniesBulk>
      </div>
    );
  }

  return (
    <CompanyWidget
      companyIds={companyIds}
      scope=" "
      onManageCompanies={handleSelectCompanies}
    />
  );
};
