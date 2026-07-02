import { IconSearch } from '@tabler/icons-react';
import { Filter, useFilterQueryState } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { TAGS_CURSOR_SESSION_KEY } from '../constants/tagsCursorSessionKey';
import { SimpleSearchFilterPopover } from '~/modules/cms/shared/components/SimpleSearchFilterPopover';
import { TagsTotalCount } from './TagsTotalCount';

export const TagsFilter = () => {
  const { t } = useTranslation('content');
  const [searchValue] = useFilterQueryState<string>('searchValue');

  return (
    <Filter id="tags-filter" sessionKey={TAGS_CURSOR_SESSION_KEY}>
      <Filter.Bar>
        <Filter.BarItem queryKey="searchValue">
          <Filter.BarName>
            <IconSearch />
            {t('search')}
          </Filter.BarName>
          <Filter.BarButton filterKey="searchValue" inDialog>
            {searchValue}
          </Filter.BarButton>
        </Filter.BarItem>
        <SimpleSearchFilterPopover />
        <TagsTotalCount />
      </Filter.Bar>
    </Filter>
  );
};
