import { UseFormReturn } from 'react-hook-form';
import { Form } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { SelectBoard, SelectPipeline, SelectStage } from 'ui-modules';
import { TStageInEbarimtConfig } from '@/ebarimt/settings/stage-in-ebarimt-config/types';
import {
  FormCheckbox,
  FormDistrictCode,
  FormInput,
  FormSelectEbarimtProductRules,
} from './FormFields';
import { FormArea } from './FormFields/FormInput';
import { SelectBranchDistrict } from './selects/SelectBranchDistrict';
import { SelectSubBranchDistrict } from './selects/SelectSubBranchDistrict';

export const StageInEBarimtConfigFormFields = ({
  form,
  onSubmit,
  formId,
  onBoardChange,
  onPipelineChange,
  onBranchChange,
  onSubBranchChange,
  onSetValue,
}: {
  form: UseFormReturn<TStageInEbarimtConfig>;
  onSubmit: (data: TStageInEbarimtConfig) => void;
  formId: string;
  onBoardChange: (value: string | string[]) => void;
  onPipelineChange: (value: string | string[]) => void;
  onBranchChange: (value: string) => void;
  onSubBranchChange: (value: string) => void;
  onSetValue: (name: string, value: any) => void;
}) => {
  const { t } = useTranslation('mongolian');
  const selectedBoardId = form.watch('boardId');
  const selectedPipelineId = form.watch('pipelineId');
  const hasVat = form.watch('hasVat');
  const hasCitytax = form.watch('hasCitytax');
  const selectedBranchCode = form.watch('branchOfProvince');
  const selectedSubBranchCode = form.watch('subProvince');

  return (
    <Form {...form}>
      <form
        id={formId}
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
        <div className="grid grid-cols-1 gap-4">
          <FormInput
            name="title"
            label={t('title')}
            placeholder={t('title')}
            control={form.control}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Form.Field
            control={form.control}
            name="boardId"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>{t('destination-stage-board')}</Form.Label>
                <SelectBoard.FormItem
                  value={field.value}
                  onValueChange={onBoardChange}
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
                <SelectPipeline.FormItem
                  value={field.value}
                  boardId={selectedBoardId}
                  onValueChange={onPipelineChange}
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
                <SelectStage.FormItem
                  value={field.value}
                  pipelineId={selectedPipelineId}
                  onValueChange={(v) =>
                    field.onChange(Array.isArray(v) ? v[0] : v)
                  }
                />
                <Form.Message />
              </Form.Item>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormInput
            name="companyName"
            label={t('company-name')}
            placeholder={t('enter-company-name')}
            control={form.control}
          />
          <FormInput
            name="posNo"
            label={t('pos-no')}
            placeholder={t('pos-no')}
            control={form.control}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormInput
            name="companyRD"
            label={t('company-rd')}
            placeholder={t('company-rd')}
            control={form.control}
          />
          <FormInput
            name="merchantTin"
            label={t('merchant-tin')}
            placeholder={t('merchant-tin')}
            control={form.control}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Form.Field
            control={form.control}
            name="branchOfProvince"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>{t('branch-of-province-district')}</Form.Label>
                <SelectBranchDistrict
                  value={field.value || ''}
                  onValueChange={onBranchChange}
                />
                <Form.Message />
              </Form.Item>
            )}
          />
          <Form.Field
            control={form.control}
            name="subProvince"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>{t('sub-province-district')}</Form.Label>
                <SelectSubBranchDistrict
                  value={field.value || ''}
                  branchCode={selectedBranchCode || ''}
                  onValueChange={onSubBranchChange}
                />
                <Form.Message />
              </Form.Item>
            )}
          />
          <FormDistrictCode
            name="districtCode"
            label={t('district-code')}
            placeholder={t('district-code')}
            control={form.control}
            branchCode={selectedBranchCode || ''}
            subBranchCode={selectedSubBranchCode || ''}
            setValue={onSetValue}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormInput
            name="defaultUnitedCode"
            label={t('default-united-code')}
            placeholder={t('default-united-code')}
            control={form.control}
          />
          <FormInput
            name="branchNo"
            label={t('branch-no')}
            placeholder={t('branch-no')}
            control={form.control}
          />
        </div>

        <div className="grid grid-cols-2 gap-4 items-start">
          {hasVat ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <FormCheckbox
                  name="hasVat"
                  label={t('has-vat')}
                  control={form.control}
                  labelPosition="before"
                />
                <FormInput
                  name="vatPercent"
                  label={t('vat-percent')}
                  placeholder={t('enter-vat-percent')}
                  control={form.control}
                  type="number"
                />
              </div>
              <FormSelectEbarimtProductRules
                name="reverseVatRules"
                label={t('another-rules-of-products-on-vat')}
                kind="vat"
                control={form.control}
              />
            </>
          ) : (
            <FormCheckbox
              name="hasVat"
              label={t('has-vat')}
              control={form.control}
              labelPosition="before"
            />
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 items-start">
          {hasCitytax ? (
            <div className="grid grid-cols-2 gap-4">
              <FormCheckbox
                name="hasCitytax"
                label={t('has-all-citytax')}
                control={form.control}
                labelPosition="before"
              />
              <FormInput
                name="citytaxPercent"
                label={t('citytax-percent')}
                placeholder={t('enter-citytax-percent')}
                control={form.control}
                type="number"
              />
            </div>
          ) : (
            <>
              <FormCheckbox
                name="hasCitytax"
                label={t('has-all-citytax')}
                control={form.control}
                labelPosition="before"
              />
              <FormSelectEbarimtProductRules
                name="reverseCtaxRules"
                label={t('another-rules-of-products-on-citytax')}
                kind="ctax"
                control={form.control}
              />
            </>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormArea
            name="headerText"
            label={t('header-text')}
            placeholder={t('header-text')}
            control={form.control}
          />
          <FormArea
            name="footerText"
            label={t('footer-text')}
            placeholder={t('footer-text')}
            control={form.control}
          />
        </div>

        <div className="grid grid-cols-2 gap-4 items-center">
          <FormCheckbox
            name="withDescription"
            label={t('with-description')}
            control={form.control}
            labelPosition="before"
          />
          <FormCheckbox
            name="skipEbarimt"
            label={t('skip-ebarimt')}
            control={form.control}
            labelPosition="before"
          />
        </div>
      </form>
    </Form>
  );
};
