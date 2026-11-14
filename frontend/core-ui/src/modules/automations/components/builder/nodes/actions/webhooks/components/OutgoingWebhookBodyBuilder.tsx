import { useTranslation } from 'react-i18next';
import CodeMirror from '@uiw/react-codemirror';
import { cn, Form, Select } from 'erxes-ui';
import { PlaceholderInput } from 'ui-modules';
import { useOutgoingWebhookBodyEditor } from '@/automations/components/builder/nodes/actions/webhooks/hooks/useOutgoingWebhookBodyEditor';

export function OutgoingWebhookBodyBuilder({
  bodyMode,
  value,
  onChange,
  onBodyModeChange,
}: {
  bodyMode: 'json' | 'text';
  value: string;
  onChange: (value: string) => void;
  onBodyModeChange: (value: 'json' | 'text') => void;
}) {
  const { t } = useTranslation('automations');
  const { normalizedValue, isTextMode, isDragActive, extensions } =
    useOutgoingWebhookBodyEditor(value, bodyMode, onChange);

  return (
    <Form.Item className="flex flex-col h-full">
      <div className="flex items-center justify-between gap-3">
        <Form.Label>{t('body')}</Form.Label>
        <Select value={bodyMode} onValueChange={onBodyModeChange}>
          <Select.Trigger className="w-36">
            <Select.Value />
          </Select.Trigger>
          <Select.Content>
            <Select.Item value="json">JSON</Select.Item>
            <Select.Item value="text">{t('webhook-body-text')}</Select.Item>
          </Select.Content>
        </Select>
      </div>
      <Form.Message />
      {isTextMode ? (
        <PlaceholderInput
          value={normalizedValue}
          onChange={onChange}
          variant="expression"
        />
      ) : (
        <div
          className={cn(
            'rounded-md transition-colors',
            isDragActive ? 'ring-2 ring-primary/40 ring-offset-2' : '',
          )}
        >
          <CodeMirror
            value={normalizedValue}
            height="30rem"
            lang="json"
            extensions={extensions}
            basicSetup={{
              highlightActiveLine: false,
              highlightActiveLineGutter: false,
            }}
            onChange={onChange}
          />
        </div>
      )}
    </Form.Item>
  );
}
