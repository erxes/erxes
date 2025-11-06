import { Button, Tabs, useQueryState } from 'erxes-ui';
import GeneralForm from '@/deals/boards/components/detail/GeneralForm';
import PipelineConfig from './PipelineConfig';
import PipelineStages from './PipelineStages';

type Props = {
  form: any;
  stagesLoading: boolean;
};

export const PipelineForm = ({ form, stagesLoading }: Props) => {
  const [tab = 'general', setTab] = useQueryState('tab');

  const tabButton =
    'bg-transparent shadow-none hover:shadow-none focus:shadow-none data-[state=active]:bg-background';

  return (
    <Tabs
      value={tab}
      onValueChange={setTab}
      className="flex flex-col h-full shadow-none"
    >
      <Tabs.List className="flex justify-center">
        <Tabs.Trigger asChild value="general">
          <button variant="outline" className={tabButton}>
            General
          </button>
        </Tabs.Trigger>

        <Tabs.Trigger asChild value="stages">
          <button variant="outline" className={tabButton}>
            Stages
          </button>
        </Tabs.Trigger>

        <Tabs.Trigger asChild value="productConfig">
          <button variant="outline" className={tabButton}>
            Product config
          </button>
        </Tabs.Trigger>
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
