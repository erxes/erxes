import { Breadcrumb, ToggleGroup, recordTableCursorAtomFamily } from 'erxes-ui';
import { Link, useLocation } from 'react-router-dom';
import { useSetAtom } from 'jotai';
import { usePutResponseLeadSessionKey } from '@/put-response/hooks/usePutResponseLeadSessionKey';

export const ByDateBreadcrumb = () => {
  const { pathname } = useLocation();
  const { sessionKey } = usePutResponseLeadSessionKey();
  const setCursor = useSetAtom(recordTableCursorAtomFamily(sessionKey));
  return (
    <Breadcrumb>
      <Breadcrumb.List className="gap-1">
        <ToggleGroup type="single" value={pathname}>
          <ToggleGroup.Item
            value="/mongolian/put-response/put-response"
            asChild
            onClick={() => setCursor('')}
          >
            <Link to="/mongolian/put-response/put-response">Put Response</Link>
          </ToggleGroup.Item>
          <ToggleGroup.Item
            value="/mongolian/put-response/by-date"
            asChild
            onClick={() => setCursor('')}
          >
            <Link to="/mongolian/put-response/by-date">By Date</Link>
          </ToggleGroup.Item>
          <ToggleGroup.Item
            value="/mongolian/put-response/duplicated"
            asChild
            onClick={() => setCursor('')}
          >
            <Link to="/mongolian/put-response/duplicated">Duplicated</Link>
          </ToggleGroup.Item>
        </ToggleGroup>
      </Breadcrumb.List>
    </Breadcrumb>
  );
};
