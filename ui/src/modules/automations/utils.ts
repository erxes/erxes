import { ITrigger, IAction } from './types';
import jquery from 'jquery';
import { confirm, Alert } from 'modules/common/utils';

export const connectorPaintStyle = {
  strokeWidth: 2,
  stroke: '#61B7CF',
  joinstyle: 'round',
  outlineStroke: 'white',
  outlineWidth: 2
};

// .. and this is the hover style.
export const connectorHoverStyle = {
  strokeWidth: 3,
  stroke: '#216477',
  outlineWidth: 5,
  outlineStroke: 'white'
};

export const endpointHoverStyle = {
  fill: '#216477',
  stroke: '#216477'
};

export const sourceEndpoint = {
  endpoint: 'Dot',
  paintStyle: {
    stroke: '#7AB02C',
    fill: 'transparent',
    radius: 7,
    strokeWidth: 1
  },
  isSource: true,
  connector: [
    'Bezier',
    { stub: [40, 60], gap: 10, cornerRadius: 5, alwaysRespectStubs: true }
  ],
  connectorStyle: connectorPaintStyle,
  hoverPaintStyle: endpointHoverStyle,
  connectorHoverStyle,
  dragOptions: {}
};
// the definition of target endpoints (will appear when the user drags a connection)
export const targetEndpoint = {
  endpoint: 'Dot',
  paintStyle: { fill: '#7AB02C', radius: 7 },
  hoverPaintStyle: endpointHoverStyle,
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

export const deleteControl = () => {
  jquery('#canvas').on('contextmenu', '.control', event => {
    event.preventDefault();

    (window as any).selectedControl = event.currentTarget.id;
    jquery(
      "<div class='custom-menu'><button class='delete-control'>Delete control</button></div>"
    )
      .appendTo('#canvas')
      .css({ top: event.pageY - 180 + 'px', left: event.pageX - 100 + 'px' });
  });

  jquery('#canvas').bind('click', () => {
    jquery('div.custom-menu').remove();
  });
};
