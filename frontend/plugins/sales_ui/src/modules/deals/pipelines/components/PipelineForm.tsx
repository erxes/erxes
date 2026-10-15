import { Button, Tabs, useQueryState } from 'erxes-ui';
import GeneralForm from '@/deals/boards/components/detail/GeneralForm';
import { PipelineStages } from './PipelineStages';
import { ProductConfig } from '@/deals/cards/components/detail/product/components/ProductConfig';
import { useTranslation } from 'react-i18next';
import type { TPipelineForm } from '@/deals/types/pipelines';
import type { UseFormReturn } from 'react-hook-form';
import {
  relationSettingsModuleKey,
  useRelationSettingsModules,
} from 'ui-modules';
import { PipelineAutomations } from './PipelineAutomations';
import { PipelineRelationSettings } from './PipelineRelationSettings';
import { PipelinePropertySelector } from './PipelinePropertySelector';

type Props = {
  form: UseFormReturn<TPipelineForm>;
  stagesLoading: boolean;
  // Only a saved pipeline has deals for automations to run on.
  pipelineId?: string | null;
};

export const PipelineForm = ({ form, stagesLoading, pipelineId }: Props) => {
  const { t } = useTranslation('sales');
  const [activeTab, setActiveTab] = useQueryState<string>('tab');
  // Other plugins' tabs, e.g. loyalty's, keyed `pluginName.name`.
  const modules = useRelationSettingsModules();
  const relationModules = pipelineId ? modules : [];

  return (
    <Tabs
      value={activeTab || 'general'}
      onValueChange={setActiveTab}
      className="flex flex-col h-full shadow-none"
    >
      <Tabs.List className="flex justify-center">
        <Tabs.Trigger asChild value="general">
          <Button
            variant={'outline'}
            className="bg-transparent data-[state=active]:bg-background data-[state=inactive]:shadow-none"
          >
            {t('general')}
          </Button>
        </Tabs.Trigger>
        <Tabs.Trigger asChild value="stages">
          <Button
            variant={'outline'}
            className="bg-transparent data-[state=active]:bg-background data-[state=inactive]:shadow-none"
          >
            {t('stages')}
          </Button>
        </Tabs.Trigger>
        <Tabs.Trigger asChild value="productConfig">
          <Button
            variant={'outline'}
            className="bg-transparent data-[state=active]:bg-background data-[state=inactive]:shadow-none"
          >
            {t('product-config')}
          </Button>
        </Tabs.Trigger>
        <Tabs.Trigger asChild value="properties">
          <Button
            variant={'outline'}
            className="bg-transparent data-[state=active]:bg-background data-[state=inactive]:shadow-none"
          >
            {t('properties')}
          </Button>
        </Tabs.Trigger>
        {pipelineId && (
          <Tabs.Trigger asChild value="automations">
            <Button
              variant={'outline'}
              className="bg-transparent data-[state=active]:bg-background data-[state=inactive]:shadow-none"
            >
              {t('pos-automations', 'Automations')}
            </Button>
          </Tabs.Trigger>
        )}
        {relationModules.map((module) => (
          <Tabs.Trigger
            key={relationSettingsModuleKey(module)}
            asChild
            value={relationSettingsModuleKey(module)}
          >
            <Button
              variant={'outline'}
              className="bg-transparent data-[state=active]:bg-background data-[state=inactive]:shadow-none"
            >
              {module.label || module.name}
            </Button>
          </Tabs.Trigger>
        ))}
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
      <Tabs.Content
        value="properties"
        className="h-full py-4 px-5 overflow-auto"
      >
        <PipelinePropertySelector form={form} />
      </Tabs.Content>
      {pipelineId && (
        <Tabs.Content value="automations" className="h-full overflow-auto">
          <PipelineAutomations
            pipelineId={pipelineId}
            pipelineName={form.watch('name')}
          />
        </Tabs.Content>
      )}
      {pipelineId &&
        relationModules.map((module) => (
          <Tabs.Content
            key={relationSettingsModuleKey(module)}
            value={relationSettingsModuleKey(module)}
            className="h-full overflow-auto py-6"
          >
            <PipelineRelationSettings
              moduleKey={relationSettingsModuleKey(module)}
              pipelineId={pipelineId}
              pipelineName={form.watch('name')}
            />
          </Tabs.Content>
        ))}
    </Tabs>
  );
};
