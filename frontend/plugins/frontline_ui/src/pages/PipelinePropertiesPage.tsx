import { PipelineCreateFormLayout } from '@/pipelines/components/PipelineCreateFormLayout';
import { useParams } from 'react-router-dom';

// The ticket detail follows from this: create form fields first, then every
// other field Settings → Properties marks visible.
export const PipelinePropertiesPage = () => {
  const { pipelineId } = useParams<{ pipelineId: string }>();

  return (
    <div className="flex flex-col gap-5">
      <PipelineCreateFormLayout pipelineId={pipelineId} />
    </div>
  );
};
