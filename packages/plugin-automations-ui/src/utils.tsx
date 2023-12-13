import React from 'react';
import { ITrigger } from './types';
import { IAction } from '@erxes/ui-automations/src/types';
import { confirm, Alert } from '@erxes/ui/src/utils';
import { rgba } from '@erxes/ui/src/styles/ecolor';
import { colors } from '@erxes/ui/src/styles';
import { RenderDynamicComponent } from '@erxes/ui/src/utils/core';

export const connectorPaintStyle = {
  strokeWidth: 2,
  stroke: '#a1a1a1'
};

export const hoverPaintStyle = {
  fill: colors.colorPrimary
};

export const connectorHoverStyle = {
  stroke: colors.colorPrimary
};

export const sourceEndpoint = {
  endpoint: 'Dot',
  paintStyle: {
    fill: rgba(colors.colorSecondary, 1),
    radius: 10
  },
  isSource: true,
  connector: [
    'Bezier',
    { stub: [40, 60], gap: 10, cornerRadius: 5, alwaysRespectStubs: true }
  ],
  connectorStyle: connectorPaintStyle,
  hoverPaintStyle,
  connectorHoverStyle,
  dropOptions: {
    tolerance: 'touch',
    hoverClass: 'dropHover',
    activeClass: 'dragActive'
  }
};

export const yesEndPoint = {
  endpoint: 'Dot',
  paintStyle: {
    fill: rgba(colors.colorCoreGreen, 1),
    radius: 10
  },
  isSource: true,
  connector: [
    'Bezier',
    { stub: [40, 60], gap: 10, cornerRadius: 5, alwaysRespectStubs: true }
  ],
  connectorStyle: connectorPaintStyle,
  hoverPaintStyle,
  connectorHoverStyle,
  anchor: [1, 0.3],
  overlays: [
    [
      'Label',
      {
        location: [1.8, 0.5],
        label: 'True',
        visible: true,
        labelStyle: {
          color: colors.colorCoreGreen
        }
      }
    ]
  ]
};

export const noEndPoint = {
  endpoint: 'Dot',
  paintStyle: {
    fill: rgba(colors.colorCoreRed, 1),
    radius: 10
  },
  isSource: true,
  connector: [
    'Bezier',
    { stub: [40, 60], gap: 10, cornerRadius: 5, alwaysRespectStubs: true }
  ],
  connectorStyle: connectorPaintStyle,
  hoverPaintStyle,
  connectorHoverStyle,
  anchor: [1, 0.7],
  overlays: [
    [
      'Label',
      {
        location: [1.9, 0.6],
        label: 'False',
        visible: true,
        labelStyle: {
          color: colors.colorCoreRed
        }
      }
    ]
  ]
};

// the definition of target endpoints (will appear when the user drags a connection)
export const targetEndpoint = {
  endpoint: 'Dot',
  paintStyle: { fill: rgba(colors.colorCoreYellow, 1), radius: 10 },
  hoverPaintStyle: {
    fill: colors.colorPrimary
  },
  maxConnections: -1,
  dropOptions: { hoverClass: 'hover', activeClass: 'active' },
  isTarget: true
};

export const createInitialConnections = (
  triggers: ITrigger[],
  actions: IAction[],
  instance: any
) => {
  for (const trigger of triggers) {
    if (trigger.actionId) {
      instance.connect({
        source: `trigger-${trigger.id}`,
        target: `action-${trigger.actionId}`,
        anchors: ['Right', 'Left']
      });
    }
  }

  for (const action of actions) {
    if (action.type === 'if') {
      if (action.config) {
        if (action.config.yes) {
          instance.connect({
            source: `action-${action.id}`,
            target: `action-${action.config.yes}`,
            anchors: [[1, 0.3], 'Left']
          });
        }

        if (action.config.no) {
          instance.connect({
            source: `action-${action.id}`,
            target: `action-${action.config.no}`,
            anchors: [[1, 0.7], 'Left']
          });
        }
      }
    } else {
      if (action.nextActionId) {
        instance.connect({
          source: `action-${action.id}`,
          target: `action-${action.nextActionId}`,
          anchors: ['Right', 'Left']
        });
      }
    }
  }
};

export const connection = (
  triggers: ITrigger[],
  actions: IAction[],
  info: any,
  actionId: any
) => {
  const { sourceId, type, connectType } = info || {};

  if (type === 'trigger') {
    const trigger = triggers.find(t => t.id.toString() === sourceId);

    if (trigger) {
      trigger.actionId = actionId;
    }
  } else {
    const sourceAction = actions.find(a => a.id.toString() === sourceId);

    if (sourceAction) {
      if (sourceAction.type === 'if') {
        if (!sourceAction.config) {
          sourceAction.config = {};
        }

        const [sourceHandle] = info.sourceHandle.split('-');

        sourceAction.config[sourceHandle] = actionId;
      }

      if (connectType === 'optional') {
        const sourceConfig = sourceAction?.config || {};

        const optionalConnects = sourceConfig?.optionalConnects || [];

        //update optionalConnects if optional connect exists in sourceAction
        let updatedOptionalConnects = optionalConnects.map(optConnect =>
          optConnect.sourceId === sourceId &&
          optConnect.optionalConnectId === info.optionalConnectId
            ? { ...optConnect, actionId }
            : optConnect
        );

        // add optionalConnect if optional connect not exists in sourceAction
        if (
          !optionalConnects.some(
            optConnect =>
              optConnect.sourceId === sourceId &&
              optConnect.optionalConnectId === info?.optionalConnectId
          )
        ) {
          updatedOptionalConnects.push({
            sourceId,
            actionId,
            optionalConnectId: info?.optionalConnectId
          });
        }

        // disconnect optionalConnect if optional connect exists in sourceAction but info.optionalConnectId is undefined

        if (
          !info?.optionalConnectId &&
          optionalConnects.some(optConnect => optConnect.sourceId === sourceId)
        ) {
          updatedOptionalConnects = updatedOptionalConnects.filter(
            optConnect => optConnect.sourceId !== sourceId
          );
        }

        sourceAction.config = {
          ...sourceConfig,
          optionalConnects: updatedOptionalConnects
        };
      } else {
        sourceAction.nextActionId = actionId;
      }
    }
  }
};

export const deleteConnection = instance => {
  instance.bind('click', (conn, event) => {
    confirm(
      'Delete connection from ' + conn.sourceId + ' to ' + conn.targetId + '?'
    )
      .then(() => instance.deleteConnection(conn))
      .catch(error => {
        Alert.error(error.message);
      });
  });
};

export const getTriggerType = (
  actions: any,
  triggers: any,
  activeActionId: string
) => {
  const activeTrigger = triggers.find(t => t.actionId === activeActionId);

  if (activeTrigger) {
    return activeTrigger.type;
  }

  const activeAction = actions.find(t => t.nextActionId === activeActionId);

  if (activeAction) {
    return getTriggerType(actions, triggers, activeAction.id);
  }

  if (triggers && triggers.length > 0) {
    return triggers[0].type;
  }

  return;
};

export const getTriggerConfig = (
  actions: any,
  triggers: any,
  activeActionId: string
) => {
  const activeTrigger = triggers.find(t => t.actionId === activeActionId);

  if (activeTrigger) {
    return activeTrigger?.config;
  }

  const activeAction = actions.find(t => t.nextActionId === activeActionId);

  if (activeAction) {
    return getTriggerType(actions, triggers, activeAction.id);
  }

  if (triggers && triggers.length > 0) {
    return triggers[0]?.config;
  }

  return;
};

export const renderDynamicComponent = (props, type) => {
  const plugins: any[] = (window as any).plugins || [];

  for (const plugin of plugins) {
    if (type.includes(`${plugin.name}:`) && plugin.automation) {
      return (
        <RenderDynamicComponent
          scope={plugin.scope}
          component={plugin.automation}
          injectedProps={{
            ...props
          }}
        />
      );
    }
  }

  return;
};
