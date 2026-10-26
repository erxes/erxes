import { uploadEmailImage } from '@/emailTemplates/utils/uploadEmailImage';
import {
  IconDeviceFloppy,
  IconMail,
  IconNotification,
  IconSend,
  IconUpload,
} from '@tabler/icons-react';
import { Breadcrumb, Button, EmailEditor, Form, Spinner } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import { PageHeader, PageHeaderEnd, PageHeaderStart } from 'ui-modules';
import { useNotificationTemplateEditor } from '../hooks/useNotificationTemplateEditor';
import { NotificationTemplateBrandFrame } from './NotificationTemplateBrandFrame';
import { NotificationTemplateHeaderFields } from './NotificationTemplateHeaderFields';
import { NotificationTemplateLeaveDialog } from './NotificationTemplateLeaveDialog';
import { NotificationTemplateSidePanel } from './NotificationTemplateSidePanel';
import { NOTIFICATION_TEMPLATES_PATH } from './NotificationTemplatesList';
import { NotificationTemplateStatusBar } from './NotificationTemplateStatusBar';

const NotificationTemplateEditorBreadcrumb = ({ title }: { title: string }) => {
  const { t } = useTranslation('common', { keyPrefix: 'notification' });

  return (
    <Breadcrumb>
      <Breadcrumb.List className="gap-1">
        <Breadcrumb.Item>
          <Button variant="ghost" asChild>
            <Link to="/settings/notification">
              <IconNotification />
              {t('notifications')}
            </Link>
          </Button>
        </Breadcrumb.Item>
        <Breadcrumb.Separator />
        <Breadcrumb.Item>
          <Button variant="ghost" asChild>
            <Link to={NOTIFICATION_TEMPLATES_PATH}>
              <IconMail />
              {t('email-templates')}
            </Link>
          </Button>
        </Breadcrumb.Item>
        <Breadcrumb.Separator />
        <Breadcrumb.Item>
          <Breadcrumb.Page>{title}</Breadcrumb.Page>
        </Breadcrumb.Item>
      </Breadcrumb.List>
    </Breadcrumb>
  );
};

export const NotificationTemplateEditor = () => {
  const { key = '' } = useParams<{ key: string }>();
  const { t } = useTranslation('common', { keyPrefix: 'notification' });
  const editor = useNotificationTemplateEditor(key);

  if (editor.loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Spinner />
      </div>
    );
  }

  if (!editor.template) {
    return (
      <div className="flex flex-col justify-center items-center gap-3 h-full text-sm">
        <p className="text-muted-foreground">{t('template-not-found')}</p>
        <Button variant="outline" asChild>
          <Link to={NOTIFICATION_TEMPLATES_PATH}>{t('email-templates')}</Link>
        </Button>
      </div>
    );
  }

  return (
    <Form {...editor.form}>
      <PageHeader>
        <PageHeaderStart>
          <NotificationTemplateEditorBreadcrumb title={editor.template.title} />
        </PageHeaderStart>
        <PageHeaderEnd>
          <Button
            variant="ghost"
            onClick={editor.sendTest}
            disabled={editor.sendingTest}
          >
            <IconSend />
            {t('send-test')}
          </Button>
          <Button
            variant="outline"
            onClick={editor.saveDraft}
            disabled={!editor.isDirty || editor.saving}
          >
            <IconDeviceFloppy />
            {t('save-draft')}
          </Button>
          <Button onClick={editor.publish} disabled={editor.saving}>
            <IconUpload />
            {editor.saving ? t('saving') : t('publish')}
          </Button>
        </PageHeaderEnd>
      </PageHeader>

      <NotificationTemplateStatusBar
        template={editor.template}
        conflict={editor.conflict}
        onReload={editor.reload}
        onRevert={editor.revert}
      />

      <div className="flex flex-1 min-h-0">
        <main className="flex-1 bg-muted/40 p-6 min-h-0 overflow-y-auto">
          <div className="flex flex-col gap-4 mx-auto w-full max-w-[720px]">
            <NotificationTemplateHeaderFields
              control={editor.form.control}
              subject={editor.subject || ''}
            />
            <div className="bg-white shadow-sm border rounded-lg">
              <NotificationTemplateBrandFrame part="header" />
              <EmailEditor
                key={editor.editorKey}
                contentJson={editor.contentJson}
                onChange={editor.setContentJson}
                onCreate={editor.onEditorCreate}
                variables={editor.variables}
                onImageUpload={uploadEmailImage}
                className="min-h-[360px]"
              />
              <NotificationTemplateBrandFrame part="footer" />
            </div>
          </div>
        </main>

        <NotificationTemplateSidePanel
          templateKey={editor.template.key}
          variables={editor.template.variables}
          contentJson={editor.contentJson}
          subject={editor.subject || ''}
          preheader={editor.preheader || ''}
        />
      </div>

      <NotificationTemplateLeaveDialog blocker={editor.blocker} />
    </Form>
  );
};
