import { __ } from 'modules/common/utils';
import { jsPlumb } from 'jsplumb';
import jquery from 'jquery';
import Wrapper from 'modules/layout/components/Wrapper';
import React from 'react';
import styled from 'styled-components';

export const Container = styled.div`
  background-color: #f8f9ff;
  width: 100%;
  height: 100%;

  #canvas {
    position: relative;
    font-weight: bold;
  }

  .jtk-connector {
    z-index: 4;
  }

  .jtk-endpoint {
    z-index: 5;
  }

  .jtk-overlay {
    z-index: 6;
  }

  .trigger,
  .action {
    width: 100px;
    height: 100px;
    line-height: 100px;
    position: absolute;
    border: 1px solid;
    border-radius: 20px;
    text-align: center;
    cursor: pointer;
    margin-bottom: 50px;
    color: #ffff;
  }

  .trigger {
    color: black;
  }

  .action {
    background: #60cb98;
  }

  .action[type='if'] {
    background: #4a7cb8;
  }

  .action[type='createTicket'] {
    background: #60cb98;
  }

  .action[type='createTask'] {
    background: #db5d80;
  }

  .action[type='createDeal'] {
    background: #60cb98;
  }
`;

const plumb: any = jsPlumb;

const actions: IAction[] = JSON.parse(localStorage.getItem('actions') || '[]');
const triggers: ITrigger[] = JSON.parse(
  localStorage.getItem('triggers') || '[]'
);

let instance;

type IAction = {
  id: number;
  type: string;
  nextActionId?: string;
  style?: any;
  config?: any;
};

type ITrigger = {
  id: number;
  type: string;
  actionId?: string;
  style?: any;
};

const renderTrigger = (trigger: ITrigger) => {
  const idElm = `trigger-${trigger.id}`;

  jquery('#canvas').append(`
          <div class="trigger" id="${idElm}" style="${trigger.style}">
            ${trigger.type}
          </div>
        `);

  instance.addEndpoint(idElm, {
    anchor: [1, 0.5],
    isSource: true
  });

  instance.draggable(instance.getSelector(`#${idElm}`));
};

const renderAction = ({ id, type, style }: IAction) => {
  const idElm = `action-${id}`;

  jquery('#canvas').append(`
          <div class="action" id="${idElm}" style="${style}" type="${type}">
            ${type}
          </div>
        `);

  if (type === 'if') {
    instance.addEndpoint(idElm, {
      anchor: ['Left'],
      isTarget: true
    });

    instance.addEndpoint(idElm, {
      anchor: [1, 0.2],
      isSource: true,
      overlays: [
        [
          'Label',
          {
            location: [1.8, 0.5],
            label: 'Yes',
            visible: true
          }
        ]
      ]
    });

    instance.addEndpoint(idElm, {
      anchor: [1, 0.8],
      isSource: true,
      overlays: [
        [
          'Label',
          {
            location: [1.8, 0.5],
            label: 'No',
            visible: true
          }
        ]
      ]
    });
  } else {
    instance.addEndpoint(idElm, {
      anchor: ['Left'],
      isTarget: true
    });

    instance.addEndpoint(idElm, {
      anchor: ['Right'],
      isSource: true
    });
  }

  instance.draggable(instance.getSelector(`#${idElm}`));
};
class Form extends React.Component {
  componentDidMount() {
    instance = plumb.getInstance({
      DragOptions: { cursor: 'pointer', zIndex: 2000 },
      PaintStyle: {
        gradient: {
          stops: [
            [0, '#0d78bc'],
            [1, '#558822']
          ]
        },
        stroke: '#558822',
        strokeWidth: 3
      },
      Container: 'canvas'
    });

    instance.bind('ready', () => {
      instance.bind('connection', info => {
        const sourceId = info.sourceId;
        const targetId = info.targetId;

        if (sourceId.includes('trigger')) {
          const trigger = triggers.find(
            t => t.id.toString() === sourceId.replace('trigger-', '')
          );

          if (trigger) {
            trigger.actionId = targetId.replace('action-', '');
          }
        } else {
          const sourceAction = actions.find(
            a => a.id.toString() === sourceId.replace('action-', '')
          );

          if (sourceAction) {
            const nextActionId = targetId.replace('action-', '');

            if (sourceAction.type === 'if') {
              if (!sourceAction.config) {
                sourceAction.config = {};
              }

              sourceAction.config[
                info.sourceEndpoint.anchor.y === 0.2 ? 'yes' : 'no'
              ] = nextActionId;
            } else {
              sourceAction.nextActionId = nextActionId;
            }
          }
        }
      });

      instance.bind('connectionDetached', info => {
        const sourceId = info.sourceId;

        if (sourceId.includes('trigger')) {
          const trigger = triggers.find(
            t => t.id.toString() === sourceId.replace('trigger-', '')
          );

          if (trigger) {
            trigger.actionId = undefined;
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
              ] = undefined;
            } else {
              sourceAction.nextActionId = undefined;
            }
          }
        }
      });

      for (const action of actions) {
        renderAction(action);
      }

      for (const trigger of triggers) {
        renderTrigger(trigger);
      }

      // create connections ===================
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

      jquery('#add-trigger').on('change', e => {
        const trigger = { id: triggers.length, type: e.target.value };

        triggers.push(trigger);

        renderTrigger(trigger);
      });

      jquery('#add-action').on('change', e => {
        const id = actions.length;
        const actionType = e.target.value;

        actions.push({ id: actions.length, type: actionType });

        renderAction({ id, type: actionType });
      });

      jquery('#save').click(() => {
        for (const action of actions) {
          action.style = jquery(`#action-${action.id}`).attr('style');
        }

        localStorage.setItem('actions', JSON.stringify(actions));

        for (const trigger of triggers) {
          trigger.style = jquery(`#trigger-${trigger.id}`).attr('style');
        }

        localStorage.setItem('triggers', JSON.stringify(triggers));
      });
    });
  }

  render() {
    const content = (
      <Container>
        <p>
          <label>Triggers</label>

          <select id="add-trigger">
            <option>Choose trigger</option>
            <option value="formSubmit">Form submit</option>
            <option value="dealCreate">Deal create</option>
          </select>
        </p>

        <p>
          <label>Actions</label>

          <select id="add-action">
            <option>Choose action</option>
            <option value="createTask">Create task</option>
            <option value="createDeal">Create deal</option>
            <option value="createTicket">Create ticket</option>
            <option value="if">IF</option>
          </select>
        </p>

        <p>
          <button id="save">Save</button>
        </p>
        <div id="canvas" />
      </Container>
    );

    return (
      <Wrapper
        header={
          <Wrapper.Header
            title={`${'Automations' || ''}`}
            breadcrumb={[{ title: __('Automations'), link: '/automations' }]}
          />
        }
        content={content}
      />
    );
  }
}

export default Form;
