import { Handle, NodeProps, Position } from '@xyflow/react';
import { TStructureCanvasDraftNode } from '../../types/structureCanvas';
import { StructureDraftInput } from '../draft/StructureDraftInput';

export const StructureCanvasDraftNode = ({
  data,
}: NodeProps<TStructureCanvasDraftNode>) => (
  <div className="size-full">
    <Handle
      id="top"
      type="target"
      position={Position.Top}
      isConnectable={false}
      className="opacity-0"
    />
    <Handle
      id="left"
      type="target"
      position={Position.Left}
      isConnectable={false}
      className="opacity-0"
    />
    <StructureDraftInput parentId={data.parentId} />
  </div>
);
