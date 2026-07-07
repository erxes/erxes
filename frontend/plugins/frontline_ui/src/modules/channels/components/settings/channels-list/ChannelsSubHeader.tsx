import { Combobox, Command, Filter, PageSubHeader } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { ChannelsTotalCount } from './ChannelsTotalCount';

export const ChannelsSubHeader = () => {
  const { t } = useTranslation('frontline');

  return (
    <Filter id="channels-filter">
      <PageSubHeader>
        <Filter.Bar>
          <Filter.Popover scope="channels-settings-page">
            <Filter.Trigger />
            <Combobox.Content>
              <Filter.View>
                <Command>
                  <Filter.CommandInput
                    placeholder={t('filter')}
                    variant="secondary"
                    className="bg-background"
                  />
                  <Command.List className="p-1">
                    <Filter.SearchValueTrigger />
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
          <Filter.SearchValueBarItem />
          <ChannelsTotalCount />
        </Filter.Bar>
      </PageSubHeader>
    </Filter>
  );
};
