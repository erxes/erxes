import { ConfigList } from '@/pipelines/components/configs/components/ConfigList';
import { CreateConfig } from '@/pipelines/components/configs/components/CreateConfig';
import { ConfigDetails } from '@/pipelines/components/configs/components/ConfigDetails';

export const PipelineConfigsPage = () => {
  return (
    <>
      <ConfigList />
      <CreateConfig />
      <ConfigDetails />
    </>
  );
};
