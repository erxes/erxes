import { useAtomValue, useSetAtom } from 'jotai';
import { useConversationContext } from '../useConversationContext';
import {
  isInternalNoteCollapsedState,
  isInternalState,
  onlyInternalState,
} from '../../states/isInternalState';
import { IntegrationType } from '@/types/Integration';
import type { ComposerShellState } from '../../types/composerUi';

export const useComposerShell = (): ComposerShellState => {
  const collapsed = useAtomValue(isInternalNoteCollapsedState);
  const setCollapsed = useSetAtom(isInternalNoteCollapsedState);
  const isInternalNote = useAtomValue(isInternalState);
  const onlyInternal = useAtomValue(onlyInternalState);
  const { integration } = useConversationContext();
  const noteOnly = integration?.kind === IntegrationType.MAIL;
  return { collapsed, setCollapsed, isInternalNote, onlyInternal, noteOnly };
};
