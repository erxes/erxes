import { UseFormReturn } from 'react-hook-form';
import { Form as ErxesForm } from 'erxes-ui';
import { TPosInEbarimtConfig } from '@/ebarimt/settings/pos-in-ebarimt-config/types';
import { useTranslation } from 'react-i18next';
import { SelectPos } from './selects/SelectPos';
import { SelectBranchDistrict } from './selects/SelectBranchDistrict';
import { SelectSubBranchDistrict } from './selects/SelectSubBranchDistrict';
import {
  FormCheckbox,
  FormDistrictCode,
  FormInput,
  FormSelectEbarimtProductRules,
} from './FormFields';
import { FormArea } from './FormFields/FormInput';

export const PosInEBarimtConfigFormFields = ({
  form,
  onSubmit,
  formId,
  onBranchChange,
  onSubBranchChange,
  onSetValue,
}: {
  form: UseFormReturn<TPosInEbarimtConfig>;
  onSubmit: (data: TPosInEbarimtConfig) => void;
  formId: string;
  onBranchChange: (value: string) => void;
  onSubBranchChange: (value: string) => void;
  onSetValue: (name: string, value: any) => void;
}) => {
  const { t } = useTranslation('mongolian');
  const hasVat = form.watch('hasVat');
  const hasCitytax = form.watch('hasCitytax');
  const selectedBranchCode = form.watch('branchOfProvince');
  const selectedSubBranchCode = form.watch('subProvince');

  return (
    <ErxesForm {...form}>
      <form
        id={formId}
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
        {/* Row 1: Title + POS */}
        <div className="grid grid-cols-2 gap-4">
          <FormInput
            name="title"
            label={t('title')}
            placeholder={t('title')}
            control={form.control}
          />
          <ErxesForm.Field
            control={form.control}
            name="posId"
            render={({ field }) => (
              <ErxesForm.Item>
                <ErxesForm.Label>{t('pos')}</ErxesForm.Label>
                <SelectPos
                  variant="form"
                  value={field.value}
                  onValueChange={field.onChange}
                />
                <ErxesForm.Message />
              </ErxesForm.Item>
            )}
          />
        </div>

        {/* Row 2: Company Name + POS No */}
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

        {/* Row 3: Company RD + MerchantTin */}
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

        {/* Row 4: Branch + Sub Branch + District Code (3 cols) */}
        <div className="grid grid-cols-3 gap-4">
          <ErxesForm.Field
            control={form.control}
            name="branchOfProvince"
            render={({ field }) => (
              <ErxesForm.Item>
                <ErxesForm.Label>{t('branch-of-province-district')}</ErxesForm.Label>
                <SelectBranchDistrict
                  value={field.value || ''}
                  onValueChange={onBranchChange}
                />
                <ErxesForm.Message />
              </ErxesForm.Item>
            )}
          />
          <ErxesForm.Field
            control={form.control}
            name="subProvince"
            render={({ field }) => (
              <ErxesForm.Item>
                <ErxesForm.Label>{t('sub-province-district')}</ErxesForm.Label>
                <SelectSubBranchDistrict
                  value={field.value || ''}
                  branchCode={selectedBranchCode || ''}
                  onValueChange={onSubBranchChange}
                />
                <ErxesForm.Message />
              </ErxesForm.Item>
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

        {/* Row 5: Default United Code + Branch No */}
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

        {/* Row 6: Has VAT section */}
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

        {/* Row 7: Has Citytax section */}
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

        {/* Row 8: Header + Footer text */}
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

        {/* Row 9: Checkboxes + URL */}
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
          <div className="col-span-2">
            <FormInput
              name="ebarimtUrl"
              label={t('ebarimt-url')}
              placeholder={t('not-must-fill')}
              control={form.control}
            />
          </div>
        </div>
      </form>
    </ErxesForm>
  );
};
