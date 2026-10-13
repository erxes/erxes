import { IconCalendarPlus } from '@tabler/icons-react';
import { Command, Filter } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { SelectMember } from 'ui-modules';

export const TemplateFilterDialog = () => (
  <Filter.Dialog>
    <Filter.View filterKey="searchValue" inDialog>
      <Filter.DialogStringView filterKey="searchValue" />
    </Filter.View>
    <Filter.View filterKey="createdAt" inDialog>
      <Filter.DialogDateView filterKey="createdAt" />
    </Filter.View>
    <Filter.View filterKey="updatedAt" inDialog>
      <Filter.DialogDateView filterKey="updatedAt" />
    </Filter.View>
  </Filter.Dialog>
);

export const TemplateAuditFilterBarItems = ({
  createdBy,
  updatedBy,
}: {
  createdBy?: string | string[] | null;
  updatedBy?: string | string[] | null;
}) => {
  const { t } = useTranslation('templates', { keyPrefix: 'filter' });

  return (
    <>
      <Filter.BarItem queryKey="createdAt">
        <Filter.BarName>
          <IconCalendarPlus />
          {t('created-at')}
        </Filter.BarName>
        <Filter.Date filterKey="createdAt" />
      </Filter.BarItem>

      <Filter.BarItem queryKey="updatedAt">
        <Filter.BarName>
          <IconCalendarPlus />
          {t('updated-at')}
        </Filter.BarName>
        <Filter.Date filterKey="updatedAt" />
      </Filter.BarItem>

      {createdBy && (
        <SelectMember.FilterBar queryKey="createdBy" label={t('created-by')} />
      )}

      {updatedBy && (
        <SelectMember.FilterBar queryKey="updatedBy" label={t('updated-by')} />
      )}
    </>
  );
};

export const TemplateAuditFilterItems = () => {
  const { t } = useTranslation('templates', { keyPrefix: 'filter' });

  return (
    <>
      <SelectMember.FilterItem value="createdBy" label={t('created-by')} />
      <SelectMember.FilterItem value="updatedBy" label={t('updated-by')} />

      <Command.Separator className="my-1" />

      <Filter.Item value="createdAt">
        <IconCalendarPlus />
        {t('created-at')}
      </Filter.Item>

      <Filter.Item value="updatedAt">
        <IconCalendarPlus />
        {t('updated-at')}
      </Filter.Item>
    </>
  );
};

export const TemplateAuditFilterViews = () => (
  <>
    <SelectMember.FilterView queryKey="createdBy" />
    <SelectMember.FilterView queryKey="updatedBy" />

    <Filter.View filterKey="createdAt">
      <Filter.DateView filterKey="createdAt" />
    </Filter.View>
    <Filter.View filterKey="updatedAt">
      <Filter.DateView filterKey="updatedAt" />
    </Filter.View>
  </>
);
