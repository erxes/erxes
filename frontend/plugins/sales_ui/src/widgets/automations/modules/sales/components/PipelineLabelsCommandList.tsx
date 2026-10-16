import { useTranslation } from 'react-i18next';
import { GenericCommandList } from 'ui-modules';
import { LabelBadge } from '~/modules/deals/components/common/filters/LabelBadge';
import { usePipelineLabels } from '~/modules/deals/pipelines/hooks/usePipelineDetails';

export const PipelineLabelsCommandList = ({
  searchValue,
  pipelineId,
  onSelect,
  selectField = '_id',
}: {
  searchValue: string;
  pipelineId: string;
  onSelect: (value: string) => void;
  selectField?: string;
}) => {
  const { t } = useTranslation('sales');
  const { pipelineLabels, loading } = usePipelineLabels({
    variables: {
      pipelineId: pipelineId,
    },
  });
  return (
    <GenericCommandList
      heading={t('pipeline-labels')}
      items={pipelineLabels || []}
      loading={loading}
      totalCount={pipelineLabels?.length || 0}
      handleFetchMore={() => {
        // This query returns every pipeline label; there is no next page.
      }}
      onSelect={onSelect}
      getKey={(label) => label._id || ''}
      renderItem={(label) => <LabelBadge label={label} />}
      selectField={selectField}
    />
  );
};
