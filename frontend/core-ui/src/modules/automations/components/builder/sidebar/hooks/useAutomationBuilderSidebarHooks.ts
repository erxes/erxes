import { useAutomation } from '@/automations/context/AutomationProvider';
import { AutomationNodeType, NodeData } from '@/automations/types';
import { Node, useReactFlow } from '@xyflow/react';

export const useAutomationBuilderSidebarHooks = () => {
  const {
    queryParams,
    setQueryParams,
    setAwaitingToConnectNodeId,
    isSidebarOpen: isOpenSideBar,
    setSidebarOpen: setIsOpenSideBar,
    toggleSidebar: toggleSideBarOpen,
    isSecondarySidebarOpen,
    setSecondarySidebarOpen: setIsSecondarySidebarOpen,
    toggleSecondarySidebar: toggleSecondarySidebarOpen,
  } = useAutomation();
  const { getNode } = useReactFlow<Node<NodeData>>();
  const activeNode = getNode(queryParams?.activeNodeId || '')?.data;

  const handleClose = () => {
    setIsOpenSideBar(false);
    setIsSecondarySidebarOpen(false);
    setAwaitingToConnectNodeId('');
    setQueryParams({
      activeNodeId: null,
      activeNodeTab: null,
    });
  };

  const handleBack = () => {
    setIsSecondarySidebarOpen(false);
    setQueryParams({
      activeNodeId: null,
      activeNodeTab: activeNode?.nodeType || null,
    });
  };

  const closeNodeLibrary = () => {
    setIsOpenSideBar(false);
    setIsSecondarySidebarOpen(false);

    setQueryParams({
      activeNodeId: null,
      activeNodeTab: null,
    });
  };

  const openNodeLibrary = (nodeType: AutomationNodeType) => {
    setIsOpenSideBar(true);
    setIsSecondarySidebarOpen(false);

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

  return {
    setIsOpenSideBar,
    isOpenSideBar,
    isSecondarySidebarOpen,
    activeNode,
    handleBack,
    handleClose,
    toggleSideBarOpen,
    toggleSecondarySidebarOpen,
    handleNodeLibraryToggle,
  };
};
