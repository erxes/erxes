import { IconMinimize } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import type { TRelationEntity } from 'ui-modules/modules/widget/utils';
import { SidePanelNavigatorContext } from 'ui-modules/modules/widget/record-side-panel/recordView';
import { getRecordPanelListUrl } from 'ui-modules/modules/widget/record-side-panel/useSidePanelUtils';

export const RecordPageMinimize = ({
  record,
  listPath,
}: {
  record?: TRelationEntity | null;
  listPath?: string;
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'side-panel' });
  const navigator = useContext(SidePanelNavigatorContext);
  const navigate = useNavigate();
  const target = record ?? navigator?.record;
  const path = listPath ?? navigator?.listPath;

  if (!target || !path) {
    return null;
  }

  const label = t('minimize');

  return (
    <Button
      variant="ghost"
      size="icon"
      className="size-7 flex-none"
      onClick={() => navigate(getRecordPanelListUrl(path, target))}
      title={label}
      aria-label={label}
    >
      <IconMinimize className="size-4" />
    </Button>
  );
};
