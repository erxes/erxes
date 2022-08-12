import Button from '@erxes/ui/src/components/Button';
import Confirmation from '../../containers/forms/Confirmation';
import FlowJobsForm from './actions/FlowJobsForm';
import Icon from '@erxes/ui/src/components/Icon';
import jquery from 'jquery';
import Label from '@erxes/ui/src/components/Label';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import NewJobForm from './actions/NewJobForm';
import PageContent from '@erxes/ui/src/layout/components/PageContent';
import ProductChooser from '@erxes/ui-products/src/containers/ProductChooser';
import React from 'react';
import RTG from 'react-transition-group';
import Toggle from '@erxes/ui/src/components/Toggle';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { __, Alert } from '@erxes/ui/src/utils';
import {
  BackButton,
  Container,
  FlowFormContainer,
  RightDrawerContainer,
  Title,
  ToggleWrapper,
  ZoomFlowJobs,
  ZoomIcon
} from '../../styles';
import {
  BarItems,
  FlexContent,
  HeightedWrapper
} from '@erxes/ui/src/layout/styles';
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
import { FlowJobBarButtonsWrapper } from '../../styles';
import { FormControl } from '@erxes/ui/src/components/form';
import { IFlowDocument, IJob } from '../../../flow/types';
import { IJobRefer, IProductsData } from '../../../job/types';
import { IProduct } from '@erxes/ui-products/src/types';
import { jsPlumb } from 'jsplumb';
import { Link } from 'react-router-dom';
import { ProductButton } from '@erxes/ui-cards/src/deals/styles';

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
  showFlowJob: boolean;
  isActive: boolean;
  showNoteForm: boolean;
  editNoteForm?: boolean;
  showTemplateForm: boolean;
  flowJobs: IJob[];
  activeFlowJob: IJob;
  selectedContentId?: string;
  isZoomable: boolean;
  zoomStep: number;
  zoom: number;
  percentage: number;
  flowJobEdited: boolean;
  categoryId: string;
  productId?: string;
  product?: IProduct;
  lastFlowJob?: IJob;
  flowStatus: boolean;
};

class AutomationForm extends React.Component<Props, State> {
  private wrapperRef;
  private setZoom;

  constructor(props) {
    super(props);

    const { flow } = this.props;
    const lenFlow = Object.keys(flow);
    const flowJobs = JSON.parse(
      JSON.stringify(lenFlow.length ? flow.jobs : [])
    );

    this.state = {
      name: lenFlow.length ? flow.name : 'Your flow title',
      flowJobs,
      activeId: '',
      currentTab: 'flowJobs',
      isActive: lenFlow.length ? flow.status === 'active' : false,
      showNoteForm: false,
      showTemplateForm: false,
      showTrigger: false,
      showDrawer: false,
      showFlowJob: false,
      isZoomable: false,
      zoomStep: 0.025,
      zoom: 1,
      percentage: 100,
      activeFlowJob: {} as IJob,
      flowJobEdited: false,
      categoryId: '',
      productId: flow.productId || '',
      product: flow.product,
      lastFlowJob: undefined,
      flowStatus: false
    };
  }

  findLastFlowJob = (leftflowJob: IJob[] = []) => {
    const { flowJobs } = this.state;
    const { jobRefers } = this.props;
    const lastFlowJobs: IJob[] = [];
    const realFlowJobs = leftflowJob.length > 0 ? leftflowJob : flowJobs;

    for (const flowJob of realFlowJobs) {
      if (!(flowJob.nextJobIds || []).length) {
        lastFlowJobs.push(flowJob);
      }
    }

    const lastFlobJobIds: string[] =
      lastFlowJobs
        .filter(last => last.jobReferId)
        .map(last => last.jobReferId || '') || [];
    const lastJobRefers: IJobRefer[] =
      jobRefers.filter(job => lastFlobJobIds.includes(job._id)) || [];

    let resultProducts: IProductsData[] = [];
    for (const lastJobRefer of lastJobRefers) {
      const resultProduct = lastJobRefer.resultProducts || [];
      resultProducts = resultProducts.length
        ? [...resultProducts, ...(lastJobRefer.resultProducts || [])]
        : resultProduct;
    }

    const checkResult: IProductsData =
      resultProducts.find(pro => pro.productId === this.state.productId) ||
      ({} as IProductsData);

    let doubleCheckResult: number | boolean = Object.keys(
      checkResult ? checkResult : {}
    ).length;

    if (doubleCheckResult) {
      let justLastJobRefer = {} as IJobRefer;
      for (const lastJobRefer of lastJobRefers) {
        const lastJobReferProductIds = (lastJobRefer.resultProducts || []).map(
          last => last.productId
        );

        justLastJobRefer = lastJobReferProductIds.includes(
          checkResult.productId
        )
          ? lastJobRefer
          : ({} as IJobRefer);
      }

      const justLastFlowJob: IJob | undefined = Object.keys(justLastJobRefer)
        .length
        ? lastFlowJobs.find(last => last.jobReferId === justLastJobRefer._id)
        : undefined;

      doubleCheckResult = this.recursiveFlowJobChecker(
        flowJobs,
        jobRefers,
        justLastFlowJob || ({} as IJob)
      );

      console.log('doubleCheckResult boolean: ' + doubleCheckResult);

      this.setState({
        lastFlowJob: justLastFlowJob,
        flowStatus: doubleCheckResult ? true : false
      });
    } else {
      this.setState({
        lastFlowJob: undefined,
        flowStatus: doubleCheckResult ? true : false
      });
    }
  };

  recursiveFlowJobChecker = (
    flowJobs: IJob[],
    jobRefers: IJobRefer[],
    lastFlowJob: IJob
  ) => {
    const lastJobRefer = jobRefers.find(
      jr => jr._id === (lastFlowJob.jobReferId || '')
    );
    const boforeFlowJobs = flowJobs.filter(fj =>
      (fj.nextJobIds || []).includes(lastFlowJob.id)
    );

    let response = true;

    console.log(
      ' ---------------------- ' +
        lastJobRefer?.name +
        ' ------------------------'
    );

    const lastNeedProducts = lastJobRefer?.needProducts;

    if (boforeFlowJobs.length === 0 && (lastNeedProducts || []).length > 0) {
      console.log('false1 ' + lastJobRefer?.name);
      response = false;
    }

    let productIds: string[] = [];
    for (const beforeFlowJob of boforeFlowJobs) {
      const beforeJobRefer = jobRefers.find(
        jr => jr._id === (beforeFlowJob.jobReferId || '')
      );
      const resultProducts = beforeJobRefer?.resultProducts;
      const ids = resultProducts?.map(rp => rp.productId);

      productIds =
        productIds.length === 0 ? ids || [] : productIds.concat(ids || []);
    }

    console.log(lastJobRefer?.name + ' beforeProductIds: ' + productIds);

    for (const lastNeedProduct of lastNeedProducts || []) {
      if (!productIds.includes(lastNeedProduct.productId)) {
        console.log('false2 ' + lastJobRefer?.name);
        response = false;
      }
    }

    if (response) {
      for (const beforeFlowJob of boforeFlowJobs) {
        response = this.recursiveFlowJobChecker(
          flowJobs,
          jobRefers,
          beforeFlowJob
        );
        if (response) {
          continue;
        } else {
          break;
        }
      }
    }

    console.log('false3 ' + lastJobRefer?.name + ' boolean: ' + response);
    return response;
  };

  setWrapperRef = node => {
    this.wrapperRef = node;
  };

  componentDidMount() {
    this.connectInstance();
    this.findLastFlowJob();
    document.addEventListener('click', this.handleClickOutside, true);
  }

  componentDidUpdate(_prevState) {
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

    const { flowJobs } = this.state;

    instance.bind('ready', () => {
      instance.bind('connection', info => {
        this.onConnection(info);
      });

      instance.bind('connectionDetached', info => {
        this.onDettachConnection(info);
      });

      for (const flowJob of flowJobs) {
        this.renderControl('flowJob', flowJob, this.onClickFlowJob);
      }

      // create connections ===================
      createInitialConnections(flowJobs, instance);

      // delete connections ===================
      deleteConnection(instance);
    });

    // hover flowJob control ===================
    jquery('#canvas .control').hover(event => {
      event.preventDefault();

      jquery(`div#${event.currentTarget.id}`).toggleClass('show-flowJob-menu');

      this.setState({ activeId: event.currentTarget.id });
    });

    // delete control ===================
    jquery('#canvas').on('click', '.delete-control', event => {
      event.preventDefault();

      const innerFlowJobs = this.state.flowJobs;
      const item = event.currentTarget.id;
      const splitItem = item.split('-');
      const type = splitItem[0];

      instance.remove(item);

      const leftFlowJobs = innerFlowJobs.filter(
        flowJob => flowJob.id !== splitItem[1]
      );

      this.findLastFlowJob(leftFlowJobs);

      if (type === 'flowJob') {
        return this.setState({
          flowJobs: leftFlowJobs
        });
      }
    });
  };

  handleSubmit = () => {
    const { name, isActive, flowJobs, productId, flowStatus } = this.state;
    const { flow, save } = this.props;

    if (!name || name === 'Your flow title') {
      return Alert.error('Please choose flow product');
    }

    const generateValues = () => {
      const finalValues = {
        _id: flow._id || '',
        name,
        status: isActive ? 'active' : 'draft',
        productId,
        flowJobStatus: flowStatus,
        jobs: flowJobs.map(a => ({
          id: a.id,
          nextJobIds: a.nextJobIds,
          jobReferId: a.jobReferId,
          label: a.label,
          description: a.description,
          inBranchId: a.inBranchId,
          inDepartmentId: a.inDepartmentId,
          outBranchId: a.outBranchId,
          outDepartmentId: a.outDepartmentId,
          style: jquery(`#flowJob-${a.id}`).attr('style')
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

  onClickFlowJob = (flowJob: IJob) => {
    this.setState({
      showFlowJob: true,
      showDrawer: true,
      currentTab: 'flowJobs',
      activeFlowJob: flowJob ? flowJob : ({} as IJob)
    });
  };

  onConnection = info => {
    const { flowJobs } = this.state;

    this.setState({
      flowJobs: connection(
        flowJobs,
        info,
        info.targetId.replace('flowJob-', ''),
        'connect',
        this.findLastFlowJob
      )
    });

    const sourceFlowJob = flowJobs.find(
      a => a.id.toString() === info.sourceId.replace('flowJob-', '')
    );

    const idElm = 'flowJob-' + (sourceFlowJob || {}).id;
    instance.addEndpoint(idElm, sourceEndpoint, {
      anchor: ['Right']
    });
    instance.draggable(instance.getSelector(`#${idElm}`));
  };

  onDettachConnection = info => {
    const { flowJobs } = this.state;

    this.setState({
      flowJobs: connection(
        flowJobs,
        info,
        info.targetId.replace('flowJob-', ''),
        'disconnect',
        this.findLastFlowJob
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
    if (this.wrapperRef && !this.wrapperRef.contains(event.target)) {
      this.setState({ showDrawer: false });
    }
  };

  toggleDrawer = (type: string) => {
    this.setState({
      showDrawer: !this.state.showDrawer,
      currentTab: type,
      activeFlowJob: {} as IJob
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

  addFlowJob = (
    data?: IJob,
    flowJobId?: string,
    jobReferId?: string,
    description?: string,
    inBranchId?: string,
    inDepartmentId?: string,
    outBranchId?: string,
    outDepartmentId?: string
  ) => {
    const { flowJobs } = this.state;
    const { jobRefers } = this.props;

    let flowJob: IJob = {
      ...(data || {}),
      id: this.getNewId(flowJobs.map(a => a.id))
    };
    let flowJobIndex = -1;

    if (flowJobId) {
      flowJobIndex = flowJobs.findIndex(a => a.id === flowJobId);

      if (flowJobIndex !== -1) {
        flowJob = flowJobs[flowJobIndex];
      }
    }

    flowJob.jobReferId = jobReferId || '';
    flowJob.inBranchId = inBranchId || '';
    flowJob.inDepartmentId = inDepartmentId || '';
    flowJob.outBranchId = outBranchId || '';
    flowJob.outDepartmentId = outDepartmentId || '';

    const jobRefer: IJobRefer =
      jobRefers.find(j => j._id === jobReferId) || ({} as IJobRefer);

    flowJob.label = jobRefer.name;
    flowJob.description = description || jobRefer.name;

    if (flowJobIndex !== -1) {
      flowJobs[flowJobIndex] = flowJob;
    } else {
      flowJobs.push(flowJob);
    }

    this.setState(
      { flowJobs, activeFlowJob: flowJob, flowJobEdited: true },
      () => {
        if (!flowJobId) {
          this.renderControl('flowJob', flowJob, this.onClickFlowJob);
        }
      }
    );

    this.findLastFlowJob();
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

    if (key === 'flowJob') {
      instance.addEndpoint(idElm, targetEndpoint, {
        anchor: ['Left']
      });

      instance.addEndpoint(idElm, sourceEndpoint, {
        anchor: ['Right']
      });

      instance.draggable(instance.getSelector(`#${idElm}`));
    }
  };

  renderButtons() {
    return (
      <>
        <Button
          btnStyle="primary"
          size="small"
          icon="plus-circle"
          onClick={this.toggleDrawer.bind(this, 'flowJobs')}
        >
          Add a Job
        </Button>
      </>
    );
  }

  renderLabelInfo = (style, text) => {
    return <Label lblStyle={style}>{text}</Label>;
  };

  rendeRightFlowJobBar() {
    const { isActive } = this.state;

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
        <FlowJobBarButtonsWrapper>
          {this.renderButtons()}
          <Button
            btnStyle="success"
            size="small"
            icon={'check-circle'}
            onClick={this.handleSubmit}
          >
            {__('Save')}
          </Button>
        </FlowJobBarButtonsWrapper>
      </BarItems>
    );
  }

  renderLeftFlowJobBar() {
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

  onBackFlowJob = () => this.setState({ showFlowJob: false });

  onSave = () => {
    const { activeFlowJob } = this.state;

    this.addFlowJob(activeFlowJob);

    this.onBackFlowJob();
  };

  renderTabContent() {
    const {
      currentTab,
      showFlowJob,
      activeFlowJob,
      product,
      lastFlowJob
    } = this.state;

    const { jobRefers } = this.props;

    if (currentTab === 'flowJobs') {
      const { flowJobs } = this.state;

      if (showFlowJob && activeFlowJob) {
        const checkArray = Object.keys(activeFlowJob);
        let checkedActiveFlowJob = activeFlowJob;
        if (!checkArray.includes('nextJobIds')) {
          checkedActiveFlowJob = { ...activeFlowJob, nextJobIds: [] };
        }

        return (
          <>
            <NewJobForm
              activeFlowJob={checkedActiveFlowJob}
              addFlowJob={this.addFlowJob}
              closeModal={this.onBackFlowJob}
              jobRefers={jobRefers}
              flowJobs={flowJobs}
              onSave={this.onSave}
              lastFlowJob={lastFlowJob}
              flowProduct={product}
            />
          </>
        );
      }

      return <FlowJobsForm onClickFlowJob={this.onClickFlowJob} />;
    }

    return null;
  }

  renderZoomFlowJobs() {
    return (
      <ZoomFlowJobs>
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
      </ZoomFlowJobs>
    );
  }

  renderContent() {
    const { flowJobs } = this.state;

    if (flowJobs.length === 0) {
      return (
        <Container>
          <div
            className="trigger scratch"
            onClick={this.toggleDrawer.bind(this, 'flowJobs')}
          >
            <Icon icon="file-plus" size={25} />
            <p>{__('Please add first job')}?</p>
          </div>
        </Container>
      );
    }

    return (
      <Container>
        {this.renderZoomFlowJobs()}
        <div id="canvas" />
      </Container>
    );
  }

  renderConfirmation() {
    const { id, queryParams, history, saveLoading, flow } = this.props;
    const { flowJobs, name } = this.state;

    if (saveLoading) {
      return null;
    }

    const when = queryParams.isCreate
      ? !!id
      : JSON.stringify(flowJobs) !== JSON.stringify([]) ||
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
          <FlowFormContainer>
            <Wrapper.Header
              title={`${(flow && flow.name) || 'Flow detail'}`}
              breadcrumb={[
                { title: __('Flows'), link: '/processes/Flows' },
                { title: `${(flow && flow.name) || 'New Form'}` }
              ]}
            />
            <PageContent
              flowJobBar={
                <Wrapper.FlowJobBar
                  left={this.renderLeftFlowJobBar()}
                  right={this.rendeRightFlowJobBar()}
                />
              }
              transparent={false}
            >
              {this.renderContent()}
            </PageContent>
          </FlowFormContainer>

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
