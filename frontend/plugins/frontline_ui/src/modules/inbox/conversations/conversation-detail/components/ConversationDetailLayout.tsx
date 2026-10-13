import { Resizable } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { useTranslation } from 'react-i18next';
import { useComposerPanelResize } from '@/inbox/conversations/conversation-detail/hooks/composer/useComposerPanelResize';
import { isInternalNoteCollapsedState } from '@/inbox/conversations/conversation-detail/states/isInternalState';

export const ConversationDetailLayout = ({
  children,
  input,
}: {
  children: React.ReactNode;
  input: React.ReactNode;
}) => {
  const { t } = useTranslation('frontline');
  const collapsed = useAtomValue(isInternalNoteCollapsedState);
  const {
    panelGroupRef,
    inputPanelRef,
    minSize,
    rememberContentHeight,
    resizeForContent,
    resetAutoResize,
  } = useComposerPanelResize();

  return (
    <div ref={panelGroupRef} className="min-h-0 min-w-0 flex-1">
      <Resizable.PanelGroup
        direction="vertical"
        className="min-h-0 min-w-0 overflow-visible!"
        onInputCapture={(event) => resizeForContent(event.target)}
        onKeyUpCapture={(event) => resizeForContent(event.target)}
        onFocusCapture={(event) => rememberContentHeight(event.target)}
      >
        <Resizable.Panel defaultSize={input ? 70 : 100} minSize={0}>
          <div className="relative h-full min-h-0 overflow-hidden">
            {children}
          </div>
        </Resizable.Panel>
        {input && (
          <>
            <Resizable.Handle
              withHandle={!collapsed}
              disabled={collapsed}
              aria-label={t('resize-composer', 'Resize composer')}
              className={
                collapsed
                  ? 'z-30 bg-border/60 after:hidden'
                  : 'z-30 bg-border/60 hover:bg-border [&>div]:h-9 [&>div]:w-4 [&>div]:rounded-md [&>div]:border-border [&>div]:bg-background [&>div]:text-muted-foreground [&>div]:shadow-sm'
              }
              onDragging={resetAutoResize}
              onKeyUp={collapsed ? undefined : resetAutoResize}
            />
            <Resizable.Panel
              ref={inputPanelRef}
              className="min-h-0 overflow-visible!"
              defaultSize={30}
              minSize={collapsed ? 0 : minSize}
              maxSize={100}
            >
              <div className="relative z-20 h-full min-h-0 border-t border-border/60 bg-background/95 backdrop-blur">
                {input}
              </div>
            </Resizable.Panel>
          </>
        )}
      </Resizable.PanelGroup>
    </div>
  );
};
