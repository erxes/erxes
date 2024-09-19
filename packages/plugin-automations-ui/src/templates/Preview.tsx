import React, { useEffect } from 'react';
import ReactFlow, {
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  ConnectionMode,
  Handle,
  Position,
  useReactFlow,
  ReactFlowProvider
} from 'reactflow';
import { generateNodes, generateEdges } from '../components/editor/utils';
import 'reactflow/dist/style.css';
import ConnectionLine from '../components/editor/edges/ConnectionLine';
import {
  ScratchNode as CommonScratchNode,
  Trigger
} from '../components/editor/styles';
import Icon from '@erxes/ui/src/components/Icon';
import {
  BRANCH_HANDLE_OPTIONS,
  DEFAULT_HANDLE_OPTIONS,
  DEFAULT_HANDLE_STYLE
} from '../components/editor/constants';
import { AutomationConstants } from '../types';
import { renderDynamicComponent } from '../utils';
import colors from '@erxes/ui/src/styles/colors';

type Props = {
  template?: any;
  constants: AutomationConstants;
};

type HandleProps = {
  id: string;
  position: any;
  style: any;
  label?: string;
  labelStyle?: any;
};

const ScratchNode = () => {
  return (
    <CommonScratchNode>
      <Icon icon="file-plus" size={25} />
      <p>{'How do you want to trigger this automation'}?</p>
    </CommonScratchNode>
  );
};

const CustomNode = ({ id, data }) => {
  const handleOptions: HandleProps[] =
    data?.actionType === 'if' ? BRANCH_HANDLE_OPTIONS : DEFAULT_HANDLE_OPTIONS;

  const { constants, nodeType, triggerType, config } = data;

  const renderOptionalContent = () => {
    if (!nodeType) {
      return;
    }

    const constant = (constants[`${nodeType}sConst`] || []).find(
      (c) => c.type === data[`${nodeType}Type`]
    );

    if (!constant || !constant?.isAvailableOptionalConnect) {
      return null;
    }

    const handle = (optionalId) => (
      <Handle
        key={`${id}-${optionalId}-right`}
        id={`${id}-${optionalId}-right`}
        type="source"
        position={Position.Right}
        isConnectable
        title="optional-connect"
        style={{
          right: '20px',
          width: 15,
          height: 15,
          backgroundColor: colors.colorWhite,
          border: `2px solid ${colors.colorCoreGray}`,
          zIndex: 4
        }}
      />
    );

    return (
      <div className="optional-connects">
        {renderDynamicComponent(
          {
            componentType: 'optionalContent',
            data,
            handle
          },
          constant.type
        )}
      </div>
    );
  };

  const renderTriggerContent = (triggersConst) => {
    if (nodeType !== 'trigger') {
      return null;
    }

    const constant = (triggersConst || []).find((c) => c.type === triggerType);

    if (constant?.isCustom) {
      return (
        <div className="triggerContent">
          {renderDynamicComponent(
            {
              componentType: 'triggerContent',
              config,
              constant,
              triggerType
            },
            constant.type
          )}
        </div>
      );
    }

    return null;
  };

  const showHandler = (data, option) => {
    if (data.nodeType === 'trigger' && ['left'].includes(option.id)) {
      return false;
    }

    return true;
  };

  return (
    <>
      <Trigger type={data.nodeType} key={id}>
        <div className="header">
          <div>
            <i className={`icon-${data.icon}`} />
            {data.label}
          </div>
        </div>

        {renderOptionalContent()}
        {renderTriggerContent(constants.triggersConst)}

        <p>{data.description}</p>
      </Trigger>
      {handleOptions.map(
        (option) =>
          showHandler(data, option) && (
            <Handle
              key={option.id}
              type="source"
              position={option.position}
              id={option.id}
              style={{ ...DEFAULT_HANDLE_STYLE, ...option.style }}
            >
              {option?.label && (
                <div
                  style={{
                    ...option.labelStyle,
                    color: option.style.background
                  }}
                >
                  {option.label}
                </div>
              )}
            </Handle>
          )
      )}
    </>
  );
};

const nodeTypes = {
  primary: CustomNode,
  scratch: ScratchNode
};

const Flow = (props: Props) => {
  const { template } = props;

  const reactFlow = useReactFlow();

  const [edges, setEdges] = useEdgesState(
    generateEdges({ triggers: template.triggers, actions: template.actions })
  );

  const [nodes, setNodes] = useNodesState(
    generateNodes(
      { triggers: template.triggers, actions: template.actions },
      props
    )
  );

  useEffect(() => {
    setNodes(
      generateNodes(
        { triggers: template.triggers, actions: template.actions },
        props
      )
    );
    setEdges(
      generateEdges({ triggers: template.triggers, actions: template.actions })
    );

    setTimeout(() => reactFlow.fitView(), 20);
  }, [
    JSON.stringify(template.triggers),
    JSON.stringify(template.actions),
    reactFlow
  ]);

  const proOptions = { hideAttribution: true };

  return (
    <ReactFlow
      fitView
      nodes={nodes}
      edges={edges}
      proOptions={proOptions}
      nodeTypes={nodeTypes}
      connectionLineComponent={ConnectionLine}
      connectionMode={ConnectionMode.Loose}
      maxZoom={0.7}
      minZoom={0.1}
      nodesDraggable={false}
      nodesConnectable={false}
      nodesFocusable={false}
      edgesFocusable={false}
    >
      <Background gap={36} size={5} />
      <Controls showInteractive={false} position="bottom-right" />
    </ReactFlow>
  );
};

const Preview = (props: Props) => {
  return (
    <ReactFlowProvider>
      <Flow {...props} />
    </ReactFlowProvider>
  );
};

export default Preview;
