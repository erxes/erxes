import { TWorkflowForEachOnItemError } from '@/automations/components/builder/hooks/useWorkflowForEach';
import { useWorkflowNodeContext } from '@/automations/context/WorkflowNodeProvider';
import { Label, Select, Switch } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { PlaceholderInput } from 'ui-modules';

// Runs the workflow once per list item; the item is handed to one of the
// workflow's inputs, so member actions read it as {{ input.<name> }}.
export const WorkflowForEachSection = () => {
  const { t } = useTranslation('automations');
  const { forEach, forEachError, inputNames, toggleForEach, updateForEach } =
    useWorkflowNodeContext();

  return (
    <div className="flex flex-col gap-3 border-b p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h4 className="text-sm font-semibold">
            {t('workflow-for-each-title')}
          </h4>
          <p className="text-xs text-muted-foreground">
            {t('workflow-for-each-description')}
          </p>
        </div>
        <Switch
          checked={!!forEach}
          aria-label={t('workflow-for-each-title')}
          onCheckedChange={toggleForEach}
        />
      </div>

      {forEach && (
        <>
          <div className="flex flex-col gap-1">
            <Label>{t('workflow-for-each-list')}</Label>
            <PlaceholderInput
              value={forEach.items}
              onChange={(items: string) => updateForEach({ items })}
            />
            {forEachError === 'list-required' && (
              <p className="text-xs text-destructive">
                {t('workflow-for-each-list-required')}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <Label>{t('workflow-for-each-item-input')}</Label>
            {inputNames.length ? (
              <Select
                value={forEach.itemInput || undefined}
                onValueChange={(itemInput) => updateForEach({ itemInput })}
              >
                <Select.Trigger>
                  <Select.Value
                    placeholder={t('workflow-for-each-item-input-placeholder')}
                  />
                </Select.Trigger>
                <Select.Content>
                  {inputNames.map((name) => (
                    <Select.Item key={name} value={name}>
                      {name}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
            ) : (
              <p className="text-xs text-muted-foreground">
                {t('workflow-for-each-no-inputs')}
              </p>
            )}
            {forEachError === 'item-input-required' && (
              <p className="text-xs text-destructive">
                {t('workflow-for-each-item-input-required')}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <Label>{t('workflow-for-each-on-item-error')}</Label>
            <Select
              value={forEach.onItemError || 'continue'}
              onValueChange={(onItemError) =>
                updateForEach({
                  onItemError: onItemError as TWorkflowForEachOnItemError,
                })
              }
            >
              <Select.Trigger>
                <Select.Value />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="continue">
                  {t('workflow-for-each-continue')}
                </Select.Item>
                <Select.Item value="stop">
                  {t('workflow-for-each-stop')}
                </Select.Item>
              </Select.Content>
            </Select>
          </div>
        </>
      )}
    </div>
  );
};
