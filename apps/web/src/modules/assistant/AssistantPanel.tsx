import { useAtom, useSetAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { RecordSidePanelResizeHandle } from '~/modules/side-panel/RecordSidePanelResizeHandle';
import { clampWidth } from '~/modules/side-panel/resizeDrag';
import { ASSISTANT_WIDTH, assistantOpenState, assistantWidthState } from './assistantState';
import { Conversation } from './Conversation';
import { PanelHeader } from './PanelHeader';
import { useAssistantTabs } from './useAssistantTabs';

const focusToggle = () => {
  const toggle = document.querySelector('[aria-controls="assistant-panel"]');

  if (toggle instanceof HTMLElement) toggle.focus();
};

export const AssistantPanel = ({ open }: { open: boolean }) => {
  const { t } = useTranslation('assistant');
  const [width, setWidth] = useAtom(assistantWidthState);
  const setOpen = useSetAtom(assistantOpenState);
  const tabs = useAssistantTabs();
  const panelWidth = clampWidth(width, ASSISTANT_WIDTH.max);

  const close = () => {
    setOpen(false);
    focusToggle();
  };

  return (
    <aside
      id="assistant-panel"
      aria-label={t('title', 'Assistant')}
      hidden={!open}
      style={{ '--panel-width': `${panelWidth}px` }}
      className="relative flex min-h-0 shrink-0 flex-col border-l bg-background md:w-(--panel-width) max-md:fixed max-md:inset-0 max-md:z-50"
    >
      <div className="max-md:hidden">
        <RecordSidePanelResizeHandle
          width={panelWidth}
          maxWidth={ASSISTANT_WIDTH.max}
          onWidthChange={setWidth}
        />
      </div>
      <PanelHeader tabs={tabs} onClose={close} />
      {tabs.active && (
        <Conversation key={tabs.active.key} tab={tabs.active} tabs={tabs} open={open} />
      )}
    </aside>
  );
};
