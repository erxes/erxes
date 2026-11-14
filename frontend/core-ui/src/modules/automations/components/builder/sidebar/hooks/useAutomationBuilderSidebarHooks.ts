import { useAutomation } from '@/automations/context/AutomationProvider';
import { automationEdgeInsertTargetState } from '@/automations/states/automationState';
import { AutomationNodeType, NodeData } from '@/automations/types';
import { Node, useReactFlow } from '@xyflow/react';
import { useSetAtom } from 'jotai';

export const useAutomationBuilderSidebarHooks = () => {
  const {
    queryParams,
    setQueryParams,
    setAwaitingToConnectNodeId,
    isSidebarOpen: isOpenSideBar,
    setSidebarOpen: setIsOpenSideBar,
    toggleSidebar: toggleSideBarOpen,
    setSecondaryPanel,
  } = useAutomation();
  const { getNode } = useReactFlow<Node<NodeData>>();
  const setEdgeInsertTarget = useSetAtom(automationEdgeInsertTargetState);
  const activeNode = getNode(queryParams?.activeNodeId || '')?.data;

  const handleClose = () => {
    setIsOpenSideBar(false);
    setSecondaryPanel(null);
    setAwaitingToConnectNodeId('');
    setEdgeInsertTarget(null);
    setQueryParams({
      activeNodeId: null,
      activeNodeTab: null,
    });
  };

  const handleBack = () => {
    setSecondaryPanel(null);
    setEdgeInsertTarget(null);
    setQueryParams({
      activeNodeId: null,
      activeNodeTab: activeNode?.nodeType || null,
    });
  };

  const closeNodeLibrary = () => {
    setIsOpenSideBar(false);
    setSecondaryPanel(null);
    setEdgeInsertTarget(null);

    setQueryParams({
      activeNodeId: null,
      activeNodeTab: null,
    });
  };

  const openNodeLibrary = (nodeType: AutomationNodeType) => {
    setIsOpenSideBar(true);
    setSecondaryPanel(null);

    setQueryParams({
      activeNodeId: null,
      activeNodeTab: nodeType,
    });
  };

  const handleNodeLibraryToggle = (nodeType: AutomationNodeType) => {
    if (isOpenSideBar && queryParams.activeNodeTab === nodeType) {
      closeNodeLibrary();
      return;
    }

    openNodeLibrary(nodeType);
  };

  const hasSegmentFormContent =
    activeNode?.nodeType === AutomationNodeType.Trigger &&
    !activeNode?.isCustom;
  const isEditingNode =
    !!activeNode &&
    (activeNode.nodeType === AutomationNodeType.Action ||
      activeNode.nodeType === AutomationNodeType.Workflow);
  const canShowSecondarySidebar = isEditingNode;
  const sidebarWidthClasses = hasSegmentFormContent
    ? 'w-screen max-w-full sm:w-fit sm:min-w-md sm:max-w-[min(56rem,calc(100vw-1rem))]'
    : 'w-screen max-w-full sm:w-fit sm:min-w-[28rem] sm:max-w-[min(42rem,calc(100vw-1rem))]';

  return {
    setIsOpenSideBar,
    isOpenSideBar,
    activeNode,
    canShowSecondarySidebar,
    sidebarWidthClasses,
    handleBack,
    handleClose,
    toggleSideBarOpen,
    handleNodeLibraryToggle,
    openNodeLibrary,
    closeNodeLibrary,
  };
};
