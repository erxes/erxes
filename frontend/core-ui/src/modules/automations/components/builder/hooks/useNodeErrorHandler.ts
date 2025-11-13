import { ReactFlowInstance, Node, Edge, EdgeProps } from '@xyflow/react';
import { NodeData } from '@/automations/types';

interface UseNodeErrorHandlerProps {
  reactFlowInstance: ReactFlowInstance<Node<NodeData>, Edge<EdgeProps>> | null;
  getNodes: () => Node<NodeData>[];
  setNodes: (nodes: Node<NodeData>[]) => void;
}

interface NodeErrorMap {
  [nodeId: string]: string;
}

export const useNodeErrorHandler = ({
  reactFlowInstance,
  getNodes,
  setNodes,
}: UseNodeErrorHandlerProps) => {
  /**
   * Updates nodes with error information and focuses on the first error node
   * @param nodeErrorMap - Object mapping node IDs to error messages
   * @param focusToError - Whether to focus/zoom to the first error node (default: true)
   */
  const handleNodeErrors = (
    nodeErrorMap: NodeErrorMap,
    focusToError: boolean = true,
  ) => {
    if (Object.keys(nodeErrorMap).length === 0) {
      return;
    }

    const nodes = getNodes();
    const updatedNodes = nodes.map((node) => ({
      ...node,
      data: {
        ...node.data,
        error: nodeErrorMap[node.id] || undefined,
      },
    }));

    setNodes(updatedNodes);

    // Focus on first error node if requested
    if (focusToError) {
      const firstErrorNode = updatedNodes.find((n) => nodeErrorMap[n.id]);
      if (firstErrorNode && reactFlowInstance) {
        reactFlowInstance.fitView({
          nodes: [firstErrorNode],
          duration: 800,
        });
      }
    }
  };

  /**
   * Clears all errors from nodes
   */
  const clearNodeErrors = () => {
    const nodes = getNodes();
    const updatedNodes = nodes.map((node) => ({
      ...node,
      data: {
        ...node.data,
        error: undefined,
      },
    }));
    setNodes(updatedNodes);
  };

  /**
   * Clears error from a specific node
   * @param nodeId - ID of the node to clear error from
   */
  const clearNodeError = (nodeId: string) => {
    const nodes = getNodes();
    const updatedNodes = nodes.map((node) => {
      if (node.id === nodeId) {
        return {
          ...node,
          data: {
            ...node.data,
            error: undefined,
          },
        };
      }
      return node;
    });
    setNodes(updatedNodes);
  };

  /**
   * Sets error for a specific node
   * @param nodeId - ID of the node to set error for
   * @param errorMessage - Error message to display
   * @param focusToError - Whether to focus on this error node (default: false)
   */
  const setNodeError = (
    nodeId: string,
    errorMessage: string,
    focusToError: boolean = false,
  ) => {
    handleNodeErrors({ [nodeId]: errorMessage }, focusToError);
  };

  /**
   * Gets all nodes that currently have errors
   */
  const getErrorNodes = () => {
    const nodes = getNodes();
    return nodes.filter((node) => node.data.error);
  };

  /**
   * Gets detailed error information for banner display
   */
  const getErrorDetails = () => {
    const nodes = getNodes();
    return nodes
      .filter((node) => node.data.error)
      .map((node) => ({
        nodeId: node.id,
        nodeLabel: node.data.label,
        error: node.data.error,
      }));
  };

  /**
   * Checks if any nodes have errors
   */
  const hasErrors = () => {
    return getErrorNodes().length > 0;
  };

  return {
    handleNodeErrors,
    clearNodeErrors,
    clearNodeError,
    setNodeError,
    getErrorNodes,
    getErrorDetails,
    hasErrors,
  };
};
