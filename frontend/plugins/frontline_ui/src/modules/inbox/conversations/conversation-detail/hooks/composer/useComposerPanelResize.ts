import { useLayoutEffect, useRef, useState } from 'react';
import type { ImperativePanelHandle } from 'react-resizable-panels';
import { useAtomValue } from 'jotai';
import { isInternalNoteCollapsedState } from '@/inbox/conversations/conversation-detail/states/isInternalState';

import {
  COLLAPSED_COMPOSER_HEIGHT,
  MAX_AUTO_COMPOSER_SIZE,
} from '../../constants/composer';
import { getDefaultSize, getMinimumComposerHeight } from '../../utils/composer';

export const useComposerPanelResize = () => {
  const collapsed = useAtomValue(isInternalNoteCollapsedState);
  const collapsedRef = useRef(collapsed);
  collapsedRef.current = collapsed;
  const panelGroupRef = useRef<HTMLDivElement>(null);
  const inputPanelRef = useRef<ImperativePanelHandle>(null);
  const contentHeightRef = useRef(0);
  const autoResizeStartRef = useRef<number | null>(null);
  const initialSizeSetRef = useRef(false);
  const manuallyResizedRef = useRef(false);
  const wasCollapsedRef = useRef(false);
  const expandedSizeRef = useRef<number | null>(null);
  const [minSize, setMinSize] = useState(20);
  const minSizeRef = useRef(20);

  useLayoutEffect(() => {
    const group = panelGroupRef.current;
    if (!group) return undefined;

    if (collapsed && !wasCollapsedRef.current) {
      expandedSizeRef.current = inputPanelRef.current?.getSize() ?? null;
    }
    let restoreSize =
      !collapsed && wasCollapsedRef.current ? expandedSizeRef.current : null;
    wasCollapsedRef.current = collapsed;

    const updatePanelSize = () => {
      const panel = inputPanelRef.current;
      if (!panel || !group.clientHeight) return;

      const height = group.clientHeight;
      if (collapsed) {
        panel.resize(Math.min(100, (COLLAPSED_COMPOSER_HEIGHT / height) * 100));
        return;
      }

      const nextMinSize = Math.min(
        100,
        Math.max(20, (getMinimumComposerHeight(group) / height) * 100),
      );
      minSizeRef.current = nextMinSize;
      setMinSize(nextMinSize);

      if (restoreSize !== null) {
        panel.resize(Math.max(nextMinSize, restoreSize));
        restoreSize = null;
        initialSizeSetRef.current = true;
        return;
      }

      if (
        !initialSizeSetRef.current ||
        (!manuallyResizedRef.current && autoResizeStartRef.current === null)
      ) {
        panel.resize(Math.max(nextMinSize, getDefaultSize(height)));
        initialSizeSetRef.current = true;
      } else if (panel.getSize() < nextMinSize) {
        panel.resize(nextMinSize);
      }
    };

    const observer = new ResizeObserver(updatePanelSize);
    observer.observe(group);
    group
      .querySelectorAll(
        '[data-composer-header], [data-composer-previews], [data-composer-footer]',
      )
      .forEach((element) => observer.observe(element));
    updatePanelSize();

    return () => observer.disconnect();
  }, [collapsed]);

  useLayoutEffect(() => {
    const group = panelGroupRef.current;
    const panel = inputPanelRef.current;
    if (
      !group?.clientHeight ||
      !panel ||
      collapsedRef.current ||
      manuallyResizedRef.current ||
      autoResizeStartRef.current !== null
    )
      return;

    // Apply after Panel receives the new minimum; its previous constraint can
    // otherwise prevent shrinking when the last preview is removed.
    panel.resize(Math.max(minSize, getDefaultSize(group.clientHeight)));
  }, [minSize]);

  const getEditor = (target: EventTarget) =>
    target instanceof Element
      ? target.closest<HTMLElement>('[data-composer-editor]')
      : null;

  const rememberContentHeight = (target: EventTarget) => {
    const editor = getEditor(target);
    contentHeightRef.current =
      editor?.querySelector<HTMLElement>('.bn-editor')?.scrollHeight ?? 0;
  };

  const resizeForContent = (target: EventTarget) => {
    if (collapsedRef.current) return;
    const editor = getEditor(target);
    const group = editor?.closest<HTMLElement>('[data-panel-group]');
    if (!editor || !group) return;

    requestAnimationFrame(() => {
      if (collapsedRef.current) return;
      const panel = inputPanelRef.current;
      const contentHeight =
        editor.querySelector<HTMLElement>('.bn-editor')?.scrollHeight ?? 0;
      const change = contentHeight - contentHeightRef.current;
      contentHeightRef.current = contentHeight;
      if (!panel || !group.clientHeight) return;

      if (editor.querySelector('[data-is-only-empty-block="true"]')) {
        autoResizeStartRef.current = null;
        manuallyResizedRef.current = false;
        panel.resize(
          Math.max(minSizeRef.current, getDefaultSize(group.clientHeight)),
        );
        return;
      }

      if (!change) return;

      const size = panel.getSize();
      if (change < 0 && autoResizeStartRef.current === null) return;
      const viewport = editor.closest<HTMLElement>('[data-composer-scroll]');
      if (change > 0 && contentHeight <= (viewport ?? editor).clientHeight)
        return;

      const startSize = autoResizeStartRef.current ?? size;
      const nextSize = Math.min(
        Math.max(MAX_AUTO_COMPOSER_SIZE, startSize),
        Math.max(
          startSize,
          Math.ceil(size + (change / group.clientHeight) * 100),
        ),
      );
      if (nextSize === size) return;

      panel.resize(nextSize);
      autoResizeStartRef.current =
        manuallyResizedRef.current || nextSize > startSize ? startSize : null;
    });
  };

  const resetAutoResize = () => {
    autoResizeStartRef.current = inputPanelRef.current?.getSize() ?? null;
    manuallyResizedRef.current = true;
  };

  return {
    panelGroupRef,
    inputPanelRef,
    minSize,
    rememberContentHeight,
    resizeForContent,
    resetAutoResize,
  };
};
