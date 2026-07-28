import { IconPlus } from '@tabler/icons-react';
import { Button, Combobox, Command, Filter, PageSubHeader } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import { Can } from 'ui-modules';
import { PropertiesHotkeyScope } from '../../types/Properties';
import { PropertiesCount } from './PropertiesCount';
import {
  PropertiesGroupFilterBar,
  PropertiesGroupFilterItem,
  PropertiesGroupFilterView,
} from './PropertiesGroupFilter';

export const PropertiesFilterBar = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'properties' });
  const { type: contentType } = useParams<{ type: string }>();

  return (
    <PageSubHeader>
      <Filter id="properties">
        <Filter.Bar>
          <Filter.Popover scope={PropertiesHotkeyScope.MainPage}>
            <Filter.Trigger />
            <Combobox.Content>
              <Filter.View>
                <Command>
                  <Filter.CommandInput
                    placeholder="Filter"
                    variant="secondary"
                    className="bg-background"
                  />
                  <Command.List className="p-1">
                    <PropertiesGroupFilterItem />
                  </Command.List>
                </Command>
              </Filter.View>
              <PropertiesGroupFilterView contentType={contentType || ''} />
            </Combobox.Content>
          </Filter.Popover>
          <PropertiesGroupFilterBar contentType={contentType || ''} />
          <PropertiesCount />
          <Can action="fieldsManage">
            <Button variant="outline" className="ml-auto" asChild>
              <Link to={`/settings/properties/${contentType}/add`}>
                <IconPlus />
                {t('add-field', 'Add field')}
              </Link>
            </Button>
          </Can>
        </Filter.Bar>
      </Filter>
    </PageSubHeader>
  );
};
