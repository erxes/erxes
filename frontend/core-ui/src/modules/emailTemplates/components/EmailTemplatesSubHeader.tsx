import { EmailTemplatesDisplayControl } from '@/emailTemplates/components/EmailTemplatesDisplayControl';
import { EmailTemplatesTotalCount } from '@/emailTemplates/components/EmailTemplatesTotalCount';
import { Combobox, Command, Filter, PageSubHeader } from 'erxes-ui';

export const EmailTemplatesSubHeader = () => (
  <Filter id="email-templates">
    <PageSubHeader>
      <Filter.Bar>
        <Filter.Popover scope="email-templates-page">
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
        <EmailTemplatesTotalCount />

        <div className="ml-auto">
          <EmailTemplatesDisplayControl />
        </div>
      </Filter.Bar>
    </PageSubHeader>
  </Filter>
);
