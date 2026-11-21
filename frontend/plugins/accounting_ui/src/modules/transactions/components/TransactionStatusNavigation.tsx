import { Sidebar, useQueryState, useRecordTableCursor } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useSearchParams } from 'react-router';
import { AccountingPath } from '@/types/AccountingPath';
import { ACCTRANSACTIONS_CURSOR_SESSION_KEY } from '~/modules/accountsSessionKeys';
import { TR_STATUS_GROUPS, TR_STATUS_LABELS } from '../types/constants';

/**
 * Status shortcuts nested under the Transactions menu item. They set
 * `navStatus`, never the toolbar's `status`/`statuses`: the backend narrows
 * requests and addressed drafts to the signed-in recipient and personal
 * drafts to their performer, and an explicit status filter overrides it.
 * Without `navStatus` the list shows Committed, so that group is active.
 */
export const TransactionStatusNavigation = () => {
  const { t } = useTranslation('accounting');
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const { setCursor } = useRecordTableCursor({
    sessionKey: ACCTRANSACTIONS_CURSOR_SESSION_KEY,
  });
  const [navStatus] = useQueryState<string>('navStatus');

  const onList = pathname === AccountingPath.Main;
  const selected = onList ? navStatus || TR_STATUS_GROUPS[0].key : '';

  const linkTo = (value: string) => {
    const params = new URLSearchParams(onList ? searchParams : undefined);
    params.set('navStatus', value);
    return { pathname: AccountingPath.Main, search: params.toString() };
  };

  const resetCursor = () => {
    sessionStorage.removeItem(ACCTRANSACTIONS_CURSOR_SESSION_KEY);
    setCursor('');
  };

  return (
    <Sidebar.Sub className="border-l">
      {TR_STATUS_GROUPS.map((group) => {
        const inGroup =
          selected === group.key || group.values.includes(selected);

        return (
          <Sidebar.SubItem key={group.key}>
            <Sidebar.SubButton
              asChild
              className="font-medium"
              isActive={selected === group.key}
            >
              <Link to={linkTo(group.key)} onClick={resetCursor}>
                <span>{t(group.label)}</span>
              </Link>
            </Sidebar.SubButton>
            {inGroup && group.values.length > 1 && (
              <Sidebar.Sub className="border-l">
                {group.values.map((value) => (
                  <Sidebar.SubItem key={value}>
                    <Sidebar.SubButton asChild isActive={selected === value}>
                      <Link to={linkTo(value)} onClick={resetCursor}>
                        <span>{t(TR_STATUS_LABELS[value])}</span>
                      </Link>
                    </Sidebar.SubButton>
                  </Sidebar.SubItem>
                ))}
              </Sidebar.Sub>
            )}
          </Sidebar.SubItem>
        );
      })}
    </Sidebar.Sub>
  );
};
