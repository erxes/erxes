import { RecordOpenerProvider } from 'erxes-ui';
import { useAtom, useSetAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { paths } from '~/lib/paths';
import { useRecordPageNavigation } from '~/modules/side-panel/panelNavigation';
import { recordPagePath, usePanelRecordType } from '~/modules/side-panel/panelRecordTypes';
import { RecordSidePanel } from '~/modules/side-panel/RecordSidePanel';
import { SidePanelNavigatorContext } from '~/modules/side-panel/recordView';
import { SidePanelRecord } from '~/modules/side-panel/SidePanelLayout';
import { useSidePanel } from '~/modules/side-panel/useSidePanel';
import { ASSISTANT_WIDTH, assistantOpenState, assistantWidthState } from './assistantState';
import { Conversation } from './Conversation';
import { PanelHeader } from './PanelHeader';
import { useAssistantTabs } from './useAssistantTabs';
import { useShownRecords } from './useShownRecords';

const focusToggle = () => {
  const toggle = document.querySelector('[aria-controls="assistant-panel"]');

  if (toggle instanceof HTMLElement) toggle.focus();
};

export const AssistantPanel = ({ open }: { open: boolean }) => {
  const { t } = useTranslation('assistant');
  const [width, setWidth] = useAtom(assistantWidthState);
  const setOpen = useSetAtom(assistantOpenState);
  const tabs = useAssistantTabs();
  const shown = useShownRecords();
  const { openNewRecord } = useSidePanel();
  const { pathname, search } = useLocation();
  const navigate = useNavigate();
  const { openPage } = useRecordPageNavigation();
  const { type } = usePanelRecordType(shown.top?.record.contentType ?? '');
  const recordPage = shown.top ? recordPagePath(type, shown.top.record, pathname) : null;
  const chatShown = shown.top === null;

  const close = () => {
    setOpen(false);
    focusToggle();
  };

  return (
    <RecordSidePanel
      id="assistant-panel"
      label={t('title', 'Assistant')}
      hidden={!open}
      className="absolute top-12 right-2 bottom-2 z-30 rounded-xl border shadow-xl max-md:fixed max-md:inset-0 max-md:z-50 max-md:w-full max-md:rounded-none max-md:border-0"
      width={width}
      maxWidth={ASSISTANT_WIDTH.max}
      onWidthChange={setWidth}
      expanded={false}
      expandable={Boolean(recordPage)}
      onExpandedChange={() => {
        if (!recordPage || !shown.top) return;

        openPage(recordPage, shown.top.tab);
        shown.navigator?.close();
      }}
    >
      <RecordOpenerProvider
        open={({ tab, ...record }) => shown.show(record, tab)}
        openNew={(contentType, defaults) => openNewRecord(contentType, defaults)}
        current={shown.top?.record ?? null}
        dismiss={shown.dismiss}
      >
        <div
          hidden={!chatShown}
          inert={!chatShown}
          className={chatShown ? 'flex min-h-0 flex-1 flex-col' : 'hidden'}
        >
          <PanelHeader
            tabs={tabs}
            onClose={close}
            onExpand={() => {
              setOpen(false);
              void navigate(paths.assistant, { state: { from: `${pathname}${search}` } });
            }}
          />
          {tabs.active && (
            <Conversation key={tabs.active.key} tab={tabs.active} tabs={tabs} open={open} />
          )}
        </div>
      </RecordOpenerProvider>
      {shown.top && (
        <SidePanelNavigatorContext.Provider value={shown.navigator}>
          <SidePanelRecord
            key={JSON.stringify(shown.top.record)}
            record={shown.top.record}
            onBack={shown.navigator?.back}
            onClose={close}
          />
        </SidePanelNavigatorContext.Provider>
      )}
    </RecordSidePanel>
  );
};
