import { __, Alert } from '@erxes/ui/src/utils';
import jquery from 'jquery';
import { jsPlumb } from 'jsplumb';
import React from 'react';
import { Link } from 'react-router-dom';
import RTG from 'react-transition-group';

import { FlexContent } from '@erxes/ui/src/activityLogs/styles';
import Button from '@erxes/ui/src/components/Button';
import {
  ControlLabel,
  FormControl,
  FormGroup
} from '@erxes/ui/src/components/form';
import Icon from '@erxes/ui/src/components/Icon';
import Toggle from '@erxes/ui/src/components/Toggle';
import PageContent from '@erxes/ui/src/layout/components/PageContent';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { BarItems, HeightedWrapper } from '@erxes/ui/src/layout/styles';

import { IFlowDocument, IJob } from '../../../flow/types';
import { IJobRefer, IProductsData } from '../../../job/types';
import ActionsForm from '../../containers/forms/actions/ActionsForm';
import Confirmation from '../../containers/forms/Confirmation';
import {
  ActionBarButtonsWrapper,
  AutomationFormContainer,
  BackButton,
  Container,
  RightDrawerContainer,
  Title,
  ToggleWrapper,
  ZoomActions,
  ZoomIcon
} from '../../styles';
import {
  connection,
  connectorHoverStyle,
  connectorPaintStyle,
  createInitialConnections,
  deleteConnection,
  hoverPaintStyle,
  sourceEndpoint,
  targetEndpoint
} from '../../utils';
import NewJobForm from './actions/NewJobForm';
import ProductChooser from '@erxes/ui-products/src/containers/ProductChooser';
import { IProduct } from '@erxes/ui-products/src/types';
import { ProductButton } from '@erxes/ui-cards/src/deals/styles';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Label from '@erxes/ui/src/components/Label';

const plumb: any = jsPlumb;
let instance;

type Props = {
  flow: IFlowDocument;
  jobRefers: IJobRefer[];
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
  actions: IJob[];
  activeAction: IJob;
  selectedContentId?: string;
  isZoomable: boolean;
  zoomStep: number;
  zoom: number;
  percentage: number;
  actionEdited: boolean;
  categoryId: string;
  productId?: string;
  product?: IProduct;
  lastAction: IJob;
  flowStatus: boolean;
};

class AutomationForm extends React.Component<Props, State> {
  private wrapperRef;
  private setZoom;

  constructor(props) {
    super(props);

    const { flow } = this.props;
    const lenFlow = Object.keys(flow);
    const actions = JSON.parse(JSON.stringify(lenFlow.length ? flow.jobs : []));

    this.state = {
      name: lenFlow.length ? flow.name : 'Your flow title',
      actions,
      activeId: '',
      currentTab: 'actions',
      isActionTab: true,
      isActive: lenFlow.length ? flow.status === 'active' : false,
      showNoteForm: false,
      showTemplateForm: false,
      showTrigger: false,
      showDrawer: false,
      showAction: false,
      isZoomable: false,
      zoomStep: 0.025,
      zoom: 1,
      percentage: 100,
      activeAction: {} as IJob,
      actionEdited: false,
      categoryId: '',
      productId: flow.productId || '',
      product: flow.product,
      lastAction: {} as IJob,
      flowStatus: false
    };
  }

  findLastAction = () => {
    const { actions } = this.state;
    const { jobRefers } = this.props;
    const lastActions: IJob[] = [];

    console.log('start finding lastaction ...');

    for (const action of actions) {
      if (!action.nextJobIds.length || action.nextJobIds.length === 0) {
        lastActions.push(action);
        console.log('founded lastAction label: ', action.label);
      }
    }

    console.log('end finding lastActions ...', lastActions);

    console.log('end finding jobRefers ...', jobRefers);

    const lastActionIds = lastActions.map(last => last.jobReferId);
    const lastJobRefers = jobRefers.filter(job =>
      lastActionIds.includes(job._id)
    );

    console.log('end finding lastJobRefers ...', lastJobRefers);

    let resultProducts: IProductsData[] = [];
    for (const lastJobRefer of lastJobRefers) {
      const resultProduct = lastJobRefer.resultProducts;
      resultProducts = resultProducts.length
        ? [...resultProducts, ...(lastJobRefer.resultProducts || [])]
        : [resultProduct];
    }

    console.log('end finding resultProducts ...', resultProducts);

    const checkResult = resultProducts.find(
      pro => pro.productId === this.state.productId
    );

    console.log('end finding checkResult ...', checkResult);

    const doubleCheckResult = Object.keys(checkResult ? checkResult : {})
      .length;
    const justLastJobRefer = doubleCheckResult
      ? lastJobRefers.find(last => last.resultProducts.includes(checkResult))
      : ({} as IJobRefer);
    const justLastAction = Object.keys(justLastJobRefer).length
      ? lastActions.find(last => last.jobReferId === justLastJobRefer._id)
      : ({} as IJob);

    console.log('end finding justLastAction ...', justLastAction);

    this.setState({
      lastAction: justLastAction,
      flowStatus: doubleCheckResult ? true : false
    });
  };

  setWrapperRef = node => {
    this.wrapperRef = node;
  };

  componentDidMount() {
    this.connectInstance();
    this.findLastAction();
    document.addEventListener('click', this.handleClickOutside, true);
  }

  componentDidUpdate(prevProps, prevState) {
    const { isActionTab } = this.state;

    if (isActionTab && isActionTab !== prevState.isActionTab) {
      this.connectInstance();
      // this.setState({ actionEdited: false });
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

    const { actions } = this.state;

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

      // create connections ===================
      createInitialConnections(actions, instance);

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

      const innerActions = this.state.actions;

      const item = event.currentTarget.id;
      // console.log('delete item:', item);

      const splitItem = item.split('-');
      const type = splitItem[0];

      instance.remove(item);

      const leftActions = innerActions.filter(
        action => action.id !== splitItem[1]
      );
      // console.log('leftActions', leftActions);

      if (type === 'action') {
        return this.setState({
          actions: leftActions
        });
      }
    });
  };

  handleSubmit = () => {
    const { name, isActive, actions, productId, flowStatus } = this.state;
    const { flow, save } = this.props;

    if (!name || name === 'Your flow title') {
      return Alert.error('Enter an Flow title');
    }

    const generateValues = () => {
      const finalValues = {
        _id: flow._id || '',
        name,
        status: isActive ? 'active' : 'draft',
        productId,
        flowJobStatus: flowStatus,
        jobs: actions.map(a => ({
          id: a.id,
          nextJobIds: a.nextJobIds,
          jobReferId: a.jobReferId,
          label: a.label,
          description: a.description,
          branchId: a.branchId,
          departmentId: a.departmentId,
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

    const { save, flow } = this.props;

    if (Object.keys(flow).length) {
      save({ _id: flow._id, status: isActive ? 'active' : 'draft' });
    }
  };

  onChange = e => {
    const value = e.target.value;
    // console.log('onchange category: ', value);
    this.setState({ categoryId: value });
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

  onClickAction = (action: IJob) => {
    this.setState({
      showAction: true,
      showDrawer: true,
      currentTab: 'actions',
      activeAction: action ? action : ({} as IJob)
    });
  };

  onConnection = info => {
    const { actions } = this.state;

    this.setState({
      actions: connection(
        actions,
        info,
        info.targetId.replace('action-', ''),
        'connect',
        this.findLastAction
      )
    });

    const sourceAction = actions.find(
      a => a.id.toString() === info.sourceId.replace('action-', '')
    );

    const idElm = 'action-' + (sourceAction || {}).id;
    instance.addEndpoint(idElm, sourceEndpoint, {
      anchor: ['Right']
    });
    instance.draggable(instance.getSelector(`#${idElm}`));
  };

  onDettachConnection = info => {
    const { actions } = this.state;

    this.setState({
      actions: connection(
        actions,
        info,
        info.targetId.replace('action-', ''),
        'disconnect',
        this.findLastAction
      )
    });
  };

  onChangeCategory = (categoryId: string) => {
    this.setState({ categoryId });
  };

  renderProductServiceTrigger(product?: IProduct) {
    let content = (
      <div>
        {__('Choose Product & service ')} <Icon icon="plus-circle" />
      </div>
    );

    // if product selected
    if (product) {
      content = (
        <div>
          {product.name} <Icon icon="pen-1" />
        </div>
      );
    }

    return <ProductButton>{content}</ProductButton>;
  }

  renderProductModal = (currentProduct?: IProduct) => {
    const productOnChange = (products: IProduct[]) => {
      const product = products[0];
      const productId = product ? product._id : '';
      this.setState({ productId, product, name: product.name });
    };

    const content = props => (
      <ProductChooser
        {...props}
        onSelect={productOnChange}
        onChangeCategory={this.onChangeCategory}
        categoryId={this.state.categoryId}
        data={{
          name: 'Product',
          products: currentProduct ? [currentProduct] : []
        }}
        limit={1}
      />
    );

    return (
      <ModalTrigger
        title="Choose product & service"
        trigger={this.renderProductServiceTrigger(currentProduct)}
        size="lg"
        content={content}
      />
    );
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
    this.setState({
      showDrawer: !this.state.showDrawer,
      currentTab: type,
      activeAction: {} as IJob
    });
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

  addAction = (
    data?: IJob,
    actionId?: string,
    jobReferId?: string,
    description?: string,
    branchId?: string,
    departmentId?: string
  ) => {
    const { actions } = this.state;
    const { jobRefers } = this.props;

    let action: IJob = { ...data, id: this.getNewId(actions.map(a => a.id)) };
    let actionIndex = -1;

    if (actionId) {
      actionIndex = actions.findIndex(a => a.id === actionId);

      if (actionIndex !== -1) {
        action = actions[actionIndex];
      }
    }

    action.jobReferId = jobReferId;
    action.branchId = branchId;
    action.departmentId = departmentId;

    const jobRefer: IJobRefer =
      jobRefers.find(j => j._id === jobReferId) || ({} as IJobRefer);

    action.label = jobRefer.name;
    action.description = description || jobRefer.name;

    if (actionIndex !== -1) {
      actions[actionIndex] = action;
    } else {
      actions.push(action);
    }

    this.setState({ actions, activeAction: action, actionEdited: true }, () => {
      if (!actionId) {
        this.renderControl('action', action, this.onClickAction);
      }
    });
  };

  onNameChange = (e: React.FormEvent<HTMLElement>) => {
    const value = (e.currentTarget as HTMLButtonElement).value;
    this.setState({ name: value });
  };

  renderControl = (key: string, item: IJob, onClick: any) => {
    const idElm = `${key}-${item.id}`;

    jquery('#canvas').append(`
      <div class="${key} control" id="${idElm}" style="${item.style}">
        <div class="trigger-header">
          <div class='custom-menu'>
            <div>
              <i class="icon-trash-alt delete-control" id="${idElm}" title=${__(
      'Delete control one'
    )}></i>
            </div>
          </div>
          <div>
            <i class="icon-2"></i>
            ${item.label}
          </div>
        </div>
        <p>${item.description}</p>

      </div>
    `);

    jquery('#canvas').on('dblclick', `#${idElm}`, event => {
      event.preventDefault();

      onClick(item);
    });

    if (key === 'action') {
      instance.addEndpoint(idElm, targetEndpoint, {
        anchor: ['Left']
      });

      instance.addEndpoint(idElm, sourceEndpoint, {
        anchor: ['Right']
      });

      // instance.addEndpoint(idElm, morePoint, {
      //   anchor: ['Right']
      // });

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
          onClick={this.toggleDrawer.bind(this, 'actions')}
        >
          Add a Job
        </Button>
      </>
    );
  }

  renderLabelInfo = (style, text) => {
    return <Label lblStyle={style}>{text}</Label>;
  };

  rendeRightActionBar() {
    const { isActive } = this.state;
    const { queryParams } = this.props;

    return (
      <BarItems>
        <ToggleWrapper>
          <span>{__('Product: ')}</span>
          {this.renderProductModal(this.state.product)}
        </ToggleWrapper>

        <ToggleWrapper>
          <span>{__('Flow status: ')}</span>
          {this.state.flowStatus === true &&
            this.renderLabelInfo('success', 'True')}
          {this.state.flowStatus === false &&
            this.renderLabelInfo('danger', 'False')}
        </ToggleWrapper>
        <ToggleWrapper>
          <span className={isActive ? 'active' : ''}>{__('Inactive')}</span>
          <Toggle defaultChecked={isActive} onChange={this.onToggle} />
          <span className={!isActive ? 'active' : ''}>{__('Active')}</span>
        </ToggleWrapper>
        <ActionBarButtonsWrapper>
          {this.renderButtons()}
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
    const { name } = this.state;

    return (
      <FlexContent>
        <Link to={`/processes/Flows`}>
          <BackButton>
            <Icon icon="angle-left" size={20} />
          </BackButton>
        </Link>
        <Title>
          <FormControl
            name="name"
            value={name}
            onChange={this.onNameChange}
            disabled={true}
            required={true}
            autoFocus={true}
          />
          <Icon icon="edit-alt" size={16} />
        </Title>
        {/* <CenterBar>

        </CenterBar> */}
      </FlexContent>
    );
  }

  onBackAction = () => this.setState({ showAction: false });

  onSave = () => {
    const { activeAction } = this.state;

    this.addAction(activeAction);

    this.onBackAction();
  };

  renderTabContent() {
    const {
      currentTab,
      showAction,
      activeAction,
      product,
      lastAction
    } = this.state;

    const { jobRefers, history, queryParams } = this.props;

    if (currentTab === 'actions') {
      const { actions } = this.state;

      console.log('actions: ', actions);

      if (showAction && activeAction) {
        const checkArray = Object.keys(activeAction);
        let checkedActiveAction = activeAction;
        if (!checkArray.includes('nextJobIds')) {
          checkedActiveAction = { ...activeAction, nextJobIds: [] };
          // console.log('checkedActiveAction:', checkedActiveAction);
        }

        return (
          <>
            <NewJobForm
              activeAction={checkedActiveAction}
              addAction={this.addAction}
              closeModal={this.onBackAction}
              jobRefers={jobRefers}
              actions={actions}
              onSave={this.onSave}
              lastAction={lastAction}
              flowProduct={product}
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
    const { actions } = this.state;

    if (actions.length === 0) {
      return (
        <Container>
          <div
            className="trigger scratch"
            onClick={this.toggleDrawer.bind(this, 'actions')}
          >
            <Icon icon="file-plus" size={25} />
            <p>{__('Please add first job')}?</p>
          </div>
        </Container>
      );
    }

    return (
      <Container>
        {this.renderZoomActions()}
        <div id="canvas" />
      </Container>
    );
  }

  renderConfirmation() {
    const { id, queryParams, history, saveLoading, flow } = this.props;
    const { actions, name } = this.state;

    if (saveLoading) {
      return null;
    }

    const when = queryParams.isCreate
      ? !!id
      : JSON.stringify(actions) !== JSON.stringify([]) ||
        flow.name !== this.state.name;

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

  render() {
    const { flow } = this.props;

    return (
      <>
        {this.renderConfirmation()}
        <HeightedWrapper>
          <AutomationFormContainer>
            <Wrapper.Header
              title={`${(flow && flow.name) || 'Flow detail'}`}
              breadcrumb={[
                { title: __('Flows'), link: '/processes/Flows' },
                { title: `${(flow && flow.name) || 'New Form'}` }
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
        </HeightedWrapper>
      </>
    );
  }
}

export default AutomationForm;
