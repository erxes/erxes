import { __ } from 'modules/common/utils';
import { jsPlumb } from 'jsplumb';
import jquery from 'jquery';
import Wrapper from 'modules/layout/components/Wrapper';
import React from 'react';

import { IAction, IAutomation, ITrigger } from '../types';
import { Container } from '../styles';
import Form from 'modules/common/components/form/Form';
import { IButtonMutateProps, IFormProps } from 'modules/common/types';
import {
  ControlLabel,
  FormControl,
  FormGroup
} from 'modules/common/components/form';
import { FormColumn, FormWrapper } from 'modules/common/styles/main';

const plumb: any = jsPlumb;
let instance;

type Props = {
  id?: string;
  automation?: IAutomation;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
};

type State = {
  name: string;
  status: string;
  actions: IAction[];
  triggers: ITrigger[];
};

class Detail extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const {
      automation = {
        name: 'Unknown automation',
        status: 'draft',
        triggers: [],
        actions: []
      }
    } = this.props;

    this.state = {
      name: automation.name,
      status: automation.status,
      actions: automation.actions || [],
      triggers: automation.triggers || []
    };
  }

  renderTrigger = (trigger: ITrigger) => {
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

  renderAction = (action: IAction) => {
    const idElm = `action-${action.id}`;

    jquery('#canvas').append(`
          <div class="action" id="${idElm}" style="${action.style}" type="${action.type}">
            ${action.type}
          </div>
        `);

    if (action.type === 'if') {
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

  createInitialConnections = () => {
    const { triggers, actions } = this.state;

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

  onConnection = info => {
    const { triggers, actions } = this.state;
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
    this.setState({ triggers, actions });
  };

  onDettachConnection = info => {
    const { triggers, actions } = this.state;
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
    this.setState({ triggers, actions });
  };

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
        this.onConnection(info);
      });

      instance.bind('connectionDetached', info => {
        this.onDettachConnection(info);
      });

      for (const action of actions) {
        this.renderAction(action);
      }

      for (const trigger of triggers) {
        this.renderTrigger(trigger);
      }

      // create connections ===================
      this.createInitialConnections();
    });
  }

  addTrigger = e => {
    const { triggers } = this.state;
    const trigger = { id: String(triggers.length), type: e.target.value };

    triggers.push(trigger);
    this.setState({ triggers });

    this.renderTrigger(trigger);
  };

  addAction = e => {
    const { actions } = this.state;
    const action = { id: String(actions.length), type: e.target.value };

    actions.push(action);
    this.setState({ actions });

    this.renderAction(action);
  };

  onNameChange = (e: React.FormEvent<HTMLElement>) => {
    const value = (e.currentTarget as HTMLButtonElement).value;
    this.setState({ name: value });
  };

  formContent = (formProps: IFormProps) => {
    const { name, status, triggers, actions } = this.state;
    const { id, renderButton } = this.props;
    const { isSubmitted } = formProps;

    return (
      <Container>
        <FormWrapper>
          <FormColumn>
            <FormGroup>
              <ControlLabel required={true}>Name</ControlLabel>
              <FormControl
                {...formProps}
                name="name"
                value={name}
                onChange={this.onNameChange}
                required={true}
                autoFocus={true}
              />
            </FormGroup>
          </FormColumn>
          <FormColumn>
            <FormGroup>
              <ControlLabel>Triggers</ControlLabel>
              <FormControl
                componentClass="select"
                value={'Choose trigger'}
                options={[
                  {
                    value: '',
                    label: 'Choose trigger'
                  },
                  {
                    value: 'formSubmit',
                    label: 'Form submit'
                  },
                  {
                    value: 'dealCreate',
                    label: 'Deal create'
                  }
                ]}
                onChange={this.addTrigger}
              />
            </FormGroup>
          </FormColumn>
          <FormColumn>
            <FormGroup>
              <ControlLabel>Actions</ControlLabel>
              <FormControl
                componentClass="select"
                value={'Choose trigger'}
                options={[
                  {
                    value: '',
                    label: 'Choose action'
                  },
                  {
                    value: 'createTask',
                    label: 'Create task'
                  },
                  {
                    value: 'createDeal',
                    label: 'Create deal'
                  },
                  {
                    value: 'createTicket',
                    label: 'Create ticket'
                  },
                  {
                    value: 'if',
                    label: 'IF'
                  },
                  {
                    value: 'goto',
                    label: 'Go to another action'
                  }
                ]}
                onChange={this.addAction}
              />
            </FormGroup>
          </FormColumn>
          <FormColumn>
            {renderButton({
              name: 'save',
              values: { _id: id || '', name, status, triggers, actions },
              isSubmitted
            })}
          </FormColumn>
        </FormWrapper>

        <div id="canvas" />
      </Container>
    );
  };

  renderContent = () => {
    return <Form renderContent={this.formContent} />;
  };

  render() {
    const { automation } = this.props;

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
        content={this.renderContent()}
      />
    );
  }
}

export default Detail;
