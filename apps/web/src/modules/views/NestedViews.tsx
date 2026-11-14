import type { ViewRecordType } from '@erxes/core-contract';
import { IconLayoutList, IconUsers } from '@tabler/icons-react';
import { cn, Sidebar } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useQueryState } from 'nuqs';
import { Link, useLocation } from 'react-router-dom';
import { messageOf } from '@erxes/core-contract/client';
import { useViews } from './useViews';
import { LIST_PATHS } from '~/lib/paths';
import { viewHref } from './viewLinks';

/** A list's saved views, nested under it in an app's sidebar (shown whenever there are any). */
export const NestedViews = ({
  recordType,
  indent = false,
}: {
  recordType: ViewRecordType;
  indent?: boolean;
}) => {
  const { data, error } = useViews(recordType);
  const { t } = useTranslation('views');
  const { pathname } = useLocation();
  const [viewId] = useQueryState('view');
  const views = data?.data ?? [];

  if (error) {
    return (
      <p role="alert" className={cn('px-2 text-xs text-destructive', indent && 'ml-5')}>
        {messageOf(error)}
      </p>
    );
  }

  if (!views.length) return null;

  const here = pathname === LIST_PATHS[recordType];

  return (
    <Sidebar.Sub className={cn(indent && 'ml-5')}>
      {views.map((view) => (
        <Sidebar.SubItem key={view.id}>
          <Sidebar.SubButton
            size="sm"
            isActive={here && viewId === view.id}
            render={
              <Link to={viewHref(recordType, view)} title={view.shared ? t('shared') : t('mine')} />
            }
          >
            {view.shared ? <IconUsers /> : <IconLayoutList />}
            <span className="truncate">{view.name}</span>
          </Sidebar.SubButton>
        </Sidebar.SubItem>
      ))}
    </Sidebar.Sub>
  );
};
