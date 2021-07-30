import { __, Alert } from 'modules/common/utils';
import { jsPlumb } from 'jsplumb';
import jquery from 'jquery';
import Wrapper from 'modules/layout/components/Wrapper';
import React from 'react';

import { IAction, IAutomation, ITrigger } from '../../types';
import { Container } from '../../styles';
import Form from 'modules/common/components/form/Form';
import { IFormProps } from 'modules/common/types';
import {
  ControlLabel,
  FormControl,
  FormGroup
} from 'modules/common/components/form';
import { FormColumn, FormWrapper } from 'modules/common/styles/main';
import { BarItems } from 'modules/layout/styles';
import Button from 'modules/common/components/Button';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import TriggerForm from '../../containers/forms/TriggerForm';
import ActionsForm from '../../containers/forms/ActionsForm';
import TriggerDetailForm from './TriggerDetailForm';
import Modal from 'react-bootstrap/Modal';
import {
  createInitialConnections,
  connection
} from 'modules/automations/utils';
import ActionDetailForm from '../../containers/forms/ActionDetailForm';

const plumb: any = jsPlumb;
let instance;

type Props = {
  id?: string;
  automation?: IAutomation;
  save: (params: any) => void;
};

type State = {
  name: string;
  status: string;
  showModal: boolean;
  showActionModal: boolean;
  actions: IAction[];
  triggers: ITrigger[];
  activeTrigger: ITrigger;
  selectedContentId?: string;
  currentAction: {
    trigger: ITrigger;
    action: IAction;
  };
};

class AutomationForm extends React.Component<Props, State> {
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
      triggers: automation.triggers || [],
      activeTrigger: {} as ITrigger,
      showModal: false,
      showActionModal: false,
      currentAction: { trigger: {} as ITrigger, action: {} as IAction }
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
      createInitialConnections(triggers, actions, instance);

      instance.bind('contextmenu', (component, event) => {
        if (component.hasClass('jtk-connector')) {
          console.log('heree cnnecct', event.pageY, event.pageX);
          event.preventDefault();
          // instance.getSelector(`#${idElm}`).selectedConnection = component;
          jquery(
            "<div class='custom-menu'><button class='delete-connection'>Delete connection</button></div>"
          )
            .appendTo('#canvas')
            .css({ top: event.pageY + 'px', left: event.pageX + 'px' });
        }
      });

      jquery('#canvas').on('click', '.delete-connection', event => {
        instance
          .deleteConnection
          // instance.getSelector(`#${idElm}`).selectedConnection
          ();
      });
    });
  }

  onAddActionConfig = config => {
    const { currentAction } = this.state;

    currentAction.action.config = config;
    this.setState({ currentAction });
  };

  onClickTrigger = (trigger?: ITrigger) => {
    const config = trigger && trigger.config;
    const selectedContentId = config && config.contentId;

    this.setState({
      showModal: !this.state.showModal,
      selectedContentId,
      activeTrigger: trigger ? trigger : ({} as ITrigger)
    });
  };

  onClickAction = (action?: IAction) => {
    if (!action) {
      return;
    }

    const { triggers = [] } = this.state;
    const relatedTrigger = triggers.find(e => e.actionId === action.id);

    this.setState({
      showActionModal: !this.state.showActionModal,
      currentAction: {
        trigger: relatedTrigger ? relatedTrigger : ({} as ITrigger),
        action
      }
    });
  };

  handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const { name, status, triggers, actions } = this.state;
    const { id, save } = this.props;

    if (!name) {
      return Alert.error('Enter an Automation name');
    }

    const generateValues = () => {
      const finalValues = {
        _id: id,
        name,
        status,
        triggers: triggers.map(t => ({
          id: t.id,
          type: t.type,
          actionId: t.actionId,
          config: t.config,
          style: jquery(`#trigger-${t.id}`).attr('style')
        })),
        actions: actions.map(a => ({
          id: a.id,
          type: a.type,
          nextActionId: a.nextActionId,
          config: a.config,
          style: jquery(`#action-${a.id}`).attr('style')
        }))
      };

      return finalValues;
    };

    save(generateValues());
  };

  onConnection = info => {
    const { triggers, actions } = this.state;

    connection(triggers, actions, info, info.targetId.replace('action-', ''));

    this.setState({ triggers, actions });
  };

  onDettachConnection = info => {
    const { triggers, actions } = this.state;

    connection(triggers, actions, info, undefined);

    this.setState({ triggers, actions });
  };

  addTrigger = (value: string, contentId?: string) => {
    const { triggers } = this.state;
    const trigger: any = { id: String(triggers.length), type: value };

    if (contentId) {
      trigger.config = {
        contentId
      };
    }

    triggers.push(trigger);
    this.setState({ triggers, activeTrigger: trigger });

    return this.renderTrigger(trigger);
  };

  addAction = (value: string) => {
    const { actions } = this.state;
    const action = { id: String(actions.length), type: value };

    actions.push(action);
    this.setState({ actions });

    this.renderAction(action);
  };

  onNameChange = (e: React.FormEvent<HTMLElement>) => {
    const value = (e.currentTarget as HTMLButtonElement).value;
    this.setState({ name: value });
  };

  formContent = (formProps: IFormProps) => {
    return (
      <Container>
        <FormWrapper>
          <FormColumn>
            <FormGroup>
              <ControlLabel required={true}>Name</ControlLabel>
              <FormControl
                {...formProps}
                name="name"
                value={this.state.name}
                onChange={this.onNameChange}
                required={true}
                autoFocus={true}
              />
            </FormGroup>
          </FormColumn>
        </FormWrapper>

        <div id="canvas" />
      </Container>
    );
  };

  renderTrigger = (trigger: ITrigger) => {
    const idElm = `trigger-${trigger.id}`;

    jquery('#canvas').append(`
      <div class="trigger" id="${idElm}" style="${trigger.style}">
        ${trigger.type}
      </div>
    `);

    jquery('#canvas').on('dblclick', `#${idElm}`, event => {
      event.preventDefault();

      this.onClickTrigger(trigger);
    });

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

    jquery('#canvas').on('dblclick', `#${idElm}`, event => {
      event.preventDefault();

      this.onClickAction(action);
    });

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

  renderModal(
    shodModal: boolean,
    onClick: () => void,
    title: string,
    content: any
  ) {
    if (!shodModal) {
      return null;
    }

    return (
      <Modal show={true} onHide={onClick}>
        <Modal.Header closeButton={true}>
          <Modal.Title>{title}</Modal.Title>
        </Modal.Header>

        <Modal.Body>{content}</Modal.Body>
      </Modal>
    );
  }

  renderModalTrigger(triggerBtnText: string, content: any, title: string) {
    const trigger = (
      <Button btnStyle="primary" size="small" icon="plus-circle">
        {triggerBtnText}
      </Button>
    );

    const component = props => content({ ...props });

    return <ModalTrigger title={title} trigger={trigger} content={component} />;
  }

  rendeRightActionbar() {
    return (
      <BarItems>
        {this.renderModalTrigger(
          'Add New Trigger',
          props => (
            <TriggerForm addTrigger={this.addTrigger} {...props} />
          ),
          'Select a Trigger'
        )}
        {this.renderModalTrigger(
          'Add New Action',
          props => (
            <ActionsForm
              addAction={this.addAction}
              {...props}
              addActionConfig={this.onAddActionConfig}
            />
          ),
          'Select a Action'
        )}
        <Button
          btnStyle="success"
          size="small"
          icon={'check-circle'}
          onClick={this.handleSubmit}
        >
          Save
        </Button>
      </BarItems>
    );
  }

  render() {
    const { automation } = this.props;
    const {
      showModal,
      showActionModal,
      currentAction,
      activeTrigger,
      selectedContentId
    } = this.state;

    return (
      <React.Fragment>
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
          actionBar={<Wrapper.ActionBar right={this.rendeRightActionbar()} />}
          content={<Form renderContent={this.formContent} />}
        />

        {this.renderModal(
          showModal,
          this.onClickTrigger,
          'Edit trigger',
          <TriggerDetailForm
            activeTrigger={activeTrigger}
            addTrigger={this.addTrigger}
            closeModal={this.onClickTrigger}
            contentId={selectedContentId}
          />
        )}

        {this.renderModal(
          showActionModal,
          this.onClickAction,
          'Edit action',
          <ActionDetailForm
            closeModal={this.onClickAction}
            currentAction={currentAction}
            addAction={this.addAction}
            addActionConfig={this.onAddActionConfig}
          />
        )}
      </React.Fragment>
    );
  }
}

export default AutomationForm;
