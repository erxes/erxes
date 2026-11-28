import { A2uiSurface } from '@erxes/assistant-catalog/react';
import { IconAlertTriangle, IconLoader2 } from '@tabler/icons-react';
import { useEffect, useState, useSyncExternalStore } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Markdown } from '../Markdown';
import type { ReplyActions, ReplyState } from '../Reply';
import { createAnswer, type UiPart } from './answer';
import { openPagesWith } from './catalog';
import { UiHostContext } from './host';

const Undrawn = () => {
  const { t } = useTranslation('assistant');

  return (
    <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <IconAlertTriangle aria-hidden className="size-3.5 shrink-0" />
      {t('ui.undrawn', 'This part of the reply could not be shown. Ask again to see it.')}
    </p>
  );
};

const Drawing = () => {
  const { t } = useTranslation('assistant');

  return (
    <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <IconLoader2 aria-hidden className="size-3.5 shrink-0 animate-spin" />
      {t('ui.drawing', 'Drawing…')}
    </p>
  );
};

const Part = ({ part, typing, state }: { part: UiPart; typing: boolean; state: ReplyState }) => {
  if (part.type === 'text') {
    return part.text.trim() ? <Markdown text={part.text} streaming={typing} /> : null;
  }

  if (part.type === 'surface') {
    return (
      <ErrorBoundary fallback={<Undrawn />}>
        <section className="flex min-w-0 flex-col text-sm">
          <A2uiSurface surface={part.surface} />
        </section>
      </ErrorBoundary>
    );
  }

  if (state.superseded) return null;

  return state.working ? <Drawing /> : <Undrawn />;
};

const keyOf = (part: UiPart, index: number) =>
  part.type === 'surface' ? `surface-${part.surface.id}` : `${part.type}-${index}`;

export const UiReply = ({
  text,
  state,
  actions,
}: {
  text: string;
  state: ReplyState;
  actions: ReplyActions;
}) => {
  const navigate = useNavigate();
  const [answer] = useState(() => createAnswer(text, state.streaming));
  const view = useSyncExternalStore(answer.subscribe, answer.view);
  const { onAction, onAsk } = actions;

  useEffect(() => answer.sendWith(onAction), [answer, onAction]);

  useEffect(() => openPagesWith((path) => void navigate(path)), [navigate]);

  useEffect(() => answer.sync(text, state.streaming), [answer, text, state.streaming]);

  const host = { live: state.live, press: answer.press, ask: onAsk };

  return (
    <UiHostContext value={host}>
      <div className="flex min-w-0 flex-col gap-2.5">
        {view.parts.map((part, index) => (
          <Part
            key={keyOf(part, index)}
            part={part}
            typing={state.streaming && !view.drawing && index === view.parts.length - 1}
            state={state}
          />
        ))}
        {view.drawing && view.parts.at(-1)?.type !== 'surface' && <Drawing />}
        {view.broken && !state.superseded && <Undrawn />}
      </div>
    </UiHostContext>
  );
};
