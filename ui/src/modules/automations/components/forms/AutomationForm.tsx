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
  connection,
  deleteConnection,
  deleteControl,
  sourceEndpoint,
  targetEndpoint
} from 'modules/automations/utils';
import ActionDetailForm from './ActionDetailForm';

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
  activeAction: IAction;
  selectedContentId?: string;
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
      activeAction: {} as IAction
    };
  }

  componentDidMount() {
    instance = plumb.getInstance({
      DragOptions: { cursor: 'pointer', zIndex: 2000 },
      // PaintStyle: {
      //   gradient: {
      //     stops: [
      //       [0, '#0d78bc'],
      //       [1, '#558822']
      //     ]
      //   },
      //   stroke: '#558822',
      //   strokeWidth: 3
      // },
      ConnectionOverlays: [
        [
          'Arrow',
          {
            location: 1,
            visible: true,
            width: 20,
            length: 20,
            id: 'ARROW'
          }
        ]
      ],
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

      // delete connections ===================
      deleteConnection(instance);

      // delete control ===================
      deleteControl();

      // delete from state ===================
      jquery('#canvas').on('click', '.delete-control', () => {
        const item = (window as any).selectedControl;
        const splitItem = item.split('-');
        const type = splitItem[0];

        instance.remove(item);

        if (type === 'action') {
          return this.setState({
            actions: actions.filter(action => action.id !== splitItem[1])
          });
        }

        if (type === 'trigger') {
          return this.setState({
            triggers: triggers.filter(trigger => trigger.id !== splitItem[1])
          });
        }
      });
    });
  }

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

  onAddActionConfig = config => {
    const { activeAction } = this.state;

    activeAction.config = config;
    this.setState({ activeAction });
  };

  onClickTrigger = (trigger?: ITrigger) => {
    const config = trigger && trigger.config;
    const selectedContentId = config && config.contentId;

    this.setState({
      showModal: !this.state.showModal,
      showActionModal: false,
      selectedContentId,
      activeTrigger: trigger ? trigger : ({} as ITrigger)
    });
  };

  onClickAction = (action?: IAction) => {
    this.setState({
      showActionModal: !this.state.showActionModal,
      showModal: false,
      activeAction: action ? action : ({} as IAction)
    });
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

  addTrigger = (value: string, contentId?: string, triggerId?: string) => {
    const { triggers, activeTrigger } = this.state;

    console.log('contentId: ', contentId);

    let trigger: any = { id: String(triggers.length), type: value };
    const triggerIndex = triggers.findIndex(t => t.id === triggerId);

    if (triggerId && activeTrigger.id === triggerId) {
      trigger = activeTrigger;
    }

    if (contentId) {
      trigger.config = {
        contentId
      };
    }

    if (triggerIndex !== -1) {
      triggers[triggerIndex] = trigger;
    } else {
      triggers.push(trigger);
    }

    this.setState({ triggers, activeTrigger: trigger });

    if (!triggerId) {
      this.renderTrigger(trigger);
    }
  };

  addAction = (
    value: string,
    contentId?: string,
    actionId?: string,
    config?: any
  ) => {
    const { actions } = this.state;

    let action: any = { id: String(actions.length), type: value };

    let actionIndex = -1;

    if (actionId) {
      actionIndex = actions.findIndex(a => a.id === actionId);

      if (actionIndex !== -1) {
        action = actions[actionIndex];
      }
    }

    if (contentId) {
      action.config = {
        contentId
      };
    }

    if (config) {
      action.config = config;
    }

    if (actionIndex !== -1) {
      actions[actionIndex] = action;
    } else {
      actions.push(action);
    }

    this.setState({ actions, activeAction: action });

    if (!actionId) {
      this.renderAction(action);
    }
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
      <div class="trigger control" id="${idElm}" style="${trigger.style}">
        ${trigger.type}
      </div>
    `);

    jquery('#canvas').on('dblclick', `#${idElm}`, event => {
      event.preventDefault();

      this.onClickTrigger(trigger);
    });

    instance.addEndpoint(idElm, sourceEndpoint, {
      anchor: [1, 0.5]
    });

    instance.draggable(instance.getSelector(`#${idElm}`));
  };

  renderAction = (action: IAction) => {
    const idElm = `action-${action.id}`;

    jquery('#canvas').append(`
          <div class="action control" id="${idElm}" style="${action.style}" type="${action.type}">
            ${action.type}
          </div>
        `);

    jquery('#canvas').on('dblclick', `#${idElm}`, event => {
      event.preventDefault();

      this.onClickAction(action);
    });

    if (action.type === 'if') {
      instance.addEndpoint(idElm, targetEndpoint, {
        anchor: ['Left']
      });

      instance.addEndpoint(idElm, sourceEndpoint, {
        anchor: [1, 0.2],
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

      instance.addEndpoint(idElm, sourceEndpoint, {
        anchor: [1, 0.8],
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
      instance.addEndpoint(idElm, targetEndpoint, {
        anchor: ['Left']
      });

      instance.addEndpoint(idElm, sourceEndpoint, {
        anchor: ['Right']
      });
    }

    instance.draggable(instance.getSelector(`#${idElm}`));
  };

  renderModal(
    showModal: boolean,
    onClick: () => void,
    title: string,
    content: any
  ) {
    if (!showModal) {
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

    return (
      <ModalTrigger
        title={title}
        trigger={trigger}
        content={component}
        size="xl"
      />
    );
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
      activeAction,
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
            addConfig={this.addTrigger}
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
            activeAction={activeAction}
            addAction={this.addAction}
            addActionConfig={this.onAddActionConfig}
          />
        )}
      </React.Fragment>
    );
  }
}

export default AutomationForm;
