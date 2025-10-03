import { useActionNodeConfiguration } from '@/automations/components/builder/nodes/hooks/useActionNodeConfiguration';
import { NodeData } from '@/automations/types';

export const ActionNodeConfigurationContent = ({
  data,
}: {
  data: NodeData;
}) => {
  const { Component } = useActionNodeConfiguration(data);

  return Component || null;
};
