import { UseFormReturn } from 'react-hook-form';
import { Checkbox, Form, Input } from 'erxes-ui';
import { SelectBoard, SelectPipeline, SelectStage } from 'ui-modules';
import { SelectBrand } from 'ui-modules/modules/brands';

import { getMSDynamicFieldLabel, TMSDynamicConfig } from '../../types';

type MSDynamicTextFieldName = Exclude<
  keyof TMSDynamicConfig,
  'useBoard' | 'boardId' | 'pipelineId' | 'stageId'
>;

const CONNECTION_FIELDS: MSDynamicTextFieldName[] = [
  'title',
  'posConf',
  'productUrl',
  'username',
  'password',
];

const API_FIELDS: MSDynamicTextFieldName[] = [
  'itemApi',
  'itemCategoryApi',
  'priceApi',
  'customerApi',
  'salesApi',
  'salesLineApi',
  'exchangeRateApi',
];

const POSTING_FIELDS: MSDynamicTextFieldName[] = [
  'genBusPostingGroup',
  'vatBusPostingGroup',
  'customerPostingGroup',
  'customerPricingGroup',
  'customerDiscGroup',
];

const DEFAULT_FIELDS: MSDynamicTextFieldName[] = [
  'pricePriority',
  'syncType',
  'defaultUserCode',
  'locationCode',
  'reminderCode',
  'responsibilityCenter',
  'billType',
  'dealType',
  'paymentTermsCode',
  'paymentMethodCode',
  'defaultCompanyCode',
];

const getSingleSelectValue = (value: string | string[]) =>
  Array.isArray(value) ? value[0] || '' : value;

export const MSDynamicConfigFormFields = ({
  form,
  onSubmit,
  formId,
  loading,
}: {
  form: UseFormReturn<TMSDynamicConfig>;
  onSubmit: (data: TMSDynamicConfig) => void;
  formId: string;
  loading: boolean;
}) => {
  const useBoard = form.watch('useBoard');
  const selectedBoardId = form.watch('boardId');
  const selectedPipelineId = form.watch('pipelineId');

  const clearSalesFlowFields = () => {
    form.setValue('boardId', '');
    form.setValue('pipelineId', '');
    form.setValue('stageId', '');
  };

  const handleUseBoardChange = (checked: boolean | 'indeterminate') => {
    const nextUseBoard = checked === true;

    form.setValue('useBoard', nextUseBoard);

    if (!nextUseBoard) {
      clearSalesFlowFields();
    }
  };

  const handleBoardChange = (
    value: string | string[],
    onChange: (value: string) => void,
  ) => {
    onChange(getSingleSelectValue(value));
    form.setValue('pipelineId', '');
    form.setValue('stageId', '');
  };

  const handlePipelineChange = (
    value: string | string[],
    onChange: (value: string) => void,
  ) => {
    onChange(getSingleSelectValue(value));
    form.setValue('stageId', '');
  };

  return (
    <Form {...form}>
      <form
        id={formId}
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 py-2"
      >
        <MSDynamicFieldSection title="Connection">
          <Form.Field
            control={form.control}
            name="brandId"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>{getMSDynamicFieldLabel('brandId')}</Form.Label>
                <Form.Control>
                  <SelectBrand.FormItem
                    mode="single"
                    value={field.value}
                    onValueChange={(brand) =>
                      field.onChange(getSingleSelectValue(brand))
                    }
                  />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />
          {CONNECTION_FIELDS.map((name) => (
            <MSDynamicTextField
              key={name}
              form={form}
              name={name}
              loading={loading}
              type={name === 'password' ? 'password' : 'text'}
            />
          ))}
        </MSDynamicFieldSection>

        <MSDynamicFieldSection title="APIs">
          {API_FIELDS.map((name) => (
            <MSDynamicTextField
              key={name}
              form={form}
              name={name}
              loading={loading}
            />
          ))}
        </MSDynamicFieldSection>

        <MSDynamicFieldSection title="Posting groups">
          {POSTING_FIELDS.map((name) => (
            <MSDynamicTextField
              key={name}
              form={form}
              name={name}
              loading={loading}
            />
          ))}
        </MSDynamicFieldSection>

        <MSDynamicFieldSection title="Defaults">
          {DEFAULT_FIELDS.map((name) => (
            <MSDynamicTextField
              key={name}
              form={form}
              name={name}
              loading={loading}
            />
          ))}
        </MSDynamicFieldSection>

        <section className="space-y-5 border-t pt-6">
          <Form.Field
            control={form.control}
            name="useBoard"
            render={({ field }) => (
              <Form.Item className="flex h-9 items-center gap-2 space-y-0">
                <Form.Control>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={handleUseBoardChange}
                  />
                </Form.Control>
                <Form.Label variant="peer" className="whitespace-nowrap">
                  {getMSDynamicFieldLabel('useBoard')}
                </Form.Label>
              </Form.Item>
            )}
          />

          {useBoard && (
            <div className="grid grid-cols-1 gap-x-4 gap-y-5 md:grid-cols-3">
              <Form.Field
                control={form.control}
                name="boardId"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>{getMSDynamicFieldLabel('boardId')}</Form.Label>
                    <SelectBoard.FormItem
                      mode="single"
                      value={field.value}
                      onValueChange={(value) =>
                        handleBoardChange(value, field.onChange)
                      }
                      placeholder="Select board"
                    />
                    <Form.Message />
                  </Form.Item>
                )}
              />

              <Form.Field
                control={form.control}
                name="pipelineId"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>
                      {getMSDynamicFieldLabel('pipelineId')}
                    </Form.Label>
                    <SelectPipeline.FormItem
                      mode="single"
                      value={field.value}
                      boardId={selectedBoardId || undefined}
                      onValueChange={(value) =>
                        handlePipelineChange(value, field.onChange)
                      }
                      placeholder="Select pipeline"
                    />
                    <Form.Message />
                  </Form.Item>
                )}
              />

              <Form.Field
                control={form.control}
                name="stageId"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>{getMSDynamicFieldLabel('stageId')}</Form.Label>
                    <SelectStage.FormItem
                      mode="single"
                      value={field.value}
                      pipelineId={selectedPipelineId || undefined}
                      onValueChange={(value) =>
                        field.onChange(getSingleSelectValue(value))
                      }
                      placeholder="Select stage"
                    />
                    <Form.Message />
                  </Form.Item>
                )}
              />
            </div>
          )}
        </section>
      </form>
    </Form>
  );
};

const MSDynamicFieldSection = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <section className="space-y-4">
    <div className="border-b pb-2">
      <h3 className="text-sm font-medium text-foreground">{title}</h3>
    </div>
    <div className="grid grid-cols-1 gap-x-4 gap-y-5 md:grid-cols-2">
      {children}
    </div>
  </section>
);

const MSDynamicTextField = ({
  form,
  name,
  loading,
  type = 'text',
}: {
  form: UseFormReturn<TMSDynamicConfig>;
  name: MSDynamicTextFieldName;
  loading: boolean;
  type?: 'text' | 'password';
}) => (
  <Form.Field
    control={form.control}
    name={name}
    render={({ field }) => (
      <Form.Item>
        <Form.Label>{getMSDynamicFieldLabel(name)}</Form.Label>
        <Form.Control>
          <Input
            type={type}
            value={String(field.value ?? '')}
            onChange={field.onChange}
            disabled={loading}
          />
        </Form.Control>
        <Form.Message />
      </Form.Item>
    )}
  />
);
