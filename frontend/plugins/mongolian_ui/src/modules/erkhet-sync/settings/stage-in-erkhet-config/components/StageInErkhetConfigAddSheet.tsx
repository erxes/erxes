import { IconPlus } from '@tabler/icons-react';
import { Button, Checkbox, Form, Input, Select, Sheet } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SelectBoard, SelectPipeline, SelectStage } from 'ui-modules';
import { addStageInErkhetConfigSchema } from '../constants/addStageInErkhetConfigSchema';
import { DEFAULT_PAY_DATA } from '../constants/defaultPayData';
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
  responseField: '',
  hasVat: false,
  hasCitytax: false,
  reverseCtaxRules: [],
  reverseVatRules: [],
  defaultPay: 'debtAmount',
};

interface Props {
  onSubmit: (data: TErkhetConfig) => Promise<void>;
  loading: boolean;
}

export const StageInErkhetConfigAddSheet = ({ onSubmit, loading }: Props) => {
  const { t } = useTranslation('mongolian');
  const [open, setOpen] = useState(false);

  const form = useForm<TErkhetConfig>({
    resolver: zodResolver(addStageInErkhetConfigSchema),
    defaultValues,
  });

  const selectedBoardId = form.watch('boardId');
  const selectedPipelineId = form.watch('pipelineId');
  const hasVat = form.watch('hasVat');
  const hasCitytax = form.watch('hasCitytax');

  const { paymentTypes } = useGetSalesPipelinePaymentTypes(selectedPipelineId);

  const normalizeRuleIds = (value?: string | string[]) => {
    if (!value) {
      return [];
    }

    return Array.isArray(value)
      ? value.filter(Boolean)
      : [value].filter(Boolean);
  };

  const handleSubmit = async (data: TErkhetConfig) => {
    await onSubmit({
      ...data,
      reverseVatRules: data.hasVat
        ? normalizeRuleIds(data.reverseVatRules)
        : [],
      reverseCtaxRules: data.hasCitytax
        ? []
        : normalizeRuleIds(data.reverseCtaxRules),
    });
    setOpen(false);
    form.reset();
  };

  return (
    <Sheet open={open} onOpenChange={setOpen} modal>
      <Sheet.Trigger asChild>
        <Button>
          <IconPlus />
          {t('new-config')}
        </Button>
      </Sheet.Trigger>
      <Sheet.View className="sm:max-w-5xl">
        <Sheet.Header>
          <Sheet.Title>{t('new-stage-in-erkhet-config')}</Sheet.Title>
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
                        <Form.Label>{t('title')}</Form.Label>
                        <Form.Control>
                          <Input {...field} placeholder={t('title')} />
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
                        <Form.Label>{t('user-email')}</Form.Label>
                        <Form.Control>
                          <Input {...field} placeholder={t('user-email')} />
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
                          <Form.Label>{t('board')}</Form.Label>
                          <SelectBoard
                            mode="single"
                            value={field.value}
                            onValueChange={(value) => {
                              field.onChange(value as string);
                              form.setValue('pipelineId', '');
                              form.setValue('stageId', '');
                            }}
                            placeholder={t('select-board')}
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
                          <Form.Label>{t('pipeline')}</Form.Label>
                          <SelectPipeline
                            mode="single"
                            value={field.value}
                            onValueChange={(value) => {
                              field.onChange(value as string);
                              form.setValue('stageId', '');
                            }}
                            boardId={selectedBoardId || undefined}
                            placeholder={t('select-pipeline')}
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
                          <Form.Label>{t('stage')}</Form.Label>
                          <SelectStage
                            mode="single"
                            value={field.value}
                            onValueChange={(value) =>
                              field.onChange(value as string)
                            }
                            pipelineId={selectedPipelineId || undefined}
                            placeholder={t('select-stage')}
                          />
                          <Form.Message />
                        </Form.Item>
                      )}
                    />
                    <Form.Field
                      control={form.control}
                      name="responseField"
                      render={({ field }) => (
                        <Form.Item>
                          <Form.Label>{t('choose-response-field')}</Form.Label>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <Select.Trigger className="w-full">
                              <Select.Value placeholder={t('choose-response-field')} />
                            </Select.Trigger>
                            <Select.Content>
                              <Select.Item value="propertiesData.erkhetResponse">
                                {t('erkhet-response')}
                              </Select.Item>
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
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </Form.Control>
                            <Form.Label className="cursor-pointer font-medium">
                              {t('has-vat')}
                            </Form.Label>
                          </Form.Item>
                        )}
                      />
                      {hasVat && (
                        <Form.Field
                          control={form.control}
                          name="reverseVatRules"
                          render={({ field }) => (
                            <Form.Item>
                              <Form.Label>
                                {t('another-rules-of-products-on-vat')}
                              </Form.Label>
                              <SelectAnotherRulesOfProductsOnCityTax
                                value={field.value}
                                onValueChange={field.onChange}
                                kind="vat"
                              />
                              <Form.Message />
                            </Form.Item>
                          )}
                        />
                      )}
                    </div>
                    <div className="rounded-md border p-3 flex flex-col gap-3">
                      <Form.Field
                        control={form.control}
                        name="hasCitytax"
                        render={({ field }) => (
                          <Form.Item className="flex items-center gap-2 space-y-0">
                            <Form.Control>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </Form.Control>
                            <Form.Label className="cursor-pointer font-medium">
                              {t('has-citytax')}
                            </Form.Label>
                          </Form.Item>
                        )}
                      />
                      {!hasCitytax && (
                        <Form.Field
                          control={form.control}
                          name="reverseCtaxRules"
                          render={({ field }) => (
                            <Form.Item>
                              <Form.Label>
                                {t('another-rules-of-products-on-citytax')}
                              </Form.Label>
                              <SelectAnotherRulesOfProductsOnCityTax
                                value={field.value}
                                onValueChange={field.onChange}
                                kind="ctax"
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
                        value={form.watch(pt.type) || ''}
                        onValueChange={(val) => form.setValue(pt.type, val)}
                      >
                        <Select.Trigger className="w-full">
                          <Select.Value placeholder={`Select ${pt.title}`} />
                        </Select.Trigger>
                        <Select.Content>
                          {DEFAULT_PAY_DATA.filter((opt) => opt.value).map(
                            (opt) => (
                              <Select.Item key={opt.value} value={opt.value}>
                                {opt.label}
                              </Select.Item>
                            ),
                          )}
                        </Select.Content>
                      </Select>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 p-5 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  {t('cancel')}
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? t('saving') : t('save')}
                </Button>
              </div>
            </form>
          </Form>
        </Sheet.Content>
      </Sheet.View>
    </Sheet>
  );
};
