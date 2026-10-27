import { Button, Empty } from 'erxes-ui';
import { useAtomValue, useSetAtom } from 'jotai';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  modulePanelEntriesState,
  modulePanelTargetsState,
} from '../states/modulePanelState';

export const CoreModulePanelSlot = ({
  path,
  onClose,
}: {
  path: string;
  onClose: () => void;
}) => {
  const entries = useAtomValue(modulePanelEntriesState);
  const setTargets = useSetAtom(modulePanelTargetsState);
  const { t } = useTranslation('common', { keyPrefix: 'side-panel' });
  const setTarget = useCallback(
    (target: HTMLDivElement | null) => {
      setTargets((previous) => {
        if (previous[path] === target || (!target && !previous[path]))
          return previous;
        const next = { ...previous };
        if (target) next[path] = target;
        else delete next[path];
        return next;
      });
    },
    [path, setTargets],
  );

  return entries[path] ? (
    <div ref={setTarget} className="flex min-h-0 flex-1 flex-col" />
  ) : (
    <Empty>
      <Empty.Header>
        <Empty.Title>{t('not-found-title', 'Nothing here')}</Empty.Title>
        <Empty.Description>
          {t('module-unavailable', 'This editor is unavailable on this page.')}
        </Empty.Description>
      </Empty.Header>
      <Empty.Content>
        <Button onClick={onClose}>{t('close', 'Close')}</Button>
      </Empty.Content>
    </Empty>
  );
};
