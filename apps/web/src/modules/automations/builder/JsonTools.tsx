import { IconClipboard, IconCode } from '@tabler/icons-react';
import { Button, jsonOf, Popover, Textarea } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

const PasteJson = ({ onPaste }: { onPaste: (value: unknown) => void }) => {
  const { t } = useTranslation('automations');
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const parsed = jsonOf(z.json()).safeParse(text.trim());

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Popover.Trigger render={<Button variant="ghost" size="sm" tone="muted" className="h-7" />}>
        <IconClipboard />
        {t('json-paste', 'Paste JSON')}
      </Popover.Trigger>
      <Popover.Content align="end" className="w-96">
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">
            {t('json-paste-hint', 'Paste a sample: it becomes the rows above.')}
          </p>
          <Textarea
            rows={8}
            text="code"
            aria-label={t('json-paste', 'Paste JSON')}
            aria-invalid={Boolean(text.trim()) && !parsed.success}
            value={text}
            onChange={(event) => setText(event.target.value)}
          />
          {Boolean(text.trim()) && !parsed.success && (
            <p className="text-xs text-destructive-text">
              {t('invalid-json', 'Not valid JSON yet.')}
            </p>
          )}
          <Button
            size="sm"
            className="w-full"
            disabled={!parsed.success}
            onClick={() => {
              if (!parsed.success) return;

              onPaste(parsed.data);
              setText('');
              setOpen(false);
            }}
          >
            {t('json-paste-use', 'Use it')}
          </Button>
        </div>
      </Popover.Content>
    </Popover>
  );
};

export const JsonTools = ({
  value,
  disabled,
  onPaste,
}: {
  value: unknown;
  disabled: boolean;
  onPaste: (value: unknown) => void;
}) => {
  const { t } = useTranslation('automations');
  const [shown, setShown] = useState(false);

  return (
    <div className="space-y-2 border-t pt-1.5">
      <div className="flex justify-end gap-1">
        {!disabled && <PasteJson onPaste={onPaste} />}
        <Button
          variant="ghost"
          size="sm"
          tone="muted"
          className="h-7"
          aria-pressed={shown}
          onClick={() => setShown(!shown)}
        >
          <IconCode />
          {shown ? t('json-hide', 'Hide JSON') : t('json-show', 'View as JSON')}
        </Button>
      </div>
      {shown && (
        <pre className="max-h-60 overflow-auto rounded bg-muted p-2 text-2xs">
          {JSON.stringify(value, null, 2)}
        </pre>
      )}
    </div>
  );
};
