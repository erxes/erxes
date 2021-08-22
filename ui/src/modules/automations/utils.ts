import { ITrigger, IAction } from './types';
import { confirm, Alert } from 'modules/common/utils';
import { colors } from 'erxes-ui/lib/styles/eindex';
import { rgba } from 'modules/common/styles/color';

export const connectorPaintStyle = {
  strokeWidth: 2,
  stroke: rgba(colors.colorBlack, 0.5)
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
            anchors: [[1, 0.2], 'Left']
          });
        }

        if (action.config.no) {
          instance.connect({
            source: `action-${action.id}`,
            target: `action-${action.config.no}`,
            anchors: [[1, 0.8], 'Left']
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
  const sourceId = info.sourceId;

  if (sourceId.includes('trigger')) {
    const trigger = triggers.find(
      t => t.id.toString() === sourceId.replace('trigger-', '')
    );

    if (trigger) {
      trigger.actionId = actionId;
    }
  } else {
    const sourceAction = actions.find(
      a => a.id.toString() === sourceId.replace('action-', '')
    );

    if (sourceAction) {
      if (sourceAction.type === 'if') {
        if (!sourceAction.config) {
          sourceAction.config = {};
        }

        sourceAction.config[
          info.sourceEndpoint.anchor.y === 0.2 ? 'yes' : 'no'
        ] = actionId;
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
