import { Filter, useQueryState } from 'erxes-ui';

export const ProjectMilestoneNameFilterView = ({
  queryKey,
}: {
  queryKey?: string;
}) => {
  return (
    <Filter.View filterKey={queryKey || 'projectMilestoneName'} inDialog>
      <Filter.DialogStringView
        filterKey={queryKey || 'projectMilestoneName'}
        label="Project Milestone Name"
      />
    </Filter.View>
  );
};

export const ProjectMilestoneNameFilterBar = ({
  queryKey,
}: {
  queryKey?: string;
}) => {
  const [milestoneName] = useQueryState<string>(
    queryKey || 'projectMilestoneName',
  );

  if (!milestoneName) return null;

  return (
    <Filter.BarButton filterKey={queryKey || 'projectMilestoneName'} inDialog>
      {milestoneName}
    </Filter.BarButton>
  );
};

export const ProjectMilestoneNameFilter = {
  View: ProjectMilestoneNameFilterView,
  Bar: ProjectMilestoneNameFilterBar,
};
