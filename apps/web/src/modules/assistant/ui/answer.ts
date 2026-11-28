import { A2uiGenerator, type AnswerPart, CatalogConfig, StreamedAnswer } from '@a2ui/agent';
import type { ReactComponentImplementation } from '@erxes/assistant-catalog/react';
import { type ActionPayload, MessageProcessor } from '@a2ui/web_core/v1_0';
import { ASSISTANT_CATALOG_ID, ASSISTANT_PROTOCOL } from '@erxes/assistant-catalog';
import type { AssistantAction } from '@erxes/core-contract';
import { uiCatalog } from './catalog';

export type UiPart = AnswerPart<ReactComponentImplementation>;

interface AnswerView {
  parts: readonly UiPart[];
  drawing: boolean;
  broken: boolean;
}

const createProcessor = () =>
  new A2uiGenerator([new CatalogConfig(uiCatalog)]).createProcessor({
    [ASSISTANT_PROTOCOL]: { supportedCatalogIds: [ASSISTANT_CATALOG_ID] },
  });

let cached: ReturnType<typeof createProcessor> | undefined;

const open = (onAction: (action: ActionPayload) => void) =>
  new StreamedAnswer<ReactComponentImplementation>((cached ??= createProcessor()), {
    renderer: new MessageProcessor<ReactComponentImplementation>([uiCatalog], onAction),
  });

export const createAnswer = (initial: string, typing: boolean) => {
  const listeners = new Set<() => void>();

  const pressed = {
    label: '',
    send: (_action: AssistantAction, _label: string) => undefined as void,
  };

  const onAction = ({ surfaceId, name, context }: ActionPayload) =>
    pressed.send({ surfaceId, name, context }, pressed.label);

  let stream = open(onAction);
  let fed = '';
  let closed = false;
  let view: AnswerView = { parts: [], drawing: false, broken: false };

  const read = (text: string, streaming: boolean) => {
    if (!text.startsWith(fed) || (closed && (streaming || text !== fed))) {
      stream = open(onAction);
      fed = '';
      closed = false;
    }

    if (text.length > fed.length) stream.feed(text.slice(fed.length));

    fed = text;

    if (!streaming && !closed) {
      stream.close();
      closed = true;
    }
  };

  const sync = (text: string, streaming: boolean) => {
    try {
      read(text, streaming);
      view = { parts: stream.parts, drawing: !closed && stream.isInBlock, broken: false };
    } catch {
      closed = true;
      view = { parts: stream.parts, drawing: false, broken: true };
    }

    for (const listener of listeners) listener();
  };

  sync(initial, typing);

  return {
    sync,
    press: (label: string) => {
      pressed.label = label;
    },
    sendWith: (send: (action: AssistantAction, label: string) => void) => {
      pressed.send = send;
    },
    subscribe: (listener: () => void) => {
      listeners.add(listener);

      return () => listeners.delete(listener);
    },
    view: () => view,
  };
};
