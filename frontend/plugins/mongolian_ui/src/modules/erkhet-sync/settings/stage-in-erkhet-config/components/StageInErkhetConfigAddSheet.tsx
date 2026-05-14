import { IconPlus } from '@tabler/icons-react';
import { Button, Checkbox, Form, Input, Select, Sheet } from 'erxes-ui';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SelectBoard, SelectPipeline, SelectStage } from 'ui-modules';
import { addStageInErkhetConfigSchema } from '../constants/addStageInErkhetConfigSchema';
import { CHOOSE_RESPONSE_FIELD_DATA } from '../constants/chooseResponseFieldData';
import { PaymentFields } from './PaymentFields';
import { SelectAnotherRulesOfProductsOnCityTax } from './selects/SelectAnotherRulesOfProductsOnCityTax';
import { useGetSalesPipelinePaymentTypes } from '../hooks/useGetSalesPipelinePaymentTypes';
import { TErkhetConfig } from '../types';

const defaultValues: TErkhetConfig = {
  title: '',
  boardId: '',
  pipelineId: '',
  stageId: '',
  userEmail: '',
  chooseResponseField: '',
  hasVat: false,
  hasCityTax: false,
  anotherRulesOfProductsOnCitytax: '',
  anotherRulesOfProductsOnVat: '',
  defaultPay: '',
  нэхэмжлэх: '',
  хаанБанкданс: '',
  голомтБанкданс: '',
  barter: '',
  paymentTypes: {},
};

interface Props {
  onSubmit: (data: TErkhetConfig) => Promise<void>;
  loading: boolean;
}

export const StageInErkhetConfigAddSheet = ({ onSubmit, loading }: Props) => {
  const [open, setOpen] = useState(false);

  const form = useForm<TErkhetConfig>({
    resolver: zodResolver(addStageInErkhetConfigSchema),
    defaultValues,
  });

  const selectedBoardId = form.watch('boardId');
  const selectedPipelineId = form.watch('pipelineId');
  const hasVat = form.watch('hasVat');
  const hasCityTax = form.watch('hasCityTax');
  const paymentTypesValue = form.watch('paymentTypes') || {};

  const { paymentTypes } = useGetSalesPipelinePaymentTypes(selectedPipelineId);

  const handleSubmit = async (data: TErkhetConfig) => {
    await onSubmit(data);
    setOpen(false);
    form.reset();
  };

  return (
    <Sheet open={open} onOpenChange={setOpen} modal>
      <Sheet.Trigger asChild>
        <Button>
          <IconPlus />
          New Config
        </Button>
      </Sheet.Trigger>
      <Sheet.View className="sm:max-w-5xl">
        <Sheet.Header>
          <Sheet.Title>New Stage In Erkhet Config</Sheet.Title>
          <Sheet.Close />
        </Sheet.Header>
        <Sheet.Content className="flex flex-col overflow-hidden p-0">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="flex flex-col flex-1 overflow-hidden"
            >
              <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
                {/* Row 1: Title + User Email */}
                <div className="grid grid-cols-2 gap-4">
                  <Form.Field
                    name="title"
                    control={form.control}
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>Title</Form.Label>
                        <Form.Control>
                          <Input {...field} placeholder="Title" />
                        </Form.Control>
                        <Form.Message />
                      </Form.Item>
                    )}
                  />
                  <Form.Field
                    name="userEmail"
                    control={form.control}
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>User Email</Form.Label>
                        <Form.Control>
                          <Input {...field} placeholder="User Email" />
                        </Form.Control>
                        <Form.Message />
                      </Form.Item>
                    )}
                  />
                </div>

                {/* Row 2: Pipeline selectors (left) + VAT/CityTax (right) */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-4">
                    <Form.Field
                      control={form.control}
                      name="boardId"
                      render={({ field }) => (
                        <Form.Item>
                          <Form.Label>Board</Form.Label>
                          <SelectBoard
                            mode="single"
                            value={field.value}
                            onValueChange={(value) => {
                              field.onChange(value as string);
                              form.setValue('pipelineId', '');
                              form.setValue('stageId', '');
                            }}
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
                          <Form.Label>Pipeline</Form.Label>
                          <SelectPipeline
                            mode="single"
                            value={field.value}
                            onValueChange={(value) => {
                              field.onChange(value as string);
                              form.setValue('stageId', '');
                            }}
                            boardId={selectedBoardId || undefined}
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
                          <Form.Label>Stage</Form.Label>
                          <SelectStage
                            mode="single"
                            value={field.value}
                            onValueChange={(value) => field.onChange(value as string)}
                            pipelineId={selectedPipelineId || undefined}
                            placeholder="Select stage"
                          />
                          <Form.Message />
                        </Form.Item>
                      )}
                    />
                    <Form.Field
                      control={form.control}
                      name="chooseResponseField"
                      render={({ field }) => (
                        <Form.Item>
                          <Form.Label>Choose Response Field</Form.Label>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <Select.Trigger className="w-full">
                              <Select.Value placeholder="Choose Response Field" />
                            </Select.Trigger>
                            <Select.Content>
                              {CHOOSE_RESPONSE_FIELD_DATA.map((type) => (
                                <Select.Item key={type.value} value={type.value}>
                                  {type.label}
                                </Select.Item>
                              ))}
                            </Select.Content>
                          </Select>
                          <Form.Message />
                        </Form.Item>
                      )}
                    />
                  </div>

                  <div className="flex flex-col gap-3">
                    <div className="rounded-md border p-3 flex flex-col gap-3">
                      <Form.Field
                        control={form.control}
                        name="hasVat"
                        render={({ field }) => (
                          <Form.Item className="flex items-center gap-2 space-y-0">
                            <Form.Control>
                              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                            </Form.Control>
                            <Form.Label className="cursor-pointer font-medium">Has Vat</Form.Label>
                          </Form.Item>
                        )}
                      />
                      {hasVat && (
                        <Form.Field
                          control={form.control}
                          name="anotherRulesOfProductsOnVat"
                          render={({ field }) => (
                            <Form.Item>
                              <Form.Label>Another rules of products on vat</Form.Label>
                              <Form.Control>
                                <Input {...field} placeholder="Another rules of products on vat" />
                              </Form.Control>
                              <Form.Message />
                            </Form.Item>
                          )}
                        />
                      )}
                    </div>
                    <div className="rounded-md border p-3 flex flex-col gap-3">
                      <Form.Field
                        control={form.control}
                        name="hasCityTax"
                        render={({ field }) => (
                          <Form.Item className="flex items-center gap-2 space-y-0">
                            <Form.Control>
                              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                            </Form.Control>
                            <Form.Label className="cursor-pointer font-medium">Has City Tax</Form.Label>
                          </Form.Item>
                        )}
                      />
                      {hasCityTax && (
                        <Form.Field
                          control={form.control}
                          name="anotherRulesOfProductsOnCitytax"
                          render={({ field }) => (
                            <Form.Item>
                              <Form.Label>Another rules of products on city tax</Form.Label>
                              <SelectAnotherRulesOfProductsOnCityTax
                                value={field.value}
                                onValueChange={field.onChange}
                              />
                              <Form.Message />
                            </Form.Item>
                          )}
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* Row 3: Default pay + dynamic pipeline payment fields */}
                <div className="grid grid-cols-3 gap-4">
                  <PaymentFields control={form.control} />
                  {paymentTypes.map((pt) => (
                    <div key={pt._id} className="flex flex-col gap-1">
                      <label className="text-sm font-medium">{pt.title}</label>
                      <Select
                        value={paymentTypesValue[pt.type] || ''}
                        onValueChange={(val) =>
                          form.setValue('paymentTypes', {
                            ...paymentTypesValue,
                            [pt.type]: val,
                          })
                        }
                      >
                        <Select.Trigger className="w-full">
                          <Select.Value placeholder={`Select ${pt.title}`} />
                        </Select.Trigger>
                        <Select.Content>
                          {CHOOSE_RESPONSE_FIELD_DATA.map((opt) => (
                            <Select.Item key={opt.value} value={opt.value}>
                              {opt.label}
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 p-5 border-t">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </form>
          </Form>
        </Sheet.Content>
      </Sheet.View>
    </Sheet>
  );
};
