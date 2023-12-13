import React from 'react';

import { ScrolledContent } from '@erxes/ui-automations/src/styles';
import { IAction } from '@erxes/ui-automations/src/types';
import Button from '@erxes/ui/src/components/Button';
import FormControl from '@erxes/ui/src/components/form/Control';
import Form from '@erxes/ui/src/components/form/Form';
import Icon from '@erxes/ui/src/components/Icon';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import { Tabs, TabTitle } from '@erxes/ui/src/components/tabs';
import Toggle from '@erxes/ui/src/components/Toggle';
import PageContent from '@erxes/ui/src/layout/components/PageContent';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { BarItems, FlexContent } from '@erxes/ui/src/layout/styles';
import Alert from '@erxes/ui/src/utils/Alert/index';
import { __ } from '@erxes/ui/src/utils/core';
import { Link } from 'react-router-dom';
import RTG from 'react-transition-group';
import Histories from '../histories/Wrapper';
import Confirmation from '../../containers/forms/Confirmation';
import TemplateForm from '../../containers/forms/TemplateForm';
import TriggerForm from '../../containers/forms/triggers/TriggerForm';
import {
  ActionBarButtonsWrapper,
  BackButton,
  BackIcon,
  CenterBar,
  RightDrawerContainer,
  Title,
  ToggleWrapper
} from '../../styles';
import {
  AutomationConstants,
  IAutomation,
  IAutomationNote,
  ITrigger
} from '../../types';
import { connection, getTriggerConfig, getTriggerType } from '../../utils';
import ActionDetailForm from '../forms/actions/ActionDetailForm';
import ActionsForm from '../forms/actions/ActionsForm';
import TriggerDetailForm from '../forms/triggers/TriggerDetailForm';
import AutomationEditor from './RFEditor';

type Props = {
  automation: IAutomation;
  automationNotes?: IAutomationNote[];
  save: (params: any) => void;
  saveLoading: boolean;
  id: string;
  history: any;
  queryParams: any;
  constants: AutomationConstants;
};

type State = {
  name: string;
  currentTab: string;
  activeId: string;
  showDrawer: boolean;
  showTrigger: boolean;
  showAction: boolean;
  isActionTab: boolean;
  isActive: boolean;
  editNoteForm?: boolean;
  actions: IAction[];
  triggers: ITrigger[];
  activeTrigger: ITrigger;
  activeAction: IAction;
  selectedContentId?: string;
  automationNotes: IAutomationNote[];
  awaitingActionId?: string;
};

class Editor extends React.Component<Props, State> {
  private wrapperRef;
  constructor(props) {
    super(props);

    const { automation, automationNotes = [] } = this.props;

    this.state = {
      name: automation.name,
      actions: JSON.parse(JSON.stringify(automation.actions || [])),
      triggers: JSON.parse(JSON.stringify(automation.triggers || [])),
      activeTrigger: {} as ITrigger,
      activeId: '',
      currentTab: 'triggers',
      isActionTab: true,
      isActive: automation.status === 'active',
      showTrigger: false,
      showDrawer: false,
      showAction: false,
      activeAction: {} as IAction,
      automationNotes
    };
  }

  getNewId = (checkIds: string[]) => {
    let newId = Math.random()
      .toString(36)
      .slice(-8);

    if (checkIds.includes(newId)) {
      newId = this.getNewId(checkIds);
    }

    return newId;
  };

  setWrapperRef = node => {
    this.wrapperRef = node;
  };

  onNameChange = (e: React.FormEvent<HTMLElement>) => {
    const value = (e.currentTarget as HTMLButtonElement).value;
    this.setState({ name: value });
  };
  switchActionbarTab = type => {
    this.setState({ isActionTab: type === 'action' ? true : false });
  };

  onToggle = e => {
    const isActive = e.target.checked;

    this.setState({ isActive });

    const { save, automation } = this.props;

    if (automation) {
      save({ _id: automation._id, status: isActive ? 'active' : 'draft' });
    }
  };

  handleSubmit = () => {
    const { name, isActive, triggers, actions } = this.state;
    const { automation, save } = this.props;

    if (!name || name === 'Your automation title') {
      return Alert.error('Enter an Automation title');
    }

    const generateValues = () => {
      const finalValues = {
        _id: automation._id,
        name,
        status: isActive ? 'active' : 'draft',
        triggers: triggers.map(t => ({
          id: t.id,
          type: t.type,
          config: t.config,
          icon: t.icon,
          label: t.label,
          description: t.description,
          actionId: t.actionId,
          position: t.position
        })),
        actions: actions.map(a => ({
          id: a.id,
          type: a.type,
          nextActionId: a.nextActionId,
          config: a.config,
          icon: a.icon,
          label: a.label,
          description: a.description,
          position: a.position
        }))
      };

      return finalValues;
    };

    return save(generateValues());
  };

  onClickAction = (action: IAction) => {
    this.setState({
      showAction: true,
      showDrawer: true,
      showTrigger: false,
      currentTab: 'actions',
      activeAction: action ? action : ({} as IAction)
    });
  };

  onClickTrigger = (trigger: ITrigger) => {
    const config = trigger && trigger.config;
    const selectedContentId = config && config.contentId;

    this.setState({
      showTrigger: true,
      showDrawer: true,
      showAction: false,
      currentTab: 'triggers',
      selectedContentId,
      activeTrigger: trigger ? trigger : ({} as ITrigger)
    });
  };

  onSelectActiveTriggerAction = (type, id) => {
    const { triggers, actions } = this.state;

    if (type === 'action') {
      const action = actions.find(action => action.id === id);

      return action && this.onClickAction(action);
    }

    if (type === 'trigger') {
      const trigger = triggers.find(trigger => trigger.id === id);
      trigger && this.onClickTrigger(trigger);
    }
  };

  toggleDrawer = ({
    type,
    awaitingActionId
  }: {
    type: string;
    awaitingActionId?: string;
  }) => {
    const { showDrawer, triggers } = this.state;

    if (type === 'actions' && triggers.length === 0) {
      return Alert.warning('Please add a Trigger first!');
    }

    this.setState({
      showDrawer: !showDrawer,
      currentTab: type,
      awaitingActionId
    });
  };

  onConnection = info => {
    const { triggers, actions } = this.state;

    connection(triggers, actions, info, info.targetId);

    this.setState({ triggers, actions });
  };

  addAction = (data: IAction, actionId?: string, config?: any) => {
    let { actions, awaitingActionId } = this.state;

    let action: any = { ...data, id: this.getNewId(actions.map(a => a.id)) };

    let actionIndex = -1;

    if (actionId) {
      actionIndex = actions.findIndex(a => a.id === actionId);

      if (actionIndex !== -1) {
        action = actions[actionIndex];
      }
    }

    action.config = { ...action.config, ...config };

    if (actionIndex !== -1) {
      actions[actionIndex] = action;
    } else {
      actions.push(action);
    }

    if (awaitingActionId) {
      const [awaitActionId, optionalConnectId] = awaitingActionId.split('-');

      actions = actions.map(a => {
        if (a.id === awaitActionId && optionalConnectId) {
          const { config } = a || {};
          const { optionalConnects = [] } = config || {};

          return {
            ...a,
            config: {
              ...config,
              optionalConnects: [
                ...optionalConnects,
                { sourceId: a.id, actionId: action.id, optionalConnectId }
              ]
            }
          };
        }

        if (a.id === awaitActionId) {
          return { ...a, nextActionId: action.id };
        }

        return a;
      });
    }

    this.setState({
      actions,
      activeAction: action,
      awaitingActionId: undefined
    });
  };

  addTrigger = (data: ITrigger, triggerId?: string, config?: any) => {
    const { triggers, activeTrigger } = this.state;

    let trigger: any = {
      ...data,
      id: this.getNewId(triggers.map(t => t.id))
    };
    const triggerIndex = triggers.findIndex(t => t.id === triggerId);

    if (triggerId && activeTrigger.id === triggerId) {
      trigger = activeTrigger;
    }

    trigger.config = { ...trigger.config, ...config };

    if (triggerIndex !== -1) {
      triggers[triggerIndex] = trigger;
    } else {
      triggers.push(trigger);
    }

    this.setState({ triggers, activeTrigger: trigger });
  };

  removeItem = (type, id) => {
    const fieldName = `${type}s`;

    this.setState({
      [fieldName]: this.state[fieldName].filter(item => item.id !== id)
    } as Pick<State, keyof State>);
  };

  renderTabContent() {
    const {
      currentTab,
      showTrigger,
      showAction,
      activeTrigger,
      activeAction,
      selectedContentId
    } = this.state;

    const {
      constants: { triggersConst, actionsConst, propertyTypesConst }
    } = this.props;

    const onBack = () => this.setState({ showTrigger: false });
    const onBackAction = () => this.setState({ showAction: false });

    if (currentTab === 'triggers') {
      if (showTrigger && activeTrigger) {
        return (
          <>
            <BackIcon onClick={onBack}>
              <Icon icon="angle-left" size={20} /> {__('Back to triggers')}
            </BackIcon>
            <ScrolledContent>
              <TriggerDetailForm
                activeTrigger={activeTrigger}
                addConfig={this.addTrigger}
                closeModal={onBack}
                contentId={selectedContentId}
              />
            </ScrolledContent>
          </>
        );
      }

      return (
        <TriggerForm
          triggersConst={triggersConst}
          onClickTrigger={this.onClickTrigger}
        />
      );
    }

    if (currentTab === 'actions') {
      const { actions, triggers } = this.state;

      if (showAction && activeAction) {
        return (
          <>
            <BackIcon onClick={onBackAction}>
              <Icon icon="angle-left" size={20} /> {__('Back to actions')}
            </BackIcon>
            <ActionDetailForm
              activeAction={activeAction}
              addAction={this.addAction}
              closeModal={onBackAction}
              triggerType={getTriggerType(actions, triggers, activeAction.id)}
              triggerConfig={getTriggerConfig(
                actions,
                triggers,
                activeAction.id
              )}
              actionsConst={actionsConst}
              propertyTypesConst={propertyTypesConst}
            />
          </>
        );
      }

      return (
        <ActionsForm
          actionsConst={actionsConst}
          onClickAction={this.onClickAction}
        />
      );
    }

    return null;
  }

  renderButtons() {
    if (!this.state.isActionTab) {
      return null;
    }

    return (
      <>
        <Button
          btnStyle="primary"
          size="small"
          icon="plus-circle"
          onClick={this.toggleDrawer.bind(this, { type: 'triggers' })}
        >
          Add a Trigger
        </Button>
        <Button
          btnStyle="primary"
          size="small"
          icon="plus-circle"
          onClick={this.toggleDrawer.bind(this, { type: 'actions' })}
        >
          Add an Action
        </Button>
      </>
    );
  }

  renderLeftActionBar() {
    const { isActionTab, name } = this.state;

    return (
      <FlexContent>
        <Link to={`/automations`}>
          <BackButton>
            <Icon icon="angle-left" size={20} />
          </BackButton>
        </Link>
        <Title>
          <FormControl
            name="name"
            value={name}
            onChange={this.onNameChange}
            required={true}
            autoFocus={true}
          />
          <Icon icon="edit-alt" size={16} />
        </Title>
        <CenterBar>
          <Tabs full={true}>
            <TabTitle
              className={isActionTab ? 'active' : ''}
              onClick={this.switchActionbarTab.bind(this, 'action')}
            >
              {__('Actions')}
            </TabTitle>
            <TabTitle
              className={isActionTab ? '' : 'active'}
              onClick={this.switchActionbarTab.bind(this, 'history')}
            >
              {__('Histories')}
            </TabTitle>
          </Tabs>
        </CenterBar>
      </FlexContent>
    );
  }

  onChangeItemPosition = (type: string, id: string, position: any) => {
    const { triggers, actions } = this.state;
    const items: IAction[] | ITrigger[] =
      type === 'trigger' ? triggers : actions;

    this.setState({
      ...this.state,
      [`${type}s`]: items.map(item =>
        item.id === id ? { ...item, position } : item
      )
    });
  };

  renderConfirmation() {
    const { id, queryParams, history, saveLoading, automation } = this.props;
    const { triggers, actions, name } = this.state;

    if (saveLoading) {
      return null;
    }

    const when = queryParams.isCreate
      ? !!id
      : JSON.stringify(triggers) !==
          JSON.stringify(automation.triggers || []) ||
        JSON.stringify(actions) !== JSON.stringify(automation.actions || []) ||
        automation.name !== this.state.name;

    return (
      <Confirmation
        when={when}
        id={id}
        name={name}
        save={this.handleSubmit}
        history={history}
        queryParams={queryParams}
      />
    );
  }

  renderTemplateModal() {
    const { automation } = this.props;

    const content = ({ closeModal }) => {
      return (
        <Form
          renderContent={formProps => (
            <TemplateForm
              formProps={formProps}
              closeModal={closeModal}
              id={automation._id}
              name={automation.name}
            />
          )}
        />
      );
    };

    const trigger = (
      <Button btnStyle="primary" size="small" icon={'check-circle'}>
        Save as a template
      </Button>
    );

    return (
      <ModalTrigger content={content} trigger={trigger} title="" hideHeader />
    );
  }

  rendeRightActionBar() {
    const { isActive } = this.state;

    return (
      <BarItems>
        <ToggleWrapper>
          <span className={isActive ? 'active' : ''}>{__('Inactive')}</span>
          <Toggle defaultChecked={isActive} onChange={this.onToggle} />
          <span className={!isActive ? 'active' : ''}>{__('Active')}</span>
        </ToggleWrapper>
        <ActionBarButtonsWrapper>
          {this.renderButtons()}
          {this.renderTemplateModal()}
          <Button
            btnStyle="success"
            size="small"
            icon={'check-circle'}
            onClick={this.handleSubmit}
          >
            {__('Save')}
          </Button>
        </ActionBarButtonsWrapper>
      </BarItems>
    );
  }

  renderContent() {
    const { triggers, actions, showDrawer } = this.state;
    const {
      automation,
      constants: { triggersConst, actionsConst },
      automationNotes
    } = this.props;

    if (!this.state.isActionTab) {
      if (!automation) {
        return <div />;
      }

      return (
        <Histories
          automation={automation}
          triggersConst={triggersConst}
          actionsConst={actionsConst}
        />
      );
    }

    return (
      <AutomationEditor
        automation={automation}
        triggers={triggers}
        actions={actions}
        constants={this.props.constants}
        automationNotes={automationNotes}
        showDrawer={showDrawer}
        toggleDrawer={this.toggleDrawer}
        onDoubleClick={this.onSelectActiveTriggerAction}
        removeItem={this.removeItem}
        onConnection={this.onConnection}
        onChangePositions={this.onChangeItemPosition}
      />
    );
  }

  render() {
    const { automation } = this.props;
    const { showDrawer } = this.state;

    return (
      <>
        {this.renderConfirmation()}
        <Wrapper.Header
          title={`${(automation && automation.name) || 'Automation'}`}
          breadcrumb={[
            { title: __('Automations'), link: '/automations' },
            { title: `${(automation && automation.name) || ''}` }
          ]}
        />

        <PageContent
          actionBar={
            <Wrapper.ActionBar
              left={this.renderLeftActionBar()}
              right={this.rendeRightActionBar()}
            />
          }
          transparent={false}
        >
          {this.renderContent()}
        </PageContent>

        <div ref={this.setWrapperRef}>
          <RTG.CSSTransition
            in={showDrawer}
            timeout={300}
            classNames="slide-in-right"
            unmountOnExit={true}
          >
            <RightDrawerContainer>
              {this.renderTabContent()}
            </RightDrawerContainer>
          </RTG.CSSTransition>
        </div>
      </>
    );
  }
}

export default Editor;
