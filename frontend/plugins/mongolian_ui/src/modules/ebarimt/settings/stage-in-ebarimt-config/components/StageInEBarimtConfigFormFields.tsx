import { UseFormReturn } from 'react-hook-form';
import { Form } from 'erxes-ui';
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
            label="Title"
            placeholder="Title"
            control={form.control}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Form.Field
            control={form.control}
            name="boardId"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>Destination Stage Board</Form.Label>
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
                <Form.Label>Pipeline</Form.Label>
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
                <Form.Label>Stage</Form.Label>
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

        {/* Row 3: Company Name + Pos No */}
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

        {/* Row 4: Company RD + MerchantTin */}
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

        {/* Row 5: Branch + Sub Branch + District Code */}
        <div className="grid grid-cols-3 gap-4">
          <Form.Field
            control={form.control}
            name="branchOfProvince"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>Branch of Province / District</Form.Label>
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
                <Form.Label>Sub Province / District</Form.Label>
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
            label="District Code"
            placeholder="District Code"
            control={form.control}
            branchCode={selectedBranchCode || ''}
            subBranchCode={selectedSubBranchCode || ''}
            setValue={onSetValue}
          />
        </div>

        {/* Row 6: Default United Code + Branch No */}
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

        {/* Row 7: Has VAT section */}
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

        {/* Row 8: Has Citytax section */}
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

        {/* Row 9: Header + Footer text */}
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

        {/* Row 10: Checkboxes */}
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
        </div>
      </form>
    </Form>
  );
};
