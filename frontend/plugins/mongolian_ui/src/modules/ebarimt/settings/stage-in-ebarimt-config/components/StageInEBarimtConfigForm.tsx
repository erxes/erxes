import { SelectPipeline } from '@/ebarimt/settings/stage-in-ebarimt-config/components/selects/SelectPipeline';
import { SelectSalesBoard } from '@/ebarimt/settings/stage-in-ebarimt-config/components/selects/SelectSalesBoard';
import { SelectStage } from '@/ebarimt/settings/stage-in-ebarimt-config/components/selects/SelectStage';
import { useEbarimtConfigState } from '@/ebarimt/settings/stage-in-ebarimt-config/hooks/useEbarimtConfigState';
import { useRemoveStageInEbarimtConfig } from '@/ebarimt/settings/stage-in-ebarimt-config/hooks/useRemoveStageInEbarimtConfig';
import { useSaveStageInEbarimtConfig } from '@/ebarimt/settings/stage-in-ebarimt-config/hooks/useSaveStageInEbarimtConfig';
import {
  TStageInEbarimtConfig,
  addEBarimtStageInConfigSchema,
  normalizeRuleIds,
} from '@/ebarimt/settings/stage-in-ebarimt-config/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconPlus } from '@tabler/icons-react';
import { Accordion, AlertDialog, Button, Card, Form } from 'erxes-ui';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import {
  FormCheckbox,
  FormDistrictCode,
  FormInput,
  FormSelectEbarimtProductRules,
} from './FormFields';
import { FormArea } from './FormFields/FormInput';
import { SelectBranchDistrict } from './selects/SelectBranchDistrict';
import { SelectSubBranchDistrict } from './selects/SelectSubBranchDistrict';

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
  const { t } = useTranslation('mongolian');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const form = useForm({
    resolver: zodResolver(addEBarimtStageInConfigSchema),
    defaultValues: {
      title: config.title || '',
      boardId: config.boardId || '',
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
      branchNo: config.branchNo || '',
      hasVat: config.hasVat || false,
      citytaxPercent: config.citytaxPercent || '',
      vatPercent: config.vatPercent || '',
      reverseVatRules: normalizeRuleIds(config.reverseVatRules),
      hasCitytax: config.hasCitytax || false,
      headerText: config.headerText || '',
      footerText: config.footerText || '',
      reverseCtaxRules: normalizeRuleIds(config.reverseCtaxRules),
      withDescription: config.withDescription || false,
      skipEbarimt: config.skipEbarimt || false,
    },
  });

  const selectedBoardId = form.watch('boardId');
  const selectedPipelineId = form.watch('pipelineId');
  const hasVat = form.watch('hasVat');
  const hasCitytax = form.watch('hasCitytax');
  const selectedBranchCode = form.watch('branchOfProvince');
  const selectedSubBranchCode = form.watch('subProvince');

  const handleSubmit = (data: TStageInEbarimtConfig) => {
    onSave(configKey, data);
  };

  const handleBoardChange = useCallback(
    (value: string) => {
      form.setValue('boardId', value);
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
          {config.title || t('untitled-config', 'Untitled Config')}
        </h3>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormInput
              name="title"
              label={t('title', 'Title')}
              placeholder={t('title', 'Title')}
              control={form.control}
            />
            <Form.Field
              control={form.control}
              name="boardId"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>{t('destination-stage-board', 'Destination Stage Board')}</Form.Label>
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
                  <Form.Label>{t('pipeline', 'Pipeline')}</Form.Label>
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
                  <Form.Label>{t('stage', 'Stage')}</Form.Label>
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
              label={t('company-name', 'Company name')}
              placeholder={t('enter-company-name', 'Enter company name')}
              control={form.control}
            />

            <FormInput
              name="posNo"
              label={t('pos-no', 'Pos No')}
              placeholder={t('pos-no', 'Pos No')}
              control={form.control}
            />

            <FormInput
              name="companyRD"
              label={t('company-rd', 'Company RD')}
              placeholder={t('company-rd', 'Company RD')}
              control={form.control}
            />

            <FormInput
              name="merchantTin"
              label={t('merchant-tin', 'MerchantTin')}
              placeholder={t('merchant-tin', 'MerchantTin')}
              control={form.control}
            />

            <div className="grid grid-cols-2 gap-4">
              <Form.Field
                control={form.control}
                name="branchOfProvince"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>{t('branch-of-province-district', 'Branch of Province / District')}</Form.Label>
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
                    <Form.Label>{t('sub-province-district', 'Sub Province / District')}</Form.Label>
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
              label={t('district-code', 'District Code')}
              placeholder={t('district-code', 'District Code')}
              control={form.control}
              branchCode={selectedBranchCode}
              subBranchCode={selectedSubBranchCode}
              setValue={memoizedSetValue}
            />

            <FormInput
              name="defaultUnitedCode"
              label={t('default-united-code', 'Default United Code')}
              placeholder={t('default-united-code', 'Default United Code')}
              control={form.control}
            />

            <FormInput
              name="branchNo"
              label={t('branch-no', 'Branch No')}
              placeholder={t('branch-no', 'Branch No')}
              control={form.control}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {hasVat ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <FormCheckbox
                    name="hasVat"
                    label={t('has-vat', 'Has Vat')}
                    control={form.control}
                    labelPosition="before"
                  />
                  <FormInput
                    name={'vatPercent'}
                    label={t('vat-percent', 'Vat percent')}
                    placeholder={t('enter-vat-percent', 'Enter vat percent')}
                    control={form.control}
                    type="number"
                  />
                </div>
                <FormSelectEbarimtProductRules
                  name="reverseVatRules"
                  label={t('another-rules-of-products-on-vat', 'Another Rules of Products on VAT')}
                  kind="vat"
                  control={form.control}
                />
              </>
            ) : (
              <FormCheckbox
                name="hasVat"
                label={t('has-vat', 'Has Vat')}
                control={form.control}
                labelPosition="before"
              />
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            {hasCitytax ? (
              <div className="grid grid-cols-2 gap-4">
                <FormCheckbox
                  name="hasCitytax"
                  label={t('has-all-citytax', 'Has all Citytax')}
                  control={form.control}
                  labelPosition="before"
                />
                <FormInput
                  name={'citytaxPercent'}
                  label={t('citytax-percent', 'Citytax Percent')}
                  placeholder={t('enter-citytax-percent', 'Enter citytax percent')}
                  control={form.control}
                  type="number"
                />
              </div>
            ) : (
              <>
                <FormCheckbox
                  name="hasCitytax"
                  label={t('has-all-citytax', 'Has all Citytax')}
                  control={form.control}
                  labelPosition="before"
                />
                <FormSelectEbarimtProductRules
                  name={'reverseCtaxRules'}
                  label={t('another-rules-of-products-on-citytax', 'Another rules of products on citytax')}
                  kind="ctax"
                  control={form.control}
                />
              </>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormArea
              name="headerText"
              label={t('header-text', 'Header text')}
              placeholder={t('header-text', 'Header text')}
              control={form.control}
            />

            <FormArea
              name="footerText"
              label={t('footer-text', 'Footer text')}
              placeholder={t('footer-text', 'Footer text')}
              control={form.control}
            />

            <FormCheckbox
              name="withDescription"
              label={t('with-description', 'With Description')}
              control={form.control}
              labelPosition="before"
            />

            <FormCheckbox
              name="skipEbarimt"
              label={t('skip-ebarimt', 'Skip Ebarimt')}
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
                  <p className="text-black">{t('delete', 'Delete')}</p>
                </Button>
              </AlertDialog.Trigger>
              <AlertDialog.Content>
                <AlertDialog.Header>
                  <AlertDialog.Title>{t('delete-configuration', 'Delete Configuration')}</AlertDialog.Title>
                  <AlertDialog.Description>
                    {t('delete-config-confirm', 'Are you sure you want to delete "{{title}}"? This action cannot be undone.', { title: config.title || t('untitled-config') })}
                  </AlertDialog.Description>
                </AlertDialog.Header>
                <AlertDialog.Footer>
                  <AlertDialog.Cancel>{t('cancel', 'Cancel')}</AlertDialog.Cancel>
                  <AlertDialog.Action
                    onClick={() => {
                      onDelete(configKey);
                      setIsDeleteDialogOpen(false);
                    }}
                  >
                    {t('delete', 'Delete')}
                  </AlertDialog.Action>
                </AlertDialog.Footer>
              </AlertDialog.Content>
            </AlertDialog>
            <Button type="submit" size="sm">
              {t('save', 'Save')}
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  );
};

export const StageInEBarimtConfigForm = () => {
  const { t } = useTranslation('mongolian');
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
          <h1 className="text-xl font-semibold">{t('stage-in-ebarimt', 'Stage In Ebarimt')}</h1>
        </div>

        <div className="flex justify-end">
          <Button
            type="button"
            onClick={addNewConfig}
            className="flex items-center gap-2"
          >
            <IconPlus className="h-4 w-4" />
            {t('new-config', 'New Config')}
          </Button>
        </div>

        <div className="space-y-4">
          {Object.keys(localConfigsMap).length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {t('no-configurations-found', 'No configurations found. Click "New Config" to create one.')}
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
                        {localConfigsMap[configKey].title || t('untitled-config', 'Untitled Config')}
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
