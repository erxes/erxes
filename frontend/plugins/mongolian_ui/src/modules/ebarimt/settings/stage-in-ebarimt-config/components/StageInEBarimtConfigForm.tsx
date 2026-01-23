import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Card, AlertDialog, Accordion } from 'erxes-ui';
import { IconPlus } from '@tabler/icons-react';
import { useSaveStageInEbarimtConfig } from '@/ebarimt/settings/stage-in-ebarimt-config/hooks/useSaveStageInEbarimtConfig';
import { useRemoveStageInEbarimtConfig } from '@/ebarimt/settings/stage-in-ebarimt-config/hooks/useRemoveStageInEbarimtConfig';
import { SelectSalesBoard } from '@/ebarimt/settings/stage-in-ebarimt-config/components/selects/SelectSalesBoard';
import { SelectPipeline } from '@/ebarimt/settings/stage-in-ebarimt-config/components/selects/SelectPipeline';
import { SelectStage } from '@/ebarimt/settings/stage-in-ebarimt-config/components/selects/SelectStage';
import { addEBarimtStageInConfigSchema } from '~/modules/ebarimt/settings/stage-in-ebarimt-config/constants/addEBarimtReturnConfigSchema';
import { useEbarimtConfigState } from '@/ebarimt/settings/stage-in-ebarimt-config/hooks/useEbarimtConfigState';
import { TStageInEbarimtConfig } from '@/ebarimt/settings/stage-in-ebarimt-config/types';
import { Form } from 'erxes-ui';
import {
  FormInput,
  FormCheckbox,
  VatSection,
  CitytaxSection,
  FormSelectEbarimtProductRules,
  FormDistrictCode,
} from './FormFields';
import { SelectSubBranchDistrict } from './selects/SelectSubBranchDistrict';
import { SelectBranchDistrict } from './selects/SelectBranchDistrict';

const StageInEbarimtConfigCard = ({
  config,
  configKey,
  onSave,
  onDelete,
}: {
  config: TStageInEbarimtConfig;
  configKey: string;
  onSave: (key: string, data: TStageInEbarimtConfig) => void;
  onDelete: (key: string) => void;
}) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const form = useForm({
    resolver: zodResolver(addEBarimtStageInConfigSchema),
    defaultValues: {
      title: config.title || '',
      destinationStageBoard: config.destinationStageBoard || '',
      pipelineId: config.pipelineId || '',
      stageId: config.stageId || '',
      posNo: config.posNo || '',
      companyRD: config.companyRD || '',
      merchantTin: config.merchantTin || '',
      branchOfProvince: config.branchOfProvince || '',
      subProvince: config.subProvince || '',
      districtCode: config.districtCode || '',
      companyName: config.companyName || '',
      defaultUnitedCode: config.defaultUnitedCode || '',
      headerText: config.headerText || '',
      branchNo: config.branchNo || '',
      hasVat: config.hasVat || false,
      citytaxPercent: config.citytaxPercent || '',
      vatPercent: config.vatPercent || '',
      anotherRulesOfProductsOnVat: config.anotherRulesOfProductsOnVat || '',
      vatPayableAccount: config.vatPayableAccount || '',
      hasAllCitytax: config.hasAllCitytax || false,
      allCitytaxPayableAccount: config.allCitytaxPayableAccount || '',
      footerText: config.footerText || '',
      anotherRulesOfProductsOnCitytax:
        config.anotherRulesOfProductsOnCitytax || '',
      withDescription: config.withDescription || false,
      skipEbarimt: config.skipEbarimt || false,
    },
  });

  const selectedBoardId = form.watch('destinationStageBoard');
  const selectedPipelineId = form.watch('pipelineId');
  const hasVat = form.watch('hasVat');
  const hasAllCitytax = form.watch('hasAllCitytax');
  const selectedBranchCode = form.watch('branchOfProvince');
  const selectedSubBranchCode = form.watch('subProvince');

  const handleSubmit = (data: TStageInEbarimtConfig) => {
    onSave(configKey, data);
  };

  const handleBoardChange = useCallback(
    (value: string) => {
      form.setValue('destinationStageBoard', value);
      form.setValue('pipelineId', '');
      form.setValue('stageId', '');
    },
    [form],
  );

  const handlePipelineChange = useCallback(
    (value: string) => {
      form.setValue('pipelineId', value);
      form.setValue('stageId', '');
    },
    [form],
  );

  const handleBranchChange = useCallback(
    (value: string) => {
      form.setValue('branchOfProvince', value);
      form.setValue('subProvince', '');
      form.setValue('districtCode', '');
    },
    [form],
  );

  const handleSubBranchChange = useCallback(
    (value: string) => {
      form.setValue('subProvince', value);
    },
    [form],
  );

  const memoizedSetValue = useCallback(
    (name: string, value: any) => {
      form.setValue(name as any, value);
    },
    [form],
  );

  return (
    <Card className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-md font-medium">
          {config.title || 'Untitled Config'}
        </h3>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormInput
              name="title"
              label="Title"
              placeholder="Title"
              control={form.control}
            />
            <Form.Field
              control={form.control}
              name="destinationStageBoard"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Destination Stage Board</Form.Label>
                  <SelectSalesBoard
                    value={field.value}
                    onValueChange={handleBoardChange}
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
                    value={field.value}
                    onValueChange={handlePipelineChange}
                    boardId={selectedBoardId}
                    disabled={!selectedBoardId}
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
                    id="stageId"
                    variant="form"
                    value={field.value}
                    onValueChange={field.onChange}
                    pipelineId={selectedPipelineId}
                    disabled={!selectedPipelineId}
                  />
                  <Form.Message />
                </Form.Item>
              )}
            />

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

            <div className="grid grid-cols-2 gap-4">
              <Form.Field
                control={form.control}
                name="branchOfProvince"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>Branch of Province / District</Form.Label>
                    <SelectBranchDistrict
                      value={field.value}
                      onValueChange={handleBranchChange}
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
                    <Form.Label>SUB Province / District</Form.Label>
                    <SelectSubBranchDistrict
                      value={field.value}
                      branchCode={selectedBranchCode}
                      onValueChange={handleSubBranchChange}
                    />
                    <Form.Message />
                  </Form.Item>
                )}
              />
            </div>

            <FormDistrictCode
              name="districtCode"
              label="District Code"
              placeholder="District Code"
              control={form.control}
              branchCode={selectedBranchCode}
              subBranchCode={selectedSubBranchCode}
              setValue={memoizedSetValue}
            />

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

            <FormInput
              name="headerText"
              label="Header text"
              placeholder="Header text"
              control={form.control}
            />

            <FormSelectEbarimtProductRules
              name="anotherRulesOfProductsOnVat"
              label="Another Rules of Products on VAT"
              placeholder="Select VAT rule"
              kind="vat"
              control={form.control}
            />

            <FormCheckbox
              name="hasVat"
              label="Has Vat"
              control={form.control}
              labelPosition="before"
            />

            <VatSection control={form.control} hasVat={hasVat} />

            <FormCheckbox
              name="hasAllCitytax"
              label="Has all Citytax"
              control={form.control}
              labelPosition="before"
            />

            <CitytaxSection
              control={form.control}
              hasAllCitytax={hasAllCitytax}
            />

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

          <div className="flex justify-end gap-2">
            <AlertDialog
              open={isDeleteDialogOpen}
              onOpenChange={setIsDeleteDialogOpen}
            >
              <AlertDialog.Trigger asChild>
                <Button variant="ghost" size="sm">
                  <p className="text-black">Delete</p>
                </Button>
              </AlertDialog.Trigger>
              <AlertDialog.Content>
                <AlertDialog.Header>
                  <AlertDialog.Title>Delete Configuration</AlertDialog.Title>
                  <AlertDialog.Description>
                    Are you sure you want to delete "
                    {config.title || 'Untitled Config'}"? This action cannot be
                    undone.
                  </AlertDialog.Description>
                </AlertDialog.Header>
                <AlertDialog.Footer>
                  <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
                  <AlertDialog.Action
                    onClick={() => {
                      onDelete(configKey);
                      setIsDeleteDialogOpen(false);
                    }}
                  >
                    Delete
                  </AlertDialog.Action>
                </AlertDialog.Footer>
              </AlertDialog.Content>
            </AlertDialog>
            <Button type="submit" size="sm">
              Save
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  );
};

export const StageInEBarimtConfigForm = () => {
  const [openItems, setOpenItems] = useState<string[]>([]);

  const {
    localConfigsMap,
    addNewConfig: addConfigToState,
    deleteConfig: deleteConfigFromState,
    saveConfig: saveConfigToState,
    getConfigByStageId,
  } = useEbarimtConfigState();

  const { saveStageInEbarimtConfig } = useSaveStageInEbarimtConfig();
  const { removeStageInEbarimtConfig } = useRemoveStageInEbarimtConfig();

  const addNewConfig = () => {
    const updatedConfigsMap = addConfigToState();
    const keys = Object.keys(updatedConfigsMap);
    setOpenItems([keys[keys.length - 1]]);
  };

  const deleteConfig = async (configKey: string) => {
    const config = localConfigsMap[configKey];
    const existingConfig = getConfigByStageId(config.stageId);

    if (existingConfig) {
      await removeStageInEbarimtConfig(existingConfig._id);
    }

    deleteConfigFromState(configKey);
  };

  const saveConfig = async (configKey: string, configData: any) => {
    saveConfigToState(configKey, configData);

    const existingConfig = getConfigByStageId(configData.stageId);

    if (existingConfig) {
      await saveStageInEbarimtConfig(configData, 'update', existingConfig._id);
    } else if (configData.stageId) {
      await saveStageInEbarimtConfig(configData, 'create');
    }
  };

  return (
    <div className="h-full w-full p-6 overflow-y-auto">
      <div className="space-y-6">
        <div className="border-b pb-4">
          <h1 className="text-xl font-semibold">Stage In Ebarimt</h1>
        </div>

        <div className="flex justify-end">
          <Button
            type="button"
            onClick={addNewConfig}
            className="flex items-center gap-2"
          >
            <IconPlus className="h-4 w-4" />
            New Config
          </Button>
        </div>

        <div className="space-y-4">
          {Object.keys(localConfigsMap).length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No configurations found. Click "New Config" to create one.
            </div>
          ) : (
            <Accordion
              type="multiple"
              value={openItems}
              onValueChange={setOpenItems}
              className="w-full"
            >
              {Object.keys(localConfigsMap).map((configKey) => (
                <Accordion.Item key={configKey} value={configKey}>
                  <Accordion.Trigger className="px-4 py-3 hover:no-underline text-left font-medium cursor-pointer">
                    <div className="flex justify-between items-center w-full">
                      <span>
                        {localConfigsMap[configKey].title || 'Untitled Config'}
                      </span>
                    </div>
                  </Accordion.Trigger>
                  <Accordion.Content className="pt-4">
                    <div className="p-4">
                      <StageInEbarimtConfigCard
                        config={localConfigsMap[configKey]}
                        configKey={configKey}
                        onSave={saveConfig}
                        onDelete={deleteConfig}
                      />
                    </div>
                  </Accordion.Content>
                </Accordion.Item>
              ))}
            </Accordion>
          )}
        </div>
      </div>
    </div>
  );
};

export default StageInEBarimtConfigForm;
