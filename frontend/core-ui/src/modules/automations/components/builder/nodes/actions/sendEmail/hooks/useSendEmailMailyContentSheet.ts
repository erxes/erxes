import { emailBlockInsert } from '@/automations/components/builder/nodes/actions/sendEmail/utils/emailBlockInsert';
import { buildEmailItemTable } from '@/automations/components/builder/nodes/actions/sendEmail/utils/emailItemTable';
import { EmailPastedVariables } from '@/automations/components/builder/nodes/actions/sendEmail/utils/emailPastedVariables';
import {
  createEmailOutputVariableDrop,
  TEmailVariableDrop,
} from '@/automations/components/builder/nodes/actions/sendEmail/utils/emailVariableDrop';
import {
  editorVariables,
  outputVariableNode,
  readText,
  withVariables,
} from '@/automations/components/builder/nodes/actions/sendEmail/utils/mailyVariables';
import type { Editor as TiptapEditor } from '@tiptap/core';
import { EmailEditorVariable, JSONContent } from 'erxes-ui';
import { MouseEvent, useCallback, useMemo, useRef, useState } from 'react';
import { TAutomationVariableDragPayload } from 'ui-modules';

/**
 * The email editor's sheet: a draft kept until Save, so closing leaves the
 * email as it was, and output variables dropped or picked into it. A list
 * arrives as a table with a row per item; anything else as one field.
 */
export const useSendEmailMailyContentSheet = ({
  contentJson,
  onChange,
}: {
  contentJson?: JSONContent;
  onChange: (contentJson: JSONContent) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [editor, setEditor] = useState<TiptapEditor | null>(null);
  const [draft, setDraft] = useState<JSONContent | undefined>(contentJson);
  // An output variable becomes a field of the editor's own, so it is drawn
  // like every other one instead of as raw `{{ … }}` text
  const [extraVariables, setExtraVariables] = useState<EmailEditorVariable[]>(
    [],
  );

  const teaser = readText(contentJson).trim();
  const variables = useMemo(
    () => editorVariables(draft, extraVariables),
    [draft, extraVariables],
  );

  const insertVariable = useCallback(
    ({ payload, editor: target, position }: TEmailVariableDrop) => {
      if (payload.fields?.length) {
        const { table, variables: columns } = buildEmailItemTable(payload);

        setExtraVariables((current) => withVariables(current, columns));
        emailBlockInsert(target, table, position);
        return;
      }

      // The token is the field's name: rendering hands it back unchanged
      const name = payload.token.trim();

      setExtraVariables((current) =>
        withVariables(current, [
          { name, label: payload.label, required: false },
        ]),
      );
      emailBlockInsert(
        target,
        outputVariableNode(name, payload.label),
        position,
      );
    },
    [],
  );

  // The editor keeps the extensions it was created with, so the plugin is
  // built once and reaches the current handler through a ref
  const insertRef = useRef(insertVariable);
  insertRef.current = insertVariable;
  const extensions = useMemo(
    () => [
      createEmailOutputVariableDrop((drop) => insertRef.current(drop)),
      EmailPastedVariables,
    ],
    [],
  );

  const insertFromBrowser = useCallback(
    (payload: TAutomationVariableDragPayload) => {
      if (editor) {
        insertVariable({ payload, editor });
      }
    },
    [editor, insertVariable],
  );

  const openSheet = useCallback(() => {
    setDraft(contentJson);
    setIsOpen(true);
  }, [contentJson]);

  // The button sits on the preview, which opens the sheet on its own too
  const openSheetFromButton = useCallback(
    (event: MouseEvent) => {
      event.stopPropagation();
      openSheet();
    },
    [openSheet],
  );

  const onSave = useCallback(() => {
    if (draft) {
      onChange(draft);
    }
    setIsOpen(false);
  }, [draft, onChange]);

  return {
    isOpen,
    setIsOpen,
    isHovered,
    showHover: () => setIsHovered(true),
    hideHover: () => setIsHovered(false),
    setEditor,
    draft,
    setDraft,
    teaser,
    variables,
    extensions,
    insertFromBrowser,
    openSheet,
    openSheetFromButton,
    onSave,
  };
};
