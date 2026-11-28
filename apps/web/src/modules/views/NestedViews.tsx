import type { ViewRecordType } from '@erxes/core-contract';
import { IconChevronDown, IconLayoutList, IconUsers } from '@tabler/icons-react';
import { cn, Sidebar, storedFamily } from 'erxes-ui';
import { useAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { useQueryState } from 'nuqs';
import { Link, useLocation } from 'react-router-dom';
import { z } from 'zod';
import { messageOf } from '@erxes/core-contract/client';
import { useViews } from './useViews';
import { LIST_PATHS } from '~/lib/paths';
import { viewHref } from './viewLinks';

/** Whether a list's saved views are folded in the sidebar, per browser; folded until opened. */
const foldedState = storedFamily({ key: 'erxes:views:folded', schema: z.boolean(), initial: true });

/**
 * A list's saved views, nested under it in an app's sidebar (shown whenever there are any). A
 * chevron on the list's row folds them; folded, only the open view stays.
 */
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
  const [folded, setFolded] = useAtom(foldedState(recordType));
  const views = data?.data ?? [];

  if (error) {
    return (
      <p role="alert" className={cn('px-2 text-xs text-destructive-text', indent && 'ml-5')}>
        {messageOf(error)}
      </p>
    );
  }

  if (!views.length) return null;

  const here = pathname === LIST_PATHS[recordType];
  const shown = folded ? views.filter((view) => here && view.id === viewId) : views;
  const label = folded ? t('show-views', { count: views.length }) : t('hide-views');

  return (
    <>
      <Sidebar.MenuAction
        aria-expanded={!folded}
        aria-label={label}
        title={label}
        onClick={() => setFolded(!folded)}
      >
        <IconChevronDown
          className={cn('text-muted-foreground transition-transform', folded && '-rotate-90')}
        />
      </Sidebar.MenuAction>
      {shown.length > 0 && (
        <Sidebar.Sub className={cn(indent && 'ml-5')}>
          {shown.map((view) => (
            <Sidebar.SubItem key={view.id}>
              <Sidebar.SubButton
                size="sm"
                isActive={here && viewId === view.id}
                render={
                  <Link
                    to={viewHref(recordType, view)}
                    title={view.shared ? t('shared') : t('mine')}
                  />
                }
              >
                {view.shared ? <IconUsers /> : <IconLayoutList />}
                <span className="truncate">{view.name}</span>
              </Sidebar.SubButton>
            </Sidebar.SubItem>
          ))}
        </Sidebar.Sub>
      )}
    </>
  );
};
