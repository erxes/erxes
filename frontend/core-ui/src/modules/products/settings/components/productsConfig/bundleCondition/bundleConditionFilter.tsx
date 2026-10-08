import { useTranslation } from 'react-i18next';
import { IconSearch } from '@tabler/icons-react';
import { Combobox, Command, Filter } from 'erxes-ui';
import { BundleConditionHotKeyScope } from '../../../types/BundleConditionHotKeyScope';
import { BUNDLE_CONDITION_CURSOR_SESSION_KEY } from '../../../constants/bundleConditionCursorSessionKey';

export const BundleConditionFilter = () => {
  return (
    <Filter
      id="bundle-condition-filter"
      sessionKey={BUNDLE_CONDITION_CURSOR_SESSION_KEY}
    >
      <Filter.Bar>
        <BundleConditionFilterPopover />
      </Filter.Bar>
    </Filter>
  );
};

export const BundleConditionFilterPopover = () => {
  const { t } = useTranslation('product', { keyPrefix: 'bundle-conditions' });
  return (
    <>
      <Filter.Popover scope={BundleConditionHotKeyScope.BundleConditionsPage}>
        <Filter.Trigger />
        <Combobox.Content>
          <Filter.View>
            <Command>
              <Filter.CommandInput
                placeholder={t('filter')}
                variant="secondary"
              />

              <Command.List className="p-1">
                <Filter.Item value="searchValue" inDialog>
                  <IconSearch />
                  {t('search')}
                </Filter.Item>
              </Command.List>
            </Command>
          </Filter.View>
        </Combobox.Content>
      </Filter.Popover>
      <Filter.Dialog>
        <Filter.View filterKey="searchValue" inDialog>
          <Filter.DialogStringView filterKey="searchValue" />
        </Filter.View>
      </Filter.Dialog>
    </>
  );
};
