import { Breadcrumb, ToggleGroup, recordTableCursorAtomFamily } from 'erxes-ui';
import { Link, useLocation } from 'react-router-dom';
import { useSetAtom } from 'jotai';
import { useErkhetSyncHistorySessionKey } from '../hooks/useErkhetSyncLeadSessionKey';

export const ErkhetSyncHistoryBreadcrumb = () => {
  const { pathname } = useLocation();
  const { sessionKey } = useErkhetSyncHistorySessionKey();
  const setCursor = useSetAtom(recordTableCursorAtomFamily(sessionKey));
  return (
    <Breadcrumb>
      <Breadcrumb.List className="gap-1">
        <ToggleGroup type="single" value={pathname}>
          <ToggleGroup.Item
            value="/mongolian/erkhet-sync"
            asChild
            onClick={() => setCursor('')}
          >
            <Link to="/mongolian/erkhet-sync">Erkhet Sync</Link>
          </ToggleGroup.Item>
        </ToggleGroup>
      </Breadcrumb.List>
    </Breadcrumb>
  );
};
