import { Button, Tabs, useQueryState } from 'erxes-ui';

import GeneralForm from '@/deals/boards/components/detail/GeneralForm';
import PipelineConfig from './PipelineConfig';
import PipelineStages from './PipelineStages';

type Props = {
  form: any;
  stagesLoading: boolean;
};

export const PipelineForm = ({ form, stagesLoading }: Props) => {
  const [tab, setTab] = useQueryState<'general' | 'stages' | 'productConfig'>(
    'tab',
  );
  const [pipelineId, setPipelineId] = useQueryState<string | null>(
    'pipelineId',
  );

  return (
    <Tabs
      value={tab || 'general'}
      onValueChange={setTab}
      className="flex flex-col h-full shadow-none"
    >
      <Tabs.List className="flex justify-center">
        <Tabs.Trigger value="general">General</Tabs.Trigger>
        <Tabs.Trigger value="stages">Stages</Tabs.Trigger>
        <Tabs.Trigger value="productConfig">Product config</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="general" className="h-full py-4 px-5 overflow-auto">
        <GeneralForm form={form} />
      </Tabs.Content>
      <Tabs.Content value="stages" className="h-full py-4 px-5 overflow-auto">
        <PipelineStages form={form} stagesLoading={stagesLoading} />
      </Tabs.Content>
      <Tabs.Content
        value="productConfig"
        className="h-full py-4 px-5 overflow-auto"
      >
        <PipelineConfig form={form} />
      </Tabs.Content>
    </Tabs>
  );
};
