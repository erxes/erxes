import { useEffect } from 'react';
import { CustomNode, SidebarViewType } from '../types';

interface UseKeyboardShortcutsProps {
  selectedNode: CustomNode | null;
  sidebarView: SidebarViewType;
  onDeleteNode: (id: string) => void;
  onSaveNode: () => void;
  onAddNode: () => void;
  onToggleSidebar: (view: SidebarViewType) => void;
}

export const useKeyboardShortcuts = ({
  selectedNode,
  sidebarView,
  onDeleteNode,
  onSaveNode,
  onAddNode,
  onToggleSidebar,
}: UseKeyboardShortcutsProps) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Delete selected node with Delete key
      if (event.key === 'Delete' && selectedNode) {
        onDeleteNode(selectedNode.id);
      }

      // Save with Ctrl+S
      if (event.ctrlKey && event.key === 's' && selectedNode) {
        event.preventDefault();
        onSaveNode();
      }

      // Add new node with Ctrl+N
      if (event.ctrlKey && event.key === 'n') {
        event.preventDefault();
        onAddNode();
      }

      // Toggle sidebar with Ctrl+B
      if (event.ctrlKey && event.key === 'b') {
        event.preventDefault();
        onToggleSidebar(sidebarView === 'hidden' ? 'list' : 'hidden');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    selectedNode,
    sidebarView,
    onDeleteNode,
    onSaveNode,
    onAddNode,
    onToggleSidebar,
  ]);
};

export default useKeyboardShortcuts;
