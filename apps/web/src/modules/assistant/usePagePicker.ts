import {
  ASSISTANT_SELECTION_TEXT_MAX,
  ASSISTANT_SELECTIONS_MAX,
  type AssistantSelection,
} from '@erxes/core-contract';
import { useToast } from 'erxes-ui';
import { useCallback, useEffect, useEffectEvent, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useTranslation } from 'react-i18next';
import { uploadErrorMessage, uploadFile } from '~/lib/files';
import { pageOfPath } from './recordPages';

export interface Picked {
  key: string;
  title: string;
  preview: string | null;
  selection: AssistantSelection | null;
}

export interface PickTarget {
  top: number;
  left: number;
  width: number;
  height: number;
}

const SNAPSHOT_EDGE = 1600;

const TITLE_MAX = 80;

const PANEL = '#assistant-panel';

const clean = (text: string) =>
  text
    .replaceAll(/[ \t ]+/g, ' ')
    .replaceAll(/\n\s*\n\s*/g, '\n\n')
    .trim();

const textOf = (element: Element) =>
  clean(element instanceof HTMLElement ? element.innerText : (element.textContent ?? ''));

const titleOf = (element: Element, fallback: string) => {
  const heading = element.querySelector('h1, h2, h3, h4, [role="heading"], caption, legend');

  const candidates = [
    element.getAttribute('aria-label'),
    heading ? textOf(heading) : null,
    textOf(element).split('\n')[0],
  ];

  return (candidates.find((text) => text?.trim()) ?? fallback).trim().slice(0, TITLE_MAX);
};

const pickable = (target: EventTarget | null) => {
  if (!(target instanceof Element) || target.closest(PANEL)) return null;

  let element: Element = target;

  while (element.parentElement && element.parentElement !== document.body) {
    const { width, height } = element.getBoundingClientRect();

    if (width >= 48 && height >= 24) break;

    element = element.parentElement;
  }

  return element;
};

const outlineOf = (element: Element): PickTarget => {
  const rect = element.getBoundingClientRect();
  const panel = document.querySelector(PANEL)?.getBoundingClientRect();
  const edge = panel?.width ? panel.left : window.innerWidth;
  const right = Math.min(rect.right, edge);

  return {
    top: rect.top,
    left: rect.left,
    width: Math.max(0, right - rect.left),
    height: rect.height,
  };
};

const snapshotOf = async (element: Element) => {
  const { domToBlob } = await import('modern-screenshot');
  const { width, height } = element.getBoundingClientRect();
  const scale = Math.min(2, window.devicePixelRatio || 1, SNAPSHOT_EDGE / Math.max(width, height));

  const blob = await domToBlob(element, {
    scale,
    type: 'image/png',
    backgroundColor: getComputedStyle(document.body).backgroundColor,
  });

  return new File([blob], 'page-selection.png', { type: 'image/png' });
};

const swallow = (event: Event) => {
  event.preventDefault();
  event.stopPropagation();
};

const block = (event: Event) => {
  if (pickable(event.target)) swallow(event);
};

const listenForPick = ({
  onHover,
  onPick,
  onStop,
}: {
  onHover: (target: PickTarget | null) => void;
  onPick: (element: Element) => void;
  onStop: () => void;
}) => {
  const hover = (event: PointerEvent) => {
    const element = pickable(event.target);

    onHover(element ? outlineOf(element) : null);
  };

  const choose = (event: MouseEvent) => {
    const element = pickable(event.target);

    if (!element) return;

    swallow(event);
    onStop();
    onPick(element);
  };

  document.addEventListener('pointermove', hover, true);
  document.addEventListener('pointerdown', block, true);
  document.addEventListener('mousedown', block, true);
  document.addEventListener('click', choose, true);
  document.documentElement.classList.add('cursor-crosshair');

  return () => {
    document.removeEventListener('pointermove', hover, true);
    document.removeEventListener('pointerdown', block, true);
    document.removeEventListener('mousedown', block, true);
    document.removeEventListener('click', choose, true);
    document.documentElement.classList.remove('cursor-crosshair');
  };
};

const usePicking = (onPick: (element: Element) => void) => {
  const [picking, setPicking] = useState(false);
  const [target, setTarget] = useState<PickTarget | null>(null);
  const pick = useEffectEvent(onPick);

  const stop = useCallback(() => {
    setPicking(false);
    setTarget(null);
  }, []);

  useHotkeys('escape', stop, {
    enabled: picking,
    preventDefault: true,
    enableOnFormTags: true,
    enableOnContentEditable: true,
  });

  useEffect(() => {
    if (!picking) return undefined;

    return listenForPick({ onHover: setTarget, onPick: pick, onStop: stop });
  }, [picking, stop]);

  return { picking, target, start: () => setPicking(true), cancel: () => setPicking(false) };
};

export const usePagePicker = () => {
  const { t } = useTranslation('assistant');
  const { toast } = useToast();
  const [items, setItems] = useState<Picked[]>([]);

  const capture = async (element: Element) => {
    const key = crypto.randomUUID();
    const title = titleOf(element, t('select.untitled', 'Part of the page'));
    const { width, height } = element.getBoundingClientRect();
    const text = textOf(element).slice(0, ASSISTANT_SELECTION_TEXT_MAX);

    setItems((current) => [...current, { key, title, preview: null, selection: null }]);

    try {
      const snapshot = await snapshotOf(element);
      const stored = await uploadFile(snapshot);
      const preview = URL.createObjectURL(snapshot);

      const selection: AssistantSelection = {
        id: key,
        title,
        path: pageOfPath(window.location.pathname)?.path ?? '/',
        text,
        width: Math.max(1, Math.round(width)),
        height: Math.max(1, Math.round(height)),
        snapshot: stored.id,
      };

      setItems((current) =>
        current.map((item) => (item.key === key ? { ...item, preview, selection } : item)),
      );
    } catch (error) {
      setItems((current) => current.filter((item) => item.key !== key));
      toast({
        variant: 'destructive',
        title: t('select.failed', 'Could not select that part of the page'),
        description: uploadErrorMessage(error),
      });
    }
  };

  const picking = usePicking((element) => void capture(element));

  const keep = (kept: (item: Picked) => boolean) => {
    items.forEach((item) => {
      if (item.preview && !kept(item)) URL.revokeObjectURL(item.preview);
    });
    setItems((current) => current.filter(kept));
  };

  return {
    ...picking,
    items,
    full: items.length >= ASSISTANT_SELECTIONS_MAX,
    capturing: items.some((item) => item.selection === null),
    selections: items.flatMap((item) => (item.selection ? [item.selection] : [])),
    remove: (key: string) => keep((item) => item.key !== key),
    clear: () => keep(() => false),
  };
};

export type PagePicker = ReturnType<typeof usePagePicker>;
