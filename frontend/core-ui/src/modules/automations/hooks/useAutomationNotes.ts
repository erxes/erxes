import {
  NOTE_DEFAULT_COLOR,
  NOTE_DEFAULT_HEIGHT,
  NOTE_DEFAULT_WIDTH,
} from '@/automations/constants/notes';
import { useAutomationFormController } from '@/automations/hooks/useFormSetValue';
import { IAutomationNote } from '@/automations/types';
import { TAutomationBuilderForm } from '@/automations/utils/automationFormDefinitions';
import { useMemo } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

export const NO_NOTES: IAutomationNote[] = [];

export const useAutomationNotes = () => {
  const { control } = useFormContext<TAutomationBuilderForm>();
  const watched = useWatch({ control, name: 'notes' });

  // A shared empty array, not a fresh `|| []`: an automation without notes
  // would otherwise hand back a new identity on every render, recompute the
  // canvas node memo, and re-enter setNodes forever.
  const notes = useMemo(() => watched || NO_NOTES, [watched]);

  return { notes };
};

/** Create, update and delete canvas notes through the builder form. */
export const useAutomationNoteActions = () => {
  const { setAutomationBuilderFormValue } = useAutomationFormController();
  const { getValues } = useFormContext<TAutomationBuilderForm>();

  const current = (): IAutomationNote[] => getValues('notes') || [];

  const addNote = (position: { x: number; y: number }) => {
    const note: IAutomationNote = {
      id: `note-${Date.now()}`,
      content: '',
      position,
      width: NOTE_DEFAULT_WIDTH,
      height: NOTE_DEFAULT_HEIGHT,
      color: NOTE_DEFAULT_COLOR,
    };

    setAutomationBuilderFormValue('notes', [...current(), note]);

    return note;
  };

  const updateNote = (noteId: string, changes: Partial<IAutomationNote>) =>
    setAutomationBuilderFormValue(
      'notes',
      current().map((note) =>
        note.id === noteId ? { ...note, ...changes } : note,
      ),
    );

  const removeNote = (noteId: string) =>
    setAutomationBuilderFormValue(
      'notes',
      current().filter(({ id }) => id !== noteId),
    );

  return { addNote, updateNote, removeNote };
};
