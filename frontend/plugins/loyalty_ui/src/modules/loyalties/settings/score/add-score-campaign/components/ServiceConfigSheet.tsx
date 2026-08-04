import { IconPlus, IconTrash, IconX } from '@tabler/icons-react';
import {
  Button,
  Checkbox,
  cn,
  Combobox,
  Command,
  Dialog,
  Form,
  Popover,
  ScrollArea,
} from 'erxes-ui';
import { useMemo, useState } from 'react';
import { UseFormReturn, useFieldArray } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { SelectBoard, SelectPipeline, useStages } from 'ui-modules';
import { LoyaltyScoreFormValues } from '../../constants/formSchema';

const MultiStageSelect = ({
  value,
  onValueChange,
  pipelineId,
  placeholder,
}: {
  value: string[];
  onValueChange: (value: string[]) => void;
  pipelineId?: string;
  placeholder?: string;
}) => {
  const { t } = useTranslation('loyalty');
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const isDisabled = !pipelineId;

  const { stages: searchStages = [], loading } = useStages({
    variables: { pipelineId: pipelineId || undefined, search: search || '' },
    skip: !pipelineId,
  });

  const { stages: allStages = [] } = useStages({
    variables: { pipelineId: pipelineId || undefined, search: '' },
    skip: !pipelineId,
  });

  const stagesById = useMemo(() => {
    const map = new Map<string, string>();
    allStages.forEach((s) => map.set(s._id, s.name));
    searchStages.forEach((s) => map.set(s._id, s.name));
    return map;
  }, [allStages, searchStages]);

  const selectedLabel = useMemo(() => {
    if (!value || value.length === 0) return '';
    return value
      .map((id) => stagesById.get(id) || id)
      .filter(Boolean)
      .join(', ');
  }, [value, stagesById]);

  const toggle = (id: string) => {
    const next = value.includes(id)
      ? value.filter((v) => v !== id)
      : [...value, id];
    onValueChange(next);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Form.Control>
        <Combobox.Trigger
          className={cn('w-full shadow-xs')}
          disabled={isDisabled}
        >
          {selectedLabel ? (
            <p className="font-medium text-sm truncate">{selectedLabel}</p>
          ) : (
            <span className="text-accent-foreground/80">{placeholder ?? t('select-stages')}</span>
          )}
        </Combobox.Trigger>
      </Form.Control>
      <Combobox.Content>
        <Command shouldFilter={false}>
          <Command.Input
            value={search}
            onValueChange={setSearch}
            placeholder={t('search-stage')}
          />
          <Command.Empty>
            {loading ? t('loading') : t('no-stages-found')}
          </Command.Empty>
          <Command.List>
            {searchStages.map((stage) => (
              <Command.Item
                key={stage._id}
                value={stage._id}
                onSelect={() => toggle(stage._id)}
              >
                <span className="font-medium">{stage.name}</span>
                <Combobox.Check checked={value.includes(stage._id)} />
              </Command.Item>
            ))}
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};

const CardBasedRuleRow = ({
  form,
  index,
  onRemove,
}: {
  form: UseFormReturn<LoyaltyScoreFormValues>;
  index: number;
  onRemove: () => void;
}) => {
  const { t } = useTranslation('loyalty');
  const boardId = form.watch(`additionalConfig.cardBasedRule.${index}.boardId`);
  const pipelineId = form.watch(
    `additionalConfig.cardBasedRule.${index}.pipelineId`,
  );

  return (
    <div className="flex items-end gap-3">
      <div className="grid grid-cols-4 gap-3 flex-1">
        <Form.Field
          control={form.control}
          name={`additionalConfig.cardBasedRule.${index}.boardId`}
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('board')}</Form.Label>
              <SelectBoard.FormItem
                mode="single"
                value={field.value || ''}
                onValueChange={(value) => {
                  field.onChange(Array.isArray(value) ? value[0] : value);
                  form.setValue(
                    `additionalConfig.cardBasedRule.${index}.pipelineId`,
                    '',
                  );
                  form.setValue(
                    `additionalConfig.cardBasedRule.${index}.stageIds`,
                    [],
                  );
                  form.setValue(
                    `additionalConfig.cardBasedRule.${index}.refundStageIds`,
                    [],
                  );
                }}
                placeholder={t('select-placeholder')}
              />
              <Form.Message />
            </Form.Item>
          )}
        />

        <Form.Field
          control={form.control}
          name={`additionalConfig.cardBasedRule.${index}.pipelineId`}
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('pipeline')}</Form.Label>
              <SelectPipeline.FormItem
                mode="single"
                value={field.value || ''}
                boardId={boardId}
                onValueChange={(value) => {
                  field.onChange(Array.isArray(value) ? value[0] : value);
                  form.setValue(
                    `additionalConfig.cardBasedRule.${index}.stageIds`,
                    [],
                  );
                  form.setValue(
                    `additionalConfig.cardBasedRule.${index}.refundStageIds`,
                    [],
                  );
                }}
                placeholder={t('select-placeholder')}
              />
              <Form.Message />
            </Form.Item>
          )}
        />

        <Form.Field
          control={form.control}
          name={`additionalConfig.cardBasedRule.${index}.stageIds`}
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('stages')}</Form.Label>
              <MultiStageSelect
                value={field.value || []}
                pipelineId={pipelineId}
                onValueChange={field.onChange}
                placeholder={t('select-placeholder')}
              />
              <Form.Message />
            </Form.Item>
          )}
        />

        <Form.Field
          control={form.control}
          name={`additionalConfig.cardBasedRule.${index}.refundStageIds`}
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('refund-stages')}</Form.Label>
              <MultiStageSelect
                value={field.value || []}
                pipelineId={pipelineId}
                onValueChange={field.onChange}
                placeholder={t('select-placeholder')}
              />
              <Form.Message />
            </Form.Item>
          )}
        />
      </div>

      <Button
        type="button"
        variant="destructive"
        size="icon"
        onClick={onRemove}
        className="mb-1"
      >
        <IconTrash className="size-4" />
      </Button>
    </div>
  );
};

export const ServiceConfigSheet = ({
  form,
  open,
  onOpenChange,
}: {
  form: UseFormReturn<LoyaltyScoreFormValues>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const { t } = useTranslation('loyalty');
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'additionalConfig.cardBasedRule',
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal>
      <Dialog.Content className="max-w-5xl h-[70vh] p-0 gap-0 flex flex-col">
        <Dialog.Header className="border-b py-4 px-8 flex flex-row items-center justify-between shrink-0">
          <Dialog.Title>{t('service-configurations')}</Dialog.Title>
          <Dialog.Close asChild>
            <Button type="button" variant="ghost" size="icon">
              <IconX className="size-4" />
            </Button>
          </Dialog.Close>
        </Dialog.Header>

        <ScrollArea className="flex-1 min-h-0">
          <div className="p-5 flex flex-col gap-6">
            <div>
              <h3 className="text-base font-semibold text-primary mb-3">
                {t('product-based-rule')}
              </h3>
              <Form.Field
                control={form.control}
                name="additionalConfig.discountCheck"
                render={({ field }) => (
                  <Form.Item className="flex flex-row items-center gap-3">
                    <Form.Label className="mb-0 uppercase text-xs tracking-wide">
                      {t('discount-check-optional')}
                    </Form.Label>
                    <Form.Control>
                      <Checkbox
                        checked={field.value ?? false}
                        onCheckedChange={field.onChange}
                      />
                    </Form.Control>
                  </Form.Item>
                )}
              />
            </div>

            <div>
              <h3 className="text-base font-semibold text-primary mb-3">
                {t('deal-based-rule')}
              </h3>
              <div className="flex flex-col gap-4">
                {fields.map((fieldItem, index) => (
                  <CardBasedRuleRow
                    key={fieldItem.id}
                    form={form}
                    index={index}
                    onRemove={() => remove(index)}
                  />
                ))}

                <Button
                  type="button"
                  variant="link"
                  className="self-start text-primary p-0 h-auto"
                  onClick={() =>
                    append({
                      boardId: '',
                      pipelineId: '',
                      stageIds: [],
                      refundStageIds: [],
                    })
                  }
                >
                  <IconPlus className="size-4" />
                  {t('add')}
                </Button>
              </div>
            </div>
          </div>
        </ScrollArea>
      </Dialog.Content>
    </Dialog>
  );
};
