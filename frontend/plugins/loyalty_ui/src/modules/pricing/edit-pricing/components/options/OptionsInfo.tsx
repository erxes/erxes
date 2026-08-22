import { useEffect, useState } from 'react';
import { Button, Form, InfoCard, Label, useToast } from 'erxes-ui';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { SelectBranches, SelectDepartments } from 'ui-modules';
import { IPricingPlanDetail } from '@/pricing/types';
import { useEditPricing } from '@/pricing/hooks/useEditPricing';
import { SelectBoardFormItem } from '@/pricing/hooks/useSelectBoard';
import { SelectPipelineFormItem } from '@/pricing/hooks/useSelectPipeline';
import {
  RepeatRuleSheet,
  type RepeatRuleConfig,
} from '@/pricing/edit-pricing/components/repeat/RepeatRuleSheet';
import {
  getOptionsSnapshot,
  getRepeatRules,
  mapRepeatRulesToDocument,
  type OptionsFormValues,
} from '@/pricing/edit-pricing/components/options/utils';

interface OptionsInfoProps {
  pricingId?: string;
  pricingDetail?: IPricingPlanDetail;
}

export const OptionsInfo = ({ pricingId, pricingDetail }: OptionsInfoProps) => {
  const { editPricing, loading } = useEditPricing();
  const { toast } = useToast();
  const { t } = useTranslation('loyalty');

  const [repeatRules, setRepeatRules] = useState<RepeatRuleConfig[]>([]);
  const [editingRule, setEditingRule] = useState<RepeatRuleConfig | null>(null);
  const [initialSnapshot, setInitialSnapshot] = useState<ReturnType<
    typeof getOptionsSnapshot
  > | null>(null);

  const form = useForm<OptionsFormValues>({
    defaultValues: {
      departmentIds: [],
      branchIds: [],
      boardId: '',
      pipelineId: '',
    },
  });

  const { control, handleSubmit, reset, setValue } = form;

  const watchedValues = form.watch();
  const currentSnapshot = getOptionsSnapshot({
    values: watchedValues,
    repeatRules,
  });
  const hasChanges =
    !!initialSnapshot &&
    JSON.stringify(initialSnapshot) !== JSON.stringify(currentSnapshot);

  useEffect(() => {
    if (!pricingDetail) {
      return;
    }

    const departmentIds = pricingDetail.departmentIds || [];
    const branchIds = pricingDetail.branchIds || [];
    const rules = getRepeatRules(pricingDetail);

    const values: OptionsFormValues = {
      departmentIds,
      branchIds,
      boardId: pricingDetail.boardId || '',
      pipelineId: pricingDetail.pipelineId || '',
    };

    reset(values);

    setRepeatRules(rules);
    setInitialSnapshot(getOptionsSnapshot({ values, repeatRules: rules }));
  }, [pricingDetail, reset]);

  const handleBoardChange = (value: string) => {
    setValue('boardId', value, { shouldDirty: true });
    setValue('pipelineId', '', { shouldDirty: true });
  };

  const handleRuleAdded = (rule: RepeatRuleConfig) => {
    setRepeatRules((prev) => [
      ...prev,
      { ...rule, _id: rule._id || `${Date.now()}_${prev.length}` },
    ]);
  };

  const handleRuleUpdated = (rule: RepeatRuleConfig) => {
    setRepeatRules((prev) =>
      prev.map((existingRule) =>
        existingRule._id === rule._id
          ? { ...existingRule, ...rule }
          : existingRule,
      ),
    );
  };

  const handleRuleDelete = (rule: RepeatRuleConfig) => {
    setRepeatRules((prev) =>
      prev.filter((existingRule) => existingRule._id !== rule._id),
    );
  };

  const handleSave = async (values: OptionsFormValues) => {
    if (!pricingId) return;

    const mappedRepeatRules = mapRepeatRulesToDocument(repeatRules);

    const departmentIds = values.departmentIds;
    const branchIds = values.branchIds;
    const boardId = values.boardId || null;
    const pipelineId = values.pipelineId || null;
    const nextRepeatRules = mappedRepeatRules;

    try {
      await editPricing({
        _id: pricingId,
        departmentIds,
        branchIds,
        boardId,
        pipelineId,
        stageId: null,
        isRepeatEnabled: nextRepeatRules.length > 0,
        repeatRules: nextRepeatRules,
      });

      const savedValues: OptionsFormValues = {
        departmentIds,
        branchIds,
        boardId: boardId || '',
        pipelineId: pipelineId || '',
      };

      reset(savedValues);
      setInitialSnapshot(
        getOptionsSnapshot({ values: savedValues, repeatRules }),
      );

      toast({
        title: t('options-updated'),
        description: t('changes-saved'),
      });
    } catch {
      toast({
        title: t('failed-to-update-options'),
        description: t('unexpected-error'),
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="p-6">
      <InfoCard title={t('options')}>
        <InfoCard.Content>
          <Form {...form}>
            <form
              onSubmit={handleSubmit(handleSave)}
              className="space-y-8"
              noValidate
            >
              <div className="flex items-center my-4">
                <div className="flex-1 border-t" />
                <Label className="mx-2">{t('location')}</Label>
                <div className="flex-1 border-t" />
              </div>

              <section className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Form.Field
                    control={control}
                    name="branchIds"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>{t('branches-caps')}</Form.Label>
                        <Form.Control>
                          <SelectBranches.FormItem
                            mode="multiple"
                            value={field.value}
                            onValueChange={field.onChange}
                          />
                        </Form.Control>
                      </Form.Item>
                    )}
                  />
                  <Form.Field
                    control={control}
                    name="departmentIds"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>{t('departments-caps')}</Form.Label>
                        <Form.Control>
                          <SelectDepartments.FormItem
                            mode="multiple"
                            value={field.value}
                            onValueChange={field.onChange}
                          />
                        </Form.Control>
                      </Form.Item>
                    )}
                  />
                </div>
              </section>

              <div className="flex items-center my-4">
                <div className="flex-1 border-t" />
                <Label className="mx-2">{t('pipeline')}</Label>
                <div className="flex-1 border-t" />
              </div>

              <section className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Form.Field
                    control={control}
                    name="boardId"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>{t('board-caps')}</Form.Label>
                        <Form.Control>
                          <SelectBoardFormItem
                            value={field.value}
                            onValueChange={handleBoardChange}
                            placeholder={t('choose-a-board')}
                          />
                        </Form.Control>
                      </Form.Item>
                    )}
                  />

                  <Form.Field
                    control={control}
                    name="pipelineId"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>{t('pipeline-caps')}</Form.Label>
                        <Form.Control>
                          <SelectPipelineFormItem
                            value={field.value}
                            onValueChange={field.onChange}
                            boardId={form.watch('boardId')}
                            placeholder={t('choose-a-pipeline')}
                          />
                        </Form.Control>
                      </Form.Item>
                    )}
                  />
                </div>
              </section>

              <div className="flex items-center my-4">
                <div className="flex-1 border-t" />
                <Label className="mx-2">{t('repeat')}</Label>
                <div className="flex-1 border-t" />
              </div>

              <section className="space-y-4">
                <div className="space-y-4">
                  <div className="flex justify-end">
                    <RepeatRuleSheet
                      onRuleAdded={handleRuleAdded}
                      onRuleUpdated={handleRuleUpdated}
                      editingRule={editingRule}
                      onEditComplete={() => setEditingRule(null)}
                    />
                  </div>

                  {repeatRules.length === 0 ? (
                    <div className="py-6 text-sm text-center text-muted-foreground">
                      {t('no-repeat-rules')}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {repeatRules.map((rule) => (
                        <div
                          key={rule._id}
                          className="flex items-center px-3 py-2 text-sm border rounded-lg"
                        >
                          <div className="flex-1 truncate">{rule.ruleType}</div>

                          <div className="flex justify-end w-20 gap-1">
                            <Button
                              variant="outline"
                              size="icon"
                              type="button"
                              aria-label={t('edit-repeat-rule')}
                              onClick={() => setEditingRule(rule)}
                            >
                              <IconEdit size={14} />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              type="button"
                              className="text-destructive"
                              aria-label={t('delete-repeat-rule')}
                              onClick={() => handleRuleDelete(rule)}
                            >
                              <IconTrash size={14} />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>

              <div className="flex justify-end border-t pt-4">
                <Button
                  type="submit"
                  size="sm"
                  disabled={loading || !pricingId || !hasChanges}
                >
                  {loading ? t('saving') : t('save-changes')}
                </Button>
              </div>
            </form>
          </Form>
        </InfoCard.Content>
      </InfoCard>
    </div>
  );
};
