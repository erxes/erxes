import { ComposerFooter } from '@/integrations/mail/composer/components/DirectMailComposerFooter';
import { ComposerHeader } from '@/integrations/mail/composer/components/DirectMailComposerHeader';
import {
  ComposerAttachments,
  ComposerStatus,
} from '@/integrations/mail/composer/components/DirectMailComposerStatus';
import { ComposerFields } from '@/integrations/mail/composer/components/fields/DirectMailComposerFields';
import { useDirectMailComposerContext } from '@/integrations/mail/composer/hooks/useDirectMailComposerFields';
import { cn, Sheet } from 'erxes-ui';

export const ComposerWindow = () => {
  const { expanded, minimized, form, submit } = useDirectMailComposerContext();
  const { handleSubmit } = form;
  return (
    <>
      {expanded && !minimized && (
        <div className="fixed inset-0 z-40 bg-black/40" aria-hidden="true" />
      )}
      <Sheet.Content
        role="region"
        aria-label="New email"
        className={cn(
          'fixed z-50 flex flex-col overflow-hidden rounded-b-none rounded-t-lg border bg-background text-foreground shadow-2xl',
          expanded && !minimized
            ? 'inset-x-4 top-6 bottom-4 sm:inset-x-[8vw] sm:top-[6vh]'
            : 'inset-x-2 bottom-0 sm:inset-x-auto sm:right-4',
          minimized
            ? 'sm:w-80'
            : !expanded &&
                'h-[min(600px,calc(100dvh-2rem))] sm:w-[min(600px,calc(100vw-2rem))]',
        )}
      >
        <ComposerHeader />
        <form
          className={cn('flex min-h-0 flex-1 flex-col', minimized && 'hidden')}
          onSubmit={(event) => {
            event.preventDefault();
            if (
              event.nativeEvent instanceof SubmitEvent &&
              event.nativeEvent.submitter?.closest('[data-mail-editor]')
            )
              return;
            void handleSubmit(submit)(event);
          }}
        >
          <ComposerFields />
          <ComposerAttachments />
          <ComposerStatus />
          <ComposerFooter />
        </form>
      </Sheet.Content>
    </>
  );
};
