import { useAtom, useSetAtom } from 'jotai';
import { useEffect } from 'react';

import { Resizable } from 'erxes-ui';

import { pageDraftAtom, selectedNodeIdAtom } from '../states/builderStates';
import { LayoutPage } from '../types';
import { useBuilderActions } from '../hooks/useBuilderActions';
import { Toolbar } from './Toolbar';
import { ComponentsPanel } from './ComponentsPanel';
import { Canvas } from './Canvas';
import { Inspector } from './Inspector';

export const Editor = ({ page }: { page: LayoutPage }) => {
  const [, setDraft] = useAtom(pageDraftAtom);
  const setSelected = useSetAtom(selectedNodeIdAtom);
  const { undo, redo } = useBuilderActions();

  useEffect(() => {
    setDraft(page);
    setSelected(null);
    return () => {
      setDraft(null);
      setSelected(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page.id]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey;
      if (!meta) return;
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
  }, [undo, redo]);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <Toolbar />
      <div className="flex-1 overflow-hidden">
        <Resizable.PanelGroup direction="horizontal">
          <Resizable.Panel defaultSize={20} minSize={15} maxSize={35}>
            <ComponentsPanel />
          </Resizable.Panel>
          <Resizable.Handle />
          <Resizable.Panel defaultSize={56} minSize={30}>
            <Canvas />
          </Resizable.Panel>
          <Resizable.Handle />
          <Resizable.Panel defaultSize={24} minSize={15} maxSize={40}>
            <Inspector />
          </Resizable.Panel>
        </Resizable.PanelGroup>
      </div>
    </div>
  );
};
