import { UseFormReturn } from 'react-hook-form';
import { Form as ErxesForm } from 'erxes-ui';
import { TPosInEbarimtConfig } from '@/ebarimt/settings/pos-in-ebarimt-config/types';
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
            label="Title"
            placeholder="Title"
            control={form.control}
          />
          <ErxesForm.Field
            control={form.control}
            name="posId"
            render={({ field }) => (
              <ErxesForm.Item>
                <ErxesForm.Label>Pos</ErxesForm.Label>
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
            label="Company Name"
            placeholder="Enter company name"
            control={form.control}
          />
          <FormInput
            name="posNo"
            label="Pos No"
            placeholder="Pos No"
            control={form.control}
          />
        </div>

        {/* Row 3: Company RD + MerchantTin */}
        <div className="grid grid-cols-2 gap-4">
          <FormInput
            name="companyRD"
            label="Company RD"
            placeholder="Company RD"
            control={form.control}
          />
          <FormInput
            name="merchantTin"
            label="MerchantTin"
            placeholder="MerchantTin"
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
                <ErxesForm.Label>Branch of Province / District</ErxesForm.Label>
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
                <ErxesForm.Label>Sub Province / District</ErxesForm.Label>
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
            label="District Code"
            placeholder="District Code"
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
            label="Default United Code"
            placeholder="Default United Code"
            control={form.control}
          />
          <FormInput
            name="branchNo"
            label="Branch No"
            placeholder="Branch No"
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
                  label="Has Vat"
                  control={form.control}
                  labelPosition="before"
                />
                <FormInput
                  name="vatPercent"
                  label="Vat percent"
                  placeholder="Enter vat percent"
                  control={form.control}
                  type="number"
                />
              </div>
              <FormSelectEbarimtProductRules
                name="reverseVatRules"
                label="Another Rules of Products on VAT"
                kind="vat"
                control={form.control}
              />
            </>
          ) : (
            <FormCheckbox
              name="hasVat"
              label="Has Vat"
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
                label="Has all Citytax"
                control={form.control}
                labelPosition="before"
              />
              <FormInput
                name="citytaxPercent"
                label="Citytax Percent"
                placeholder="Enter citytax percent"
                control={form.control}
                type="number"
              />
            </div>
          ) : (
            <>
              <FormCheckbox
                name="hasCitytax"
                label="Has all Citytax"
                control={form.control}
                labelPosition="before"
              />
              <FormSelectEbarimtProductRules
                name="reverseCtaxRules"
                label="Another rules of products on citytax"
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
            label="Header text"
            placeholder="Header text"
            control={form.control}
          />
          <FormArea
            name="footerText"
            label="Footer text"
            placeholder="Footer text"
            control={form.control}
          />
        </div>

        {/* Row 9: Checkboxes + URL */}
        <div className="grid grid-cols-2 gap-4 items-center">
          <FormCheckbox
            name="withDescription"
            label="With Description"
            control={form.control}
            labelPosition="before"
          />
          <FormCheckbox
            name="skipEbarimt"
            label="Skip Ebarimt"
            control={form.control}
            labelPosition="before"
          />
          <div className="col-span-2">
            <FormInput
              name="ebarimtUrl"
              label="Ebarimt URL"
              placeholder="not must fill"
              control={form.control}
            />
          </div>
        </div>
      </form>
    </ErxesForm>
  );
};
