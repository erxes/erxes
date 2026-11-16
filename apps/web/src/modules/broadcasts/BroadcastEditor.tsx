import type { Broadcast } from '@erxes/core-contract';
import { IconDeviceFloppy } from '@tabler/icons-react';
import { Button, Input, ScrollArea, Separator, Spinner, useFormat } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCan } from '~/modules/auth/session';
import { type AudienceMode, AudienceSection, isAudienceMissing, modeOf } from './AudienceSection';
import { BroadcastActions } from './BroadcastActions';
import { BroadcastHeader } from './BroadcastHeader';
import { ContentSection } from './ContentSection';
import { PreviewPanel } from './PreviewPanel';
import { useBroadcastDraft } from './useBroadcastDraft';

/** Why it can't go yet, in the member's words; null when it can. */
const useBlocked = (broadcast: Broadcast, missingAudience: boolean) => {
  const { t } = useTranslation('broadcasts');

  if (missingAudience) return t('blocked-audience', 'Pick who gets it first');

  if (!broadcast.body.trim()) return t('blocked-body', 'Write the message first');

  if (broadcast.channel === 'email' && !broadcast.subject?.trim()) {
    return t('blocked-subject', 'Add a subject first');
  }

  return null;
};

/** A draft or scheduled broadcast: audience and copy on the left, the preview on the right. */
export const BroadcastEditor = ({ broadcast }: { broadcast: Broadcast }) => {
  const { t } = useTranslation('broadcasts');
  const fmt = useFormat();
  const can = useCan();
  const editor = useBroadcastDraft(broadcast);
  const { draft } = editor;
  const [mode, setMode] = useState<AudienceMode>(() => modeOf(broadcast));
  // What sending or scheduling uses: the editor's copy, which `prepare` saves first.
  const current = { ...broadcast, ...draft };
  const blocked = useBlocked(current, isAudienceMissing(mode, draft));

  return (
    <>
      <BroadcastHeader broadcast={broadcast}>
        <span className="text-xs text-muted-foreground">
          {editor.dirty
            ? t('unsaved', 'Unsaved changes')
            : t('saved-at', 'Saved {{when}}', { when: fmt.relative(broadcast.updatedAt) })}
        </span>
        <Button
          variant="outline"
          disabled={!editor.dirty || editor.saving}
          // The mutation's onError shows the failure.
          onClick={() => void editor.save().catch(() => undefined)}
        >
          {editor.saving ? <Spinner size="sm" /> : <IconDeviceFloppy />}
          {t('save', 'Save')}
        </Button>
        <BroadcastActions broadcast={current} prepare={editor.ensureSaved} blocked={blocked} />
      </BroadcastHeader>
      <ScrollArea className="flex-1">
        <div className="mx-auto grid max-w-7xl gap-8 p-6 lg:grid-cols-3">
          <div className="min-w-0 space-y-6 lg:col-span-2">
            <Input
              aria-label={t('name', 'Name')}
              value={draft.name}
              onChange={(event) => editor.change({ name: event.target.value })}
              placeholder={t('name-placeholder', 'Name, for your team')}
            />
            <AudienceSection
              channel={broadcast.channel}
              mode={mode}
              onModeChange={setMode}
              audience={draft}
              onChange={editor.change}
            />
            <Separator />
            <ContentSection
              channel={broadcast.channel}
              draft={draft}
              onChange={editor.change}
              unknownPlaceholders={editor.unknownPlaceholders}
            />
          </div>
          <PreviewPanel
            broadcast={broadcast}
            beforeTest={editor.ensureSaved}
            stale={editor.dirty}
            canTest={can('broadcasts.manage')}
          />
        </div>
      </ScrollArea>
    </>
  );
};
