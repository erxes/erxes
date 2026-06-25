import { Breadcrumb, ToggleGroup, recordTableCursorAtomFamily } from 'erxes-ui';
import { Link, useLocation } from 'react-router-dom';
import { useSetAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { usePutResponseLeadSessionKey } from '~/modules/ebarimt/put-response/hooks/usePutResponseLeadSessionKey';

export const DuplicatedBreadcrumb = () => {
  const { pathname } = useLocation();
  const { sessionKey } = usePutResponseLeadSessionKey();
  const setCursor = useSetAtom(recordTableCursorAtomFamily(sessionKey));
  const { t } = useTranslation('mongolian');
  return (
    <Breadcrumb>
      <Breadcrumb.List className="gap-1">
        <ToggleGroup type="single" value={pathname}>
          <ToggleGroup.Item
            value="/mongolian/put-response/put-response"
            asChild
            onClick={() => setCursor('')}
          >
            <Link to="/mongolian/put-response/put-response">{t('put-response')}</Link>
          </ToggleGroup.Item>
          <ToggleGroup.Item
            value="/mongolian/put-response/by-date"
            asChild
            onClick={() => setCursor('')}
          >
            <Link to="/mongolian/put-response/by-date">{t('by-date')}</Link>
          </ToggleGroup.Item>
          <ToggleGroup.Item
            value="/mongolian/put-response/duplicated"
            asChild
            onClick={() => setCursor('')}
          >
            <Link to="/mongolian/put-response/duplicated">{t('duplicated')}</Link>
          </ToggleGroup.Item>
        </ToggleGroup>
      </Breadcrumb.List>
    </Breadcrumb>
  );
};
