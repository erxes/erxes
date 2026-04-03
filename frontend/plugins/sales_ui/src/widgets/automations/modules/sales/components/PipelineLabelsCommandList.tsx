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
  const { pipelineLabels, loading } = usePipelineLabels({
    variables: {
      searchValue: searchValue,
      pipelineId: pipelineId,
    },
  });
  return (
    <GenericCommandList
      heading="Pipeline Labels"
      items={pipelineLabels || []}
      loading={loading}
      totalCount={pipelineLabels?.length || 0}
      handleFetchMore={() => {}}
      onSelect={onSelect}
      getKey={(label) => label._id || ''}
      renderItem={(label) => <LabelBadge label={label} />}
      selectField={selectField}
    />
  );
};
