import { IconAlertTriangle, IconCopy } from '@tabler/icons-react';
import {
  CopyText,
  EmailPreviewDevice,
  EmailPreviewDeviceToggle,
  EmailPreviewFrame,
  JSONContent,
  Spinner,
  Tabs,
} from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNotificationTemplatePreview } from '../hooks/useNotificationTemplatePreview';
import { TNotificationTemplateVariable } from '../types';

const NotificationTemplateFields = ({
  variables,
}: {
  variables: TNotificationTemplateVariable[];
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'notification' });

  return (
    <div className="flex flex-col gap-3 p-4">
      <p className="text-muted-foreground text-xs">{t('fields-hint')}</p>
      {variables.map(({ name, label, sample, required }) => (
        <div key={name} className="flex flex-col gap-1 p-3 border rounded-lg">
          <div className="flex justify-between items-center gap-2">
            <span className="font-medium text-xs">
              {label}
              {required && (
                <span className="ml-1 text-destructive">
                  {t('field-required')}
                </span>
              )}
            </span>
            <CopyText
              value={`{{ ${name} }}`}
              className="text-muted-foreground hover:text-foreground text-xs"
            >
              <IconCopy size={12} />
              <code>{`{{ ${name} }}`}</code>
            </CopyText>
          </div>
          {sample && (
            <span className="text-[11px] text-muted-foreground truncate">
              {t('field-sample', { sample })}
            </span>
          )}
        </div>
      ))}
    </div>
  );
};

const NotificationTemplatePreview = ({
  templateKey,
  contentJson,
  subject,
  preheader,
}: {
  templateKey: string;
  contentJson?: JSONContent;
  subject: string;
  preheader: string;
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'notification' });
  const [device, setDevice] = useState<EmailPreviewDevice>('desktop');
  const { preview, loading, error } = useNotificationTemplatePreview({
    templateKey,
    contentJson,
    subject,
    preheader,
  });

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex justify-between items-center gap-2 px-3 py-2 border-b">
        <span className="text-xs truncate">
          <span className="text-muted-foreground">{t('subject')}: </span>
          {preview?.subject}
        </span>
        <EmailPreviewDeviceToggle value={device} onChange={setDevice} />
      </div>

      {!!preview?.unresolved?.length && (
        <div className="flex items-start gap-2 bg-warning/10 px-3 py-2 text-xs">
          <IconAlertTriangle size={14} className="flex-none mt-0.5 text-warning" />
          {t('preview-unresolved', {
            fields: preview.unresolved.map((path) => `{{ ${path} }}`).join(', '),
          })}
        </div>
      )}

      <div className="flex-1 min-h-0">
        {error ? (
          <div className="flex justify-center items-center p-6 h-full text-destructive text-sm text-center">
            {error.message}
          </div>
        ) : !preview?.html ? (
          <div className="flex justify-center items-center h-full">
            {loading && <Spinner />}
          </div>
        ) : (
          <EmailPreviewFrame html={preview.html} device={device} className="h-full" />
        )}
      </div>
    </div>
  );
};

/** The fields a template can use, and the email filled with sample values. */
export const NotificationTemplateSidePanel = ({
  templateKey,
  variables,
  contentJson,
  subject,
  preheader,
}: {
  templateKey: string;
  variables: TNotificationTemplateVariable[];
  contentJson?: JSONContent;
  subject: string;
  preheader: string;
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'notification' });

  return (
    <aside className="flex flex-col bg-background border-l w-[42%] min-w-[320px] shrink-0">
      <Tabs defaultValue="preview" className="flex flex-col h-full min-h-0">
        <Tabs.List className="px-3 border-b">
          <Tabs.Trigger value="preview">{t('preview')}</Tabs.Trigger>
          <Tabs.Trigger value="fields">{t('fields')}</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="preview" className="flex-1 min-h-0">
          <NotificationTemplatePreview
            templateKey={templateKey}
            contentJson={contentJson}
            subject={subject}
            preheader={preheader}
          />
        </Tabs.Content>
        <Tabs.Content value="fields" className="flex-1 min-h-0 overflow-y-auto">
          <NotificationTemplateFields variables={variables} />
        </Tabs.Content>
      </Tabs>
    </aside>
  );
};
