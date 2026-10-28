import { zodResolver } from '@hookform/resolvers/zod';
import { IconHierarchy } from '@tabler/icons-react';
import { Button, Dialog, Form, Spinner, Tabs } from 'erxes-ui';
import { useAtom } from 'jotai';
import { useId, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { usePermissionCheck } from 'ui-modules';
import { STRUCTURE_TYPES_MANAGE_ACTION } from '../../constants/structureCapabilities';
import { useStructureEntityTypeMutations } from '../../hooks/useStructureEntityMutations';
import { useStructureEntityTypesList } from '../../hooks/useStructureEntityTypesList';
import { useStructureFeedback } from '../../hooks/useStructureFeedback';
import { getStructureEntityTypeSchema } from '../../schemas/structureEntitySchema';
import {
  structureTypeSettingsState,
  TStructureTypeTab,
} from '../../states/structureViewState';
import {
  IStructureEntityTypeDetail,
  IStructureEntityTypeForm,
} from '../../types/structureEntity';
import {
  toStructureEntityTypeFormValues,
  toStructureEntityTypeVariables,
} from '../../utils/structureEntityTypeInput';
import { StructureEmpty } from '../StructureEmpty';
import { StructureEntityTypeCapabilitiesTab } from './StructureEntityTypeCapabilitiesTab';
import { StructureEntityTypeFieldsTab } from './StructureEntityTypeFieldsTab';
import { StructureEntityTypeGeneralTab } from './StructureEntityTypeGeneralTab';

const TYPE_TABS: TStructureTypeTab[] = ['general', 'capabilities', 'fields'];

const StructureTypeSettingsForm = ({
  type,
  types,
  tab,
  onTabChange,
  onClose,
}: {
  type: IStructureEntityTypeDetail;
  types: IStructureEntityTypeDetail[];
  tab: TStructureTypeTab;
  onTabChange: (tab: TStructureTypeTab) => void;
  onClose: () => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const formId = useId();
  const schema = useMemo(() => getStructureEntityTypeSchema(t), [t]);
  const form = useForm<IStructureEntityTypeForm>({
    resolver: zodResolver(schema),
    defaultValues: toStructureEntityTypeFormValues(type),
  });
  const { editType, saving } = useStructureEntityTypeMutations();
  const { success, failure } = useStructureFeedback();
  const { hasActionPermission } = usePermissionCheck();
  const canManage = hasActionPermission(STRUCTURE_TYPES_MANAGE_ACTION);

  const onSubmit = (values: IStructureEntityTypeForm) => {
    const variables = toStructureEntityTypeVariables(
      values,
      Boolean(type.isSystem),
    );

    editType({
      variables: { _id: type._id, ...variables },
      onCompleted: () => {
        success(t('type-saved', { name: variables.name }));
        onClose();
      },
      onError: failure,
    });
  };

  const onInvalid = () => onTabChange('general');

  return (
    <Form {...form}>
      <Tabs
        value={tab}
        onValueChange={(value) =>
          onTabChange(TYPE_TABS.find((item) => item === value) ?? 'general')
        }
        className="flex min-h-0 flex-1 flex-col"
      >
        <Tabs.List>
          <Tabs.Trigger value="general">{t('general')}</Tabs.Trigger>
          <Tabs.Trigger value="capabilities">{t('capabilities')}</Tabs.Trigger>
          <Tabs.Trigger value="fields">{t('custom-fields')}</Tabs.Trigger>
        </Tabs.List>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <form id={formId} onSubmit={form.handleSubmit(onSubmit, onInvalid)}>
            <fieldset disabled={!canManage}>
              <Tabs.Content value="general">
                <StructureEntityTypeGeneralTab type={type} types={types} />
              </Tabs.Content>
              <Tabs.Content value="capabilities">
                <StructureEntityTypeCapabilitiesTab />
              </Tabs.Content>
            </fieldset>
          </form>
          <Tabs.Content value="fields">
            <StructureEntityTypeFieldsTab typeId={type._id} />
          </Tabs.Content>
        </div>
      </Tabs>
      <Dialog.Footer className="border-t pt-4">
        <Button type="button" variant="secondary" onClick={onClose}>
          {canManage ? t('cancel') : t('close')}
        </Button>
        {canManage && (
          <Button type="submit" form={formId} disabled={saving}>
            {t('save')}
          </Button>
        )}
      </Dialog.Footer>
    </Form>
  );
};

export const StructureTypeSettingsDialog = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const [settings, setSettings] = useAtom(structureTypeSettingsState);
  const { types, typesById, loading } = useStructureEntityTypesList();
  const type = settings ? typesById.get(settings.typeId) : undefined;
  const close = () => setSettings(null);

  const renderContent = () => {
    if (loading && !type) {
      return <Spinner containerClassName="py-16" />;
    }

    if (!type || !settings) {
      return (
        <StructureEmpty icon={IconHierarchy} title={t('type-not-found')} />
      );
    }

    return (
      <StructureTypeSettingsForm
        key={type._id}
        type={type}
        types={types}
        tab={settings.tab}
        onTabChange={(tab) => setSettings({ ...settings, tab })}
        onClose={close}
      />
    );
  };

  return (
    <Dialog open={!!settings} onOpenChange={(open) => !open && close()}>
      <Dialog.ContentCombined
        title={type ? t('type-settings-of', { name: type.name }) : t('type')}
        description={t('type-settings-description')}
        className="flex max-h-[90vh] flex-col sm:max-w-3xl"
      >
        {renderContent()}
      </Dialog.ContentCombined>
    </Dialog>
  );
};
