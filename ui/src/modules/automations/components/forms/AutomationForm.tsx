import { __, Alert } from 'modules/common/utils';
import { jsPlumb } from 'jsplumb';
import jquery from 'jquery';
import RTG from 'react-transition-group';
import Wrapper from 'modules/layout/components/Wrapper';
import React from 'react';
import Form from 'modules/common/components/form/Form';
import { IAction, IAutomation, ITrigger, IAutomationNote } from '../../types';
import {
  Container,
  CenterFlexRow,
  BackButton,
  Title,
  RightDrawerContainer,
  AutomationFormContainer,
  ScrolledContent,
  BackIcon,
  CenterBar,
  ToggleWrapper,
  ZoomActions,
  ZoomIcon,
  ActionBarButtonsWrapper
} from '../../styles';
import { FormControl } from 'modules/common/components/form';
import { BarItems, HeightedWrapper } from 'modules/layout/styles';
import Button from 'modules/common/components/Button';
import TriggerForm from '../../containers/forms/triggers/TriggerForm';
import ActionsForm from '../../containers/forms/actions/ActionsForm';
import TriggerDetailForm from './triggers/TriggerDetailForm';
import {
  createInitialConnections,
  connection,
  deleteConnection,
  sourceEndpoint,
  targetEndpoint,
  connectorPaintStyle,
  connectorHoverStyle,
  hoverPaintStyle,
  yesEndPoint,
  noEndPoint,
  getTriggerType
} from 'modules/automations/utils';
import ActionDetailForm from './actions/ActionDetailForm';
import Icon from 'modules/common/components/Icon';
import PageContent from 'modules/layout/components/PageContent';
import { Link } from 'react-router-dom';
import { Tabs, TabTitle } from 'modules/common/components/tabs';
import Toggle from 'modules/common/components/Toggle';
import Modal from 'react-bootstrap/Modal';
import NoteFormContainer from 'modules/automations/containers/forms/NoteForm';
import TemplateForm from '../../containers/forms/TemplateForm';
import Histories from 'modules/automations/components/histories/Wrapper';
import Confirmation from 'modules/automations/containers/forms/Confirmation';
import { TRIGGER_TYPES } from 'modules/automations/constants';

const plumb: any = jsPlumb;
let instance;

type Props = {
  automation: IAutomation;
  automationNotes?: IAutomationNote[];
  save: (params: any) => void;
  saveLoading: boolean;
  id: string;
  history: any;
  queryParams: any;
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
  showNoteForm: boolean;
  editNoteForm?: boolean;
  showTemplateForm: boolean;
  actions: IAction[];
  triggers: ITrigger[];
  activeTrigger: ITrigger;
  activeAction: IAction;
  selectedContentId?: string;
  isZoomable: boolean;
  zoomStep: number;
  zoom: number;
  percentage: number;
  automationNotes: IAutomationNote[];
};

class AutomationForm extends React.Component<Props, State> {
  private wrapperRef;
  private setZoom;

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
      showNoteForm: false,
      showTemplateForm: false,
      showTrigger: false,
      showDrawer: false,
      showAction: false,
      isZoomable: false,
      zoomStep: 0.025,
      zoom: 1,
      percentage: 100,
      activeAction: {} as IAction,
      automationNotes
    };
  }

  setWrapperRef = node => {
    this.wrapperRef = node;
  };

  componentDidMount() {
    this.connectInstance();

    document.addEventListener('click', this.handleClickOutside, true);
  }

  componentDidUpdate(prevProps, prevState) {
    const { isActionTab } = this.state;

    if (isActionTab && isActionTab !== prevState.isActionTab) {
      this.connectInstance();
    }

    this.setZoom = (zoom, instanceZoom, transformOrigin, el) => {
      transformOrigin = transformOrigin || [0.5, 0.5];
      instanceZoom = instanceZoom || jsPlumb;
      el = el || instanceZoom.getContainer();

      const p = ['webkit', 'moz', 'ms', 'o'];
      const s = 'scale(' + zoom + ')';
      const oString =
        transformOrigin[0] * 100 + '% ' + transformOrigin[1] * 100 + '%';

      // tslint:disable-next-line:prefer-for-of
      for (let i = 0; i < p.length; i++) {
        el.style[p[i] + 'Transform'] = s;
        el.style[p[i] + 'TransformOrigin'] = oString;
      }

      el.style.transform = s;
      el.style.transformOrigin = oString;

      instanceZoom.setZoom(zoom);
    };

    if (
      (prevProps.automationNotes || []).length !==
      (this.props.automationNotes || []).length
    ) {
      this.setState({ automationNotes: this.props.automationNotes || [] });
    }
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.handleClickOutside, true);
  }

  connectInstance = () => {
    instance = plumb.getInstance({
      DragOptions: { cursor: 'pointer', zIndex: 2000 },
      PaintStyle: connectorPaintStyle,
      HoverPaintStyle: connectorHoverStyle,
      EndpointStyle: { radius: 10 },
      EndpointHoverStyle: hoverPaintStyle,
      Container: 'canvas'
    });

    const { triggers, actions } = this.state;

    instance.bind('ready', () => {
      instance.bind('connection', info => {
        this.onConnection(info);
      });

      instance.bind('connectionDetached', info => {
        this.onDettachConnection(info);
      });

      for (const action of actions) {
        this.renderControl('action', action, this.onClickAction);
      }

      for (const trigger of triggers) {
        this.renderControl('trigger', trigger, this.onClickTrigger);
      }

      // create connections ===================
      createInitialConnections(triggers, actions, instance);

      // delete connections ===================
      deleteConnection(instance);
    });

    // hover action control ===================
    jquery('#canvas .control').hover(event => {
      event.preventDefault();

      jquery(`div#${event.currentTarget.id}`).toggleClass('show-action-menu');

      this.setState({ activeId: event.currentTarget.id });
    });

    // delete control ===================
    jquery('#canvas').on('click', '.delete-control', event => {
      event.preventDefault();

      const item = event.currentTarget.id;
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

    // add note ===================
    jquery('#canvas').on('click', '.add-note', event => {
      event.preventDefault();

      this.handleNoteModal();
    });
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
          style: jquery(`#trigger-${t.id}`).attr('style')
        })),
        actions: actions.map(a => ({
          id: a.id,
          type: a.type,
          nextActionId: a.nextActionId,
          config: a.config,
          icon: a.icon,
          label: a.label,
          description: a.description,
          style: jquery(`#action-${a.id}`).attr('style')
        }))
      };

      return finalValues;
    };

    return save(generateValues());
  };

  handleNoteModal = (item?) => {
    this.setState({
      showNoteForm: !this.state.showNoteForm,
      editNoteForm: item ? true : false
    });
  };

  handleTemplateModal = () => {
    this.setState({ showTemplateForm: !this.state.showTemplateForm });
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

  onAddActionConfig = config => {
    const { activeAction } = this.state;

    activeAction.config = config;
    this.setState({ activeAction });
  };

  doZoom = (step: number, inRange: boolean) => {
    const { isZoomable, zoom } = this.state;

    if (inRange) {
      this.setState({ zoom: zoom + step });
      this.setZoom(zoom, jsPlumb, null, jquery('#canvas')[0]);

      if (isZoomable) {
        this.setState({ zoom: zoom + step });
        setTimeout(() => this.doZoom(step, inRange), 100);
      }
    }
  };

  onZoom = (type: string) => {
    const { zoomStep, zoom, percentage } = this.state;

    this.setState({ isZoomable: true }, () => {
      let step = 0 - zoomStep;
      const max = zoom <= 1;
      const min = zoom >= 0.399;

      if (type === 'zoomIn') {
        step = +zoomStep;

        this.doZoom(step, max);
        this.setState({ percentage: max ? percentage + 10 : 100 });
      }

      if (type === 'zoomOut') {
        this.doZoom(step, min);
        this.setState({ percentage: min ? percentage - 10 : 0 });
      }
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

  onClickAction = (action: IAction) => {
    this.setState({
      showAction: true,
      showDrawer: true,
      showTrigger: false,
      currentTab: 'actions',
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

  handleClickOutside = event => {
    if (
      this.wrapperRef &&
      !this.wrapperRef.contains(event.target) &&
      this.state.isActionTab
    ) {
      this.setState({ showDrawer: false });
    }
  };

  toggleDrawer = (type: string) => {
    this.setState({ showDrawer: !this.state.showDrawer, currentTab: type });
  };

  getNewId = (checkIds: string[]) => {
    let newId = Math.random()
      .toString(36)
      .slice(-8);

    if (checkIds.includes(newId)) {
      newId = this.getNewId(checkIds);
    }

    return newId;
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

    this.setState({ triggers, activeTrigger: trigger }, () => {
      if (!triggerId) {
        this.renderControl('trigger', trigger, this.onClickTrigger);
      }
    });
  };

  addAction = (data: IAction, actionId?: string, config?: any) => {
    const { actions } = this.state;

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

    this.setState({ actions, activeAction: action }, () => {
      if (!actionId) {
        this.renderControl('action', action, this.onClickAction);
      }
    });
  };

  onNameChange = (e: React.FormEvent<HTMLElement>) => {
    const value = (e.currentTarget as HTMLButtonElement).value;
    this.setState({ name: value });
  };

  onClickNote = activeId => {
    this.setState({ activeId }, () => {
      this.handleNoteModal(activeId);
    });
  };

  checkNote = (activeId: string) => {
    const item = activeId.split('-');
    const type = item[0];

    return (this.state.automationNotes || []).filter(note => {
      if (type === 'trigger' && note.triggerId !== item[1]) {
        return null;
      }

      if (type === 'action' && note.actionId !== item[1]) {
        return null;
      }

      return note;
    });
  };

  renderNotes(key: string) {
    const noteCount = (this.checkNote(key) || []).length;

    if (noteCount === 0) {
      return ``;
    }

    return `
      <div class="note-badge note-badge-${key}" title=${__(
      'Notes'
    )} id="${key}">
        <i class="icon-notes"></i>
      </div>
    `;
  }

  renderCount(item: ITrigger | IAction) {
    if (item.count && TRIGGER_TYPES.includes(item.type)) {
      return `(${item.count})`;
    }

    return '';
  }

  renderControl = (key: string, item: ITrigger | IAction, onClick: any) => {
    const idElm = `${key}-${item.id}`;

    jquery('#canvas').append(`
      <div class="${key} control" id="${idElm}" style="${item.style}">
        <div class="trigger-header">
          <div class='custom-menu'>
            <div>
              <i class="icon-notes add-note" title=${__('Write Note')}></i>
              <i class="icon-trash-alt delete-control" id="${idElm}" title=${__(
      'Delete control'
    )}></i>
            </div>
          </div>
          <div>
            <i class="icon-${item.icon}"></i>
            ${item.label} ${this.renderCount(item)}
          </div>
        </div>
        <p>${item.description}</p>
        ${this.renderNotes(idElm)}

      </div>
    `);

    jquery('#canvas').on('dblclick', `#${idElm}`, event => {
      event.preventDefault();

      onClick(item);
    });

    jquery('#canvas').on('click', `.note-badge-${idElm}`, event => {
      event.preventDefault();

      this.onClickNote(event.currentTarget.id);
    });

    if (key === 'trigger') {
      instance.addEndpoint(idElm, sourceEndpoint, {
        anchor: [1, 0.5]
      });

      if (instance.getSelector(`#${idElm}`).length > 0) {
        instance.draggable(instance.getSelector(`#${idElm}`));
      }
    }

    if (key === 'action') {
      if (item.type === 'if') {
        instance.addEndpoint(idElm, targetEndpoint, {
          anchor: ['Left']
        });

        instance.addEndpoint(idElm, yesEndPoint);
        instance.addEndpoint(idElm, noEndPoint);
      } else {
        instance.addEndpoint(idElm, targetEndpoint, {
          anchor: ['Left']
        });

        instance.addEndpoint(idElm, sourceEndpoint, {
          anchor: ['Right']
        });
      }

      instance.draggable(instance.getSelector(`#${idElm}`));
    }
  };

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
          onClick={this.toggleDrawer.bind(this, 'triggers')}
        >
          Add a Trigger
        </Button>
        <Button
          btnStyle="primary"
          size="small"
          icon="plus-circle"
          onClick={this.toggleDrawer.bind(this, 'actions')}
        >
          Add an Action
        </Button>
      </>
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
          {
            <Button
              btnStyle="primary"
              size="small"
              icon={'check-circle'}
              onClick={this.handleTemplateModal}
            >
              Save as a template
            </Button>
          }
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

  renderLeftActionBar() {
    const { isActionTab, name } = this.state;

    return (
      <CenterFlexRow>
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
      </CenterFlexRow>
    );
  }

  renderTabContent() {
    const {
      currentTab,
      showTrigger,
      showAction,
      activeTrigger,
      activeAction,
      selectedContentId
    } = this.state;

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

      return <TriggerForm onClickTrigger={this.onClickTrigger} />;
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
            />
          </>
        );
      }

      return <ActionsForm onClickAction={this.onClickAction} />;
    }

    return null;
  }

  renderZoomActions() {
    return (
      <ZoomActions>
        <div className="icon-wrapper">
          <ZoomIcon
            disabled={this.state.zoom >= 1}
            onMouseDown={this.onZoom.bind(this, 'zoomIn')}
            onMouseUp={() => this.setState({ isZoomable: false })}
          >
            <Icon icon="plus" />
          </ZoomIcon>
          <ZoomIcon
            disabled={this.state.zoom <= 0.399}
            onMouseDown={this.onZoom.bind(this, 'zoomOut')}
            onMouseUp={() => this.setState({ isZoomable: false })}
          >
            <Icon icon="minus" />{' '}
          </ZoomIcon>
        </div>
        <span>{`${this.state.percentage}%`}</span>
      </ZoomActions>
    );
  }

  renderContent() {
    const { triggers, actions } = this.state;

    if (triggers.length === 0 && actions.length === 0) {
      return (
        <Container>
          <div
            className="trigger scratch"
            onClick={this.toggleDrawer.bind(this, 'triggers')}
          >
            <Icon icon="file-plus" size={25} />
            <p>{__('How do you want to trigger this automation')}?</p>
          </div>
        </Container>
      );
    }

    const { automation } = this.props;

    if (!this.state.isActionTab) {
      if (!automation) {
        return <div />;
      }

      return <Histories automation={automation} />;
    }

    return (
      <Container>
        {this.renderZoomActions()}
        <div id="canvas" />
      </Container>
    );
  }

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

  renderNoteModal() {
    const { showNoteForm, editNoteForm, activeId } = this.state;

    if (!showNoteForm) {
      return null;
    }

    const { automation } = this.props;

    return (
      <Modal
        enforceFocus={false}
        show={showNoteForm}
        onHide={this.handleNoteModal}
        animation={false}
      >
        <Modal.Body>
          <Form
            renderContent={formProps => (
              <NoteFormContainer
                formProps={formProps}
                automationId={automation ? automation._id : ''}
                isEdit={editNoteForm}
                itemId={activeId}
                notes={this.checkNote(activeId) || []}
                closeModal={this.handleNoteModal}
              />
            )}
          />
        </Modal.Body>
      </Modal>
    );
  }

  renderTemplateModal() {
    const { showTemplateForm } = this.state;
    const { automation } = this.props;

    if (!showTemplateForm || !automation) {
      return null;
    }

    return (
      <Modal
        enforceFocus={false}
        show={showTemplateForm}
        onHide={this.handleTemplateModal}
        animation={false}
      >
        <Modal.Body>
          <Form
            renderContent={formProps => (
              <TemplateForm
                formProps={formProps}
                closeModal={this.handleTemplateModal}
                id={automation._id}
                name={automation.name}
              />
            )}
          />
        </Modal.Body>
      </Modal>
    );
  }

  render() {
    const { automation } = this.props;

    return (
      <>
        {this.renderConfirmation()}
        <HeightedWrapper>
          <AutomationFormContainer>
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
          </AutomationFormContainer>

          <div ref={this.setWrapperRef}>
            <RTG.CSSTransition
              in={this.state.showDrawer}
              timeout={300}
              classNames="slide-in-right"
              unmountOnExit={true}
            >
              <RightDrawerContainer>
                {this.renderTabContent()}
              </RightDrawerContainer>
            </RTG.CSSTransition>
          </div>

          {this.renderNoteModal()}
          {this.renderTemplateModal()}
        </HeightedWrapper>
      </>
    );
  }
}

export default AutomationForm;
