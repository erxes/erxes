import { SettingsInlineNameField } from '@/settings/components/SettingsInlineNameField';
import { SettingsRecordTableAddRow } from '@/settings/components/SettingsRecordTableAddRow';
import { useBrandsAdd } from '@/settings/brands/hooks/useBrandsAdd';
import { addingBrandAtom } from '@/settings/brands/state';
import { SettingsHotKeyScope } from '@/types/SettingsHotKeyScope';
import { usePreviousHotkeyScope, useToast } from 'erxes-ui';
import { useSetAtom } from 'jotai';
import { useTranslation } from 'react-i18next';

export const BrandsAddRow = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'brands' });
  const { toast } = useToast();
  const { goBackToPreviousHotkeyScope } = usePreviousHotkeyScope();
  const setAddingBrand = useSetAtom(addingBrandAtom);
  const { brandsAdd } = useBrandsAdd();

  const handleSave = (name: string) => {
    setAddingBrand(false);
    brandsAdd({
      variables: { name },
      optimisticResponse: {
        brandsAdd: {
          __typename: 'Brand',
          _id: `new-brand-${Date.now()}`,
          code: '',
          createdAt: new Date().toISOString(),
          description: '',
          emailConfig: null,
          memberIds: [],
          name,
          userId: '',
        },
      },
      onCompleted: () => {
        toast({
          variant: 'success',
          title: t('brand-created-successfully'),
        });
      },
      onError: (error) => {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      },
    });
    goBackToPreviousHotkeyScope();
  };

  return (
    <SettingsRecordTableAddRow>
      <SettingsInlineNameField
        name=""
        placeholder={t('brand-name')}
        scope={SettingsHotKeyScope.AddRowInput}
        defaultOpen
        isForm
        onSave={handleSave}
        onEscape={() => {
          setAddingBrand(false);
          goBackToPreviousHotkeyScope();
        }}
      />
    </SettingsRecordTableAddRow>
  );
};
