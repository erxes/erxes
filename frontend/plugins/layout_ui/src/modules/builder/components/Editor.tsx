import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useEffect } from 'react';

import { Resizable } from 'erxes-ui';

import {
  pageDraftAtom,
  panelVisibilityAtom,
  selectedNodeIdsAtom,
} from '../states/builderStates';
import { LayoutPage } from '../types';
import { useBuilderActions } from '../hooks/useBuilderActions';
import { Toolbar } from './Toolbar';
import { ToolsStrip } from './ToolsStrip';
import { Canvas } from './Canvas';
import { Inspector } from './Inspector';
import { LayersPanel } from './LayersPanel';

export const Editor = ({ page }: { page: LayoutPage }) => {
  const [, setDraft] = useAtom(pageDraftAtom);
  const setSelectedIds = useSetAtom(selectedNodeIdsAtom);
  const [panels, setPanels] = useAtom(panelVisibilityAtom);
  const { undo, redo } = useBuilderActions();

  useEffect(() => {
    setDraft(page);
    setSelectedIds([]);
    return () => {
      setDraft(null);
      setSelectedIds([]);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page.id]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey;
      if (!meta) return;
      if (e.key === '\\') {
        e.preventDefault();
        const next = !(panels.left && panels.right);
        setPanels({ left: next, right: next });
        return;
      }
      if (e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if (
        (e.key.toLowerCase() === 'z' && e.shiftKey) ||
        e.key.toLowerCase() === 'y'
      ) {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [undo, redo, panels, setPanels]);

  // Force PanelGroup to remount when visibility flips so sizes recompute
  // cleanly without bumping into min/max constraints from the prior layout.
  const groupKey = `${panels.left ? 'L' : '_'}${panels.right ? 'R' : '_'}`;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <Toolbar />
      <ToolsStrip />
      <div className="flex-1 overflow-hidden">
        <Resizable.PanelGroup key={groupKey} direction="horizontal">
          {panels.left && (
            <>
              <Resizable.Panel defaultSize={16} minSize={12} maxSize={26}>
                <LayersPanel />
              </Resizable.Panel>
              <Resizable.Handle />
            </>
          )}
          <Resizable.Panel defaultSize={48} minSize={20}>
            <Canvas />
          </Resizable.Panel>
          {panels.right && (
            <>
              <Resizable.Handle />
              <Resizable.Panel defaultSize={22} minSize={16} maxSize={36}>
                <Inspector />
              </Resizable.Panel>
            </>
          )}
        </Resizable.PanelGroup>
      </div>
    </div>
  );
};
