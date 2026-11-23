import type { AssistantAction } from '@erxes/core-contract';
import { lazy, Suspense } from 'react';
import { Markdown } from './Markdown';
import { hasUi, withoutPartialTag, withoutUi } from './ui/blocks';

const UiReply = lazy(() => import('./ui/UiReply').then((module) => ({ default: module.UiReply })));

export interface ReplyState {
  streaming: boolean;
  working: boolean;
  live: boolean;
  superseded: boolean;
}

export type OnUiAction = (action: AssistantAction, label: string) => void;

export interface ReplyActions {
  onAction: OnUiAction;
  onAsk: (text: string) => void;
}

export const Reply = ({
  text,
  state,
  actions,
}: {
  text: string;
  state: ReplyState;
  actions: ReplyActions;
}) => {
  if (!hasUi(text)) {
    return <Markdown text={withoutPartialTag(text, state.streaming)} streaming={state.streaming} />;
  }

  return (
    <Suspense fallback={<Markdown text={withoutUi(text)} streaming={state.streaming} />}>
      <UiReply text={text} state={state} actions={actions} />
    </Suspense>
  );
};
