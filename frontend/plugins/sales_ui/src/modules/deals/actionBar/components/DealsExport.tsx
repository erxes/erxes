import { useSearchParams } from 'react-router-dom';
import { Can, Export } from 'ui-modules';
import { getDealsQueryVariables } from '@/deals/utils/queryVariables';

type DealsExportProps = {
  ids?: string[];
  buttonVariant?: 'outline' | 'secondary';
};

/**
 * Exports the deals the page is showing: the selected rows when `ids` is
 * given, otherwise every deal matching the current pipeline and filters.
 */
export const DealsExport = ({
  ids,
  buttonVariant = 'outline',
}: DealsExportProps) => {
  const [searchParams] = useSearchParams();
  /** The list's current filters, without sorting, so the export matches the page. */
  const getFilters = () => {
    const filters = getDealsQueryVariables(searchParams);
    // Sorting only shapes the list view; the export reads in `_id` order.
    delete filters.orderBy;

    const pipelineId = searchParams.get('pipelineId');
    const stageId = searchParams.get('stageId');

    return {
      ...filters,
      ...(pipelineId ? { pipelineId } : {}),
      ...(stageId ? { stageId } : {}),
    };
  };

  return (
    <Can action="dealsExportManage">
      <Export
        pluginName="sales"
        moduleName="sales"
        collectionName="deals"
        buttonVariant={buttonVariant}
        ids={ids}
        getFilters={ids?.length ? undefined : getFilters}
      />
    </Can>
  );
};
