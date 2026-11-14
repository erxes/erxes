import { PipelineCreateFormLayout } from '@/pipelines/components/PipelineCreateFormLayout';
import { useSettingsParams } from '@/settings/contexts/SettingsPanelContext';

// The ticket detail follows from this: create form fields first, then every
// other field Settings → Properties marks visible.
export const PipelinePropertiesPage = () => {
  const { pipelineId } = useSettingsParams();

  return (
    <div className="flex flex-col gap-5">
      <PipelineCreateFormLayout pipelineId={pipelineId} />
    </div>
  );
};
