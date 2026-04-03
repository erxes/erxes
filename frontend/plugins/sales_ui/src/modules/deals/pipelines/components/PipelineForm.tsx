import { Button, Tabs } from 'erxes-ui';

import GeneralForm from '@/deals/boards/components/detail/GeneralForm';
import PipelineStages from './PipelineStages';
import ProductConfig from '@/deals/cards/components/detail/product/components/ProductConfig';
import { useLocation } from 'react-router-dom';

type Props = {
  form: any;
  stagesLoading: boolean;
};

export const PipelineForm = ({ form, stagesLoading }: Props) => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const defaultTab = searchParams.get('tab') || 'general';

  return (
    <Tabs
      defaultValue={defaultTab}
      className="flex flex-col h-full shadow-none"
    >
      <Tabs.List className="flex justify-center">
        <Tabs.Trigger asChild value="general">
          <Button
            variant={'outline'}
            className="bg-transparent data-[state=active]:bg-background data-[state=inactive]:shadow-none"
          >
            General
          </Button>
        </Tabs.Trigger>
        <Tabs.Trigger asChild value="stages">
          <Button
            variant={'outline'}
            className="bg-transparent data-[state=active]:bg-background data-[state=inactive]:shadow-none"
          >
            Stages
          </Button>
        </Tabs.Trigger>
        <Tabs.Trigger asChild value="productConfig">
          <Button
            variant={'outline'}
            className="bg-transparent data-[state=active]:bg-background data-[state=inactive]:shadow-none"
          >
            Product config
          </Button>
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
        <ProductConfig form={form} />
      </Tabs.Content>
    </Tabs>
  );
};
