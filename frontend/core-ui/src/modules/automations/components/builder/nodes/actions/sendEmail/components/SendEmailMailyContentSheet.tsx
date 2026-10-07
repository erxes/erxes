import { EmailPastedVariables } from '@/automations/components/builder/nodes/actions/sendEmail/utils/emailPastedVariables';
import { EmailTemplateSelector } from '@/automations/components/builder/nodes/actions/sendEmail/components/EmailTemplateSelector';
import {
  createEmailOutputVariableDrop,
  TEmailVariableDrop,
} from '@/automations/components/builder/nodes/actions/sendEmail/utils/emailVariableDrop';
import {
  AutomationVariableBrowser,
  TAutomationVariableSourceNode,
} from '@/automations/components/builder/sidebar/components/output-variables/AutomationVariableBrowser';
import { buildEmailItemTable } from '@/automations/components/builder/nodes/actions/sendEmail/utils/emailItemTable';
import { EmailContentEditor } from '@/emailTemplates/components/EmailContentEditor';
import { IconEdit } from '@tabler/icons-react';
import type { Editor as TiptapEditor } from '@tiptap/core';
import { Button, EmailEditorVariable, JSONContent, Sheet } from 'erxes-ui';
import { useCallback, useMemo, useRef, useState } from 'react';

/**
 * Output variables already written into this email.
 *
 * Their labels are not stored with them, so reopening an email would draw
 * them as their raw token — the one thing this is here to avoid. The token
 * itself reads well enough as a name.
 */
const writtenVariables = (node?: JSONContent): EmailEditorVariable[] => {
  if (!node) {
    return [];
  }

  const id = node.type === 'variable' ? String(node.attrs?.id ?? '') : '';

  return [
    ...(id.startsWith('{{')
      ? [{ name: id, label: id.replace(/[{}]/g, '').trim(), required: false }]
      : []),
    ...(node.content || []).flatMap(writtenVariables),
  ];
};

/** The first words of the email, enough to recognise which one it is. */
const readText = (node?: JSONContent): string => {
  if (!node) {
    return '';
  }

  if (node.type === 'variable') {
    return `{${node.attrs?.id ?? ''}}`;
  }

  if (node.text) {
    return node.text;
  }

  return (node.content || []).map(readText).join(' ');
};

export const SendEmailMailyContentSheet = ({
  contentJson,
  contentType,
  content,
  variableSourceNodes,
  onChange,
}: {
  contentJson?: JSONContent;
  /** Whose fields the editor offers — the record this action runs for. */
  contentType?: string;
  content: string;
  variableSourceNodes: TAutomationVariableSourceNode[];
  onChange: (contentJson: JSONContent) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [editor, setEditor] = useState<TiptapEditor | null>(null);
  // Edits stay here until Save, so closing the sheet leaves the email as it was.
  const [draft, setDraft] = useState<JSONContent | undefined>(contentJson);
  // An output variable becomes a field of the editor's own, so it is drawn
  // like every other one instead of as raw `{{ … }}` text.
  const [extraVariables, setExtraVariables] = useState<EmailEditorVariable[]>(
    [],
  );

  const teaser = readText(contentJson).trim();

  const variables = useMemo(
    () => [
      ...writtenVariables(draft).filter(
        (written) =>
          !extraVariables.some((added) => added.name === written.name),
      ),
      ...extraVariables,
    ],
    [draft, extraVariables],
  );

  const insertVariable = useCallback(
    ({ payload, editor: target, position }: TEmailVariableDrop) => {
      // A list arrives as a table with a row per item, not one joined field.
      if (payload.fields?.length) {
        const { table, variables: columns } = buildEmailItemTable(payload);
        const chain = target.chain().focus();

        setExtraVariables((current) => [
          ...current,
          ...columns.filter(
            (column) => !current.some((added) => added.name === column.name),
          ),
        ]);

        (position === undefined
          ? chain.insertContent(table)
          : chain.insertContentAt(position, table)
        ).run();

        return;
      }

      // The token is the field's name: rendering hands it back unchanged, and
      // the step that knows the earlier steps' output fills it in.
      const name = payload.token.trim();

      setExtraVariables((current) =>
        current.some((variable) => variable.name === name)
          ? current
          : [...current, { name, label: payload.label, required: false }],
      );

      const chain = target.chain().focus();

      const node = {
        type: 'variable',
        // Not required: the editor marks a required field with no default as
        // a problem, and an output variable has neither.
        attrs: {
          id: name,
          label: payload.label,
          fallback: null,
          required: false,
        },
      };

      (position === undefined
        ? chain.insertContent(node)
        : chain.insertContentAt(position, node)
      ).run();
    },
    [],
  );

  // The editor keeps the extensions it was created with, so the plugin is
  // built once and reaches the current handler through a ref.
  const insertRef = useRef(insertVariable);
  insertRef.current = insertVariable;

  const extensions = useMemo(
    () => [
      createEmailOutputVariableDrop((drop) => insertRef.current(drop)),
      EmailPastedVariables,
    ],
    [],
  );

  const openSheet = () => {
    setDraft(contentJson);
    setIsOpen(true);
  };

  const onSave = () => {
    if (draft) {
      onChange(draft);
    }

    setIsOpen(false);
  };

  return (
    <div className="flex flex-col gap-2">
      <EmailTemplateSelector content={content} format="maily" />

      {/* The sidebar is too narrow to write an email in, so it only shows
          which email this is and opens the editor full width. */}
      <div
        className="group relative h-52 cursor-pointer overflow-hidden rounded-lg border bg-background p-4"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={openSheet}
      >
        <p className="whitespace-pre-wrap text-sm text-muted-foreground">
          {teaser || 'Nothing written yet'}
        </p>

        {isHovered && (
          <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-background/80 backdrop-blur-sm">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={(event) => {
                event.stopPropagation();
                openSheet();
              }}
            >
              <IconEdit className="size-4" />
              Edit Content
            </Button>
          </div>
        )}
      </div>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <Sheet.View className="md:w-[calc(100vw-theme(spacing.4))] flex flex-col gap-0 transition-all duration-100 ease-out overflow-hidden flex-none sm:max-w-screen-2xl">
          <Sheet.Header>
            <div className="space-y-1">
              <Sheet.Title>Edit Email Content</Sheet.Title>
              <Sheet.Description>
                Edit the email content for the email action.
              </Sheet.Description>
            </div>
            <Sheet.Close />
          </Sheet.Header>

          <Sheet.Content className="grid min-h-0 flex-1 grid-cols-[320px_minmax(0,1fr)] overflow-hidden p-0">
            {/* What earlier steps produced, to drag into the email. */}
            <aside className="min-h-0 overflow-hidden border-r bg-muted/20">
              <div className="h-full min-h-0 overflow-y-auto">
                <AutomationVariableBrowser
                  sourceNodes={variableSourceNodes}
                  onInsertVariable={(payload) =>
                    editor && insertVariable({ payload, editor })
                  }
                  emptyState={{
                    title: 'No variables available yet',
                    description:
                      'Add a trigger or an earlier action to this automation to insert variables into the email content.',
                  }}
                  sourceSectionTitle="Variable Sources"
                />
              </div>
            </aside>

            <div className="min-h-0 min-w-0 overflow-y-auto bg-background p-6">
              <div className="rounded-xl border bg-background p-4">
                <EmailContentEditor
                  contentJson={draft}
                  onChange={setDraft}
                  onCreate={setEditor}
                  contentType={contentType}
                  extensions={extensions}
                  extraVariables={variables}
                />
              </div>
            </div>
          </Sheet.Content>
          <Sheet.Footer>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={onSave}>Save</Button>
          </Sheet.Footer>
        </Sheet.View>
      </Sheet>
    </div>
  );
};
