import { IconPlus, IconTrash, IconX } from '@tabler/icons-react';
import { Button, Checkbox, Dialog, Form, ScrollArea } from 'erxes-ui';
import { UseFormReturn, useFieldArray } from 'react-hook-form';
import { SelectBoard, SelectPipeline, SelectStage } from 'ui-modules';
import { LoyaltyScoreFormValues } from '../../constants/formSchema';

const CardBasedRuleRow = ({
  form,
  index,
  onRemove,
}: {
  form: UseFormReturn<LoyaltyScoreFormValues>;
  index: number;
  onRemove: () => void;
}) => {
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
              <Form.Label>Board</Form.Label>
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
                placeholder="Select..."
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
              <Form.Label>Pipeline</Form.Label>
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
                placeholder="Select..."
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
              <Form.Label>Stages</Form.Label>
              <SelectStage.FormItem
                mode="multiple"
                value={field.value || []}
                pipelineId={pipelineId}
                onValueChange={(value) =>
                  field.onChange(Array.isArray(value) ? value : [value])
                }
                placeholder="Select..."
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
              <Form.Label>Refund Stages</Form.Label>
              <SelectStage.FormItem
                mode="multiple"
                value={field.value || []}
                pipelineId={pipelineId}
                onValueChange={(value) =>
                  field.onChange(Array.isArray(value) ? value : [value])
                }
                placeholder="Select..."
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
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'additionalConfig.cardBasedRule',
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal>
      <Dialog.Content className="max-w-5xl h-[70vh] p-0 gap-0 flex flex-col">
        <Dialog.Header className="border-b py-4 px-8 flex flex-row items-center justify-between shrink-0">
          <Dialog.Title>Service Configurations</Dialog.Title>
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
                Product based rule
              </h3>
              <Form.Field
                control={form.control}
                name="additionalConfig.discountCheck"
                render={({ field }) => (
                  <Form.Item className="flex flex-row items-center gap-3">
                    <Form.Label className="mb-0 uppercase text-xs tracking-wide">
                      Discount Check (optional)
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
                Deal based rule
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
                  Add
                </Button>
              </div>
            </div>
          </div>
        </ScrollArea>
      </Dialog.Content>
    </Dialog>
  );
};
