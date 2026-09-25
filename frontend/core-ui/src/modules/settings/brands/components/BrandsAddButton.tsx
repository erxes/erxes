import { SettingsAddRowButton } from '@/settings/components/SettingsAddRowButton';
import { addingBrandAtom } from '@/settings/brands/state';
import { BrandsHotKeyScope } from '@/settings/brands/types';
import { SettingsHotKeyScope } from '@/types/SettingsHotKeyScope';
import { useQueryState } from 'erxes-ui';
import { useAtom } from 'jotai';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export const BrandsAddButton = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'brands' });
  const [addingBrand, setAddingBrand] = useAtom(addingBrandAtom);
  const [createParam, setCreateParam] = useQueryState<boolean>('create_brand');

  useEffect(() => {
    if (!createParam) return;
    setAddingBrand(true);
    setCreateParam(null);
  }, [createParam, setAddingBrand, setCreateParam]);

  return (
    <SettingsAddRowButton
      label={t('create-brand')}
      disabled={addingBrand}
      onAdd={() => setAddingBrand(true)}
      pageScope={BrandsHotKeyScope.BrandsSettingsPage}
      formRowScope={SettingsHotKeyScope.AddRowForm}
    />
  );
};
