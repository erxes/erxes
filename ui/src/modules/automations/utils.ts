import { ITrigger, IAction } from './types';
import jquery from 'jquery';

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
  instance.bind('contextmenu', (component, event) => {
    if (component.hasClass('jtk-connector')) {
      event.preventDefault();

      (window as any).selectedConnection = component;
      jquery(
        "<div class='custom-menu'><button class='delete-connection'>Delete connection</button></div>"
      )
        .appendTo('#canvas')
        .css({ top: event.pageY - 180 + 'px', left: event.pageX - 100 + 'px' });
    }
  });

  jquery('#canvas').on('click', '.delete-connection', () => {
    instance.deleteConnection((window as any).selectedConnection);
  });

  jquery('#canvas').bind('click', () => {
    jquery('div.custom-menu').remove();
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
};
