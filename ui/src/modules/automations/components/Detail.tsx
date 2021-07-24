import { __ } from 'modules/common/utils';
import { jsPlumb } from 'jsplumb';
import jquery from 'jquery';
import Wrapper from 'modules/layout/components/Wrapper';
import React from 'react';

import { IAction, IAutomation, ITrigger } from '../types';
import { Container } from '../styles';
import { IButtonMutateProps } from 'modules/common/types';

const plumb: any = jsPlumb;

let instance;

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

const createInitialConnections = (triggers, actions) => {
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

const onConnection = (info, triggers, actions) => {
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
};

const onDettachConnection = (info, triggers, actions) => {
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
};

type Props = {
  id?: string;
  automation?: IAutomation;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
};

type State = {
  actions: IAction[];
  triggers: ITrigger[];
};

class Form extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const { automation = { triggers: [], actions: [] } } = this.props;
    this.state = {
      actions: automation.actions,
      triggers: automation.triggers
    };
  }

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
      const { triggers, actions } = this.state;
      instance.bind('connection', info => {
        onConnection(info, triggers, actions);
      });

      instance.bind('connectionDetached', info => {
        onDettachConnection(info, triggers, actions);
      });

      for (const action of actions) {
        renderAction(action);
      }

      for (const trigger of triggers) {
        renderTrigger(trigger);
      }

      // create connections ===================
      createInitialConnections(triggers, actions);

      jquery('#add-trigger').on('change', e => {
        const trigger = { id: triggers.length, type: e.target.value };

        triggers.push(trigger);
        this.setState({ triggers });

        renderTrigger(trigger);
      });

      jquery('#add-action').on('change', e => {
        const id = actions.length;
        const actionType = e.target.value;

        actions.push({ id: actions.length, type: actionType });
        this.setState({ actions });

        renderAction({ id, type: actionType });
      });

      jquery('#save').click(() => {
        for (const action of actions) {
          action.style = jquery(`#action-${action.id}`).attr('style');
        }

        for (const trigger of triggers) {
          trigger.style = jquery(`#trigger-${trigger.id}`).attr('style');
        }

        // localStorage.setItem('actions', JSON.stringify(actions));

        // localStorage.setItem('triggers', JSON.stringify(triggers));
      });
    });
  }

  render() {
    const { automation } = this.props;
    const { triggers, actions } = this.state;
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
            <option value="goto">Go to another action</option>
          </select>
        </p>

        <p>
          {this.props.renderButton({
            name: 'save',
            values: { triggers, actions },
            isSubmitted: true
          })}
        </p>
        <div id="canvas" />
      </Container>
    );

    return (
      <Wrapper
        header={
          <Wrapper.Header
            title={`${'Automations' || ''}`}
            breadcrumb={[
              { title: __('Automations'), link: '/automations' },
              { title: `${(automation && automation.name) || ''}` }
            ]}
          />
        }
        content={content}
      />
    );
  }
}

export default Form;
