import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { EmailEditor, type EmailEditorRef } from '@react-email/editor';
import '@react-email/editor/themes/default.css';
import '@react-email/editor/styles/inspector.css';
import { Badge, Button, Input, Label } from 'erxes-ui';
import {
  IconArrowLeft,
  IconCode,
  IconDeviceFloppy,
  IconSparkles,
} from '@tabler/icons-react';
import { useAutomationEmailTemplateDetail } from '../hooks/useAutomationEmailTemplateDetail';
import {
  useCreateAutomationEmailTemplate,
  useUpdateAutomationEmailTemplate,
} from '../hooks/useAutomationEmailTemplateMutations';
import { countMatches, extractWords, getReadinessChecks } from './utils';
import { EditorSidebar } from './EditorSidebar';
import { ExportDialog } from './ExportDialog';

interface ExportState {
  html: string;
  text: string;
  json: string;
}

interface EmailTemplateEditorProps {
  templateId?: string;
}

export const EmailTemplateEditor = ({
  templateId,
}: EmailTemplateEditorProps) => {
  const navigate = useNavigate();
  const editorRef = useRef<EmailEditorRef>(null);
  const isEditing = !!templateId;

  const { emailTemplate, loading: loadingTemplate } =
    useAutomationEmailTemplateDetail(templateId ?? '');
  const { createEmailTemplate, loading: creating } =
    useCreateAutomationEmailTemplate();
  const { updateEmailTemplate, loading: updating } =
    useUpdateAutomationEmailTemplate();

  const [templateName, setTemplateName] = useState('');
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportState, setExportState] = useState<ExportState>({
    html: '',
    text: '',
    json: '',
  });

  useEffect(() => {
    if (emailTemplate?.name) {
      setTemplateName(emailTemplate.name);
    }
  }, [emailTemplate]);

  const syncExports = async (ref: EmailEditorRef | null) => {
    if (!ref) return;
    const { html, text } = await ref.getEmail();
    setExportState({
      html,
      text,
      json: JSON.stringify(ref.getJSON(), null, 2),
    });
  };

  const readinessChecks = useMemo(
    () => getReadinessChecks(exportState.html, exportState.text),
    [exportState],
  );

  const readinessScore = useMemo(() => {
    const passed = readinessChecks.filter((c) => c.tone === 'success').length;
    return Math.round((passed / readinessChecks.length) * 100);
  }, [readinessChecks]);

  const stats = useMemo(
    () => ({
      words: extractWords(exportState.text).length,
      links: countMatches(exportState.html, /<a\b[^>]*href=/gi),
      images: countMatches(exportState.html, /<img\b/gi),
      headings: countMatches(exportState.html, /<h[1-3]\b/gi),
    }),
    [exportState],
  );

  const handleSave = async () => {
    const name = templateName.trim() || 'Untitled';
    if (isEditing && templateId) {
      await updateEmailTemplate({
        _id: templateId,
        name,
        content: exportState.html,
      });
    } else {
      await createEmailTemplate({ name, content: exportState.html });
    }
    navigate('/settings/automations/email-templates');
  };

  const isSaving = creating || updating;

  if (loadingTemplate && isEditing) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading template…</p>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col">
      <header className="flex shrink-0 items-center justify-between gap-4 border-b px-6 py-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/settings/automations/email-templates">
              <IconArrowLeft className="size-4" />
              Back
            </Link>
          </Button>
          <div className="h-5 w-px bg-border" />
          <Label htmlFor="template-name" className="sr-only">
            Template name
          </Label>
          <Input
            id="template-name"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            placeholder="Template name"
            className="h-8 w-60 text-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <Badge
            variant={readinessScore >= 80 ? 'success' : 'warning'}
            className="h-7 px-3"
          >
            <IconSparkles className="size-3.5" />
            {readinessScore}% ready
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setExportDialogOpen(true)}
          >
            <IconCode className="size-4" />
            Export
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/settings/automations/email-templates')}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={() => void handleSave()}
            disabled={isSaving}
          >
            <IconDeviceFloppy className="size-4" />
            {isSaving ? 'Saving…' : isEditing ? 'Update' : 'Create'}
          </Button>
        </div>
      </header>

      {/* force light color-scheme so the email canvas never renders with a dark background */}
      <div className="flex min-h-0 flex-1 overflow-hidden [color-scheme:light]">
        <EmailEditor
          ref={editorRef}
          content={emailTemplate?.content ?? ''}
          placeholder="Press '/' for commands…"
          className="grid min-h-0 w-full grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px]"
          onReady={(ref) => void syncExports(ref)}
          onUpdate={(ref) => void syncExports(ref)}
        >
          <EditorSidebar
            readinessScore={readinessScore}
            readinessChecks={readinessChecks}
            stats={stats}
          />
        </EmailEditor>
      </div>

      <ExportDialog
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
        exportState={exportState}
      />
    </div>
  );
};
