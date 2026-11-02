import { useGetTicketStatusesByPipeline } from '@/status/hooks/useGetTicketStatus';

export const useTicketStatusChecklist = ({
  pipelineId,
  value,
  onChange,
}: {
  pipelineId?: string;
  value: string[];
  onChange: (statusIds: string[]) => void;
}) => {
  const { statuses, loading } = useGetTicketStatusesByPipeline({
    variables: { pipelineId },
    skip: !pipelineId,
  });
  const ids = statuses.map(({ value: id }) => id);
  const pickedCount = ids.filter((id) => value.includes(id)).length;

  return {
    statuses,
    loading,
    allState:
      pickedCount && pickedCount === ids.length
        ? true
        : pickedCount
        ? ('indeterminate' as const)
        : false,
    toggleAll: () => onChange(pickedCount === ids.length ? [] : ids),
    toggle: (id: string, checked: boolean) =>
      onChange(
        checked ? [...value, id] : value.filter((picked) => picked !== id),
      ),
  };
};
