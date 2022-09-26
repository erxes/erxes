import Common from '../Common';
import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import Info from '@erxes/ui/src/components/Info';
import Label from '@erxes/ui/src/components/Label';
import React from 'react';
import SelectBranches from '@erxes/ui/src/team/containers/SelectBranches';
import SelectDepartments from '@erxes/ui/src/team/containers/SelectDepartments';
import { __ } from '@erxes/ui/src/utils';
import { ControlLabel } from '@erxes/ui/src/components/form';
import { DrawerDetail, FlowJobTabs } from '../../../../styles';
import { FormColumn, FormWrapper } from '@erxes/ui/src/styles/main';
import { IJob } from '../../../../types';
import { IJobRefer } from '../../../../../job/types';
import { IProduct } from '@erxes/ui-products/src/types';
import { Tabs, TabTitle } from '@erxes/ui/src/components/tabs';

type Props = {
  closeModal: () => void;
  // onSave: () => void;s
  activeFlowJob: IJob;
  jobRefers: IJobRefer[];
  flowJobs: IJob[];
  lastFlowJob?: IJob;
  flowProduct?: IProduct;
  addFlowJob: (job: IJob, id?: string, config?: any) => void;
};

type State = {
  jobReferId: string;
  description: string;
  inBranchId: string;
  inDepartmentId: string;
  outBranchId: string;
  outDepartmentId: string;
  currentTab: string;
};

class JobForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const { config, description } = this.props.activeFlowJob || {};

    const {
      jobReferId,
      inBranchId,
      inDepartmentId,
      outBranchId,
      outDepartmentId
    } = config;

    this.state = {
      jobReferId: jobReferId || '',
      description: description || '',
      inBranchId: inBranchId || '',
      inDepartmentId: inDepartmentId || '',
      outBranchId: outBranchId || '',
      outDepartmentId: outDepartmentId || '',
      currentTab: 'inputs'
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.activeFlowJob !== this.props.activeFlowJob) {
      this.setState({ jobReferId: nextProps.activeFlowJob.jobReferId });
    }
  }

  tabOnClick = (currentTab: string) => {
    this.setState({ currentTab });
  };

  onSelect = (name, value) => {
    this.setState({ [name]: value } as any);
  };

  renderLabelInfo = (style, text) => {
    return <Label lblStyle={style}>{text}</Label>;
  };

  renderProducts = (products, type, matchProducts?: any[], flowProduct?) => {
    const space = '\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0';

    return products.map(product => {
      const name = product.product ? product.product.name : '';

      let matchResult: any[] | boolean | undefined =
        matchProducts && matchProducts.length > 0
          ? matchProducts.includes(name)
          : matchProducts;

      if (flowProduct) {
        matchResult = flowProduct && flowProduct.name === name ? true : false;
      }

      return (
        <>
          <FormGroup>
            <ControlLabel key={product.id}>
              {space} - {matchResult === undefined && name}
              {matchResult === true && name}
              {matchResult === false && this.renderLabelInfo('danger', name)}
            </ControlLabel>
          </FormGroup>
        </>
      );
    });
  };

  renderFlowJobs = (
    chosenFlowJobs: IJob[],
    jobRefers,
    type,
    beforeFlowJobs: IJob[]
  ) => {
    let beforeResultProducts: any = [];
    if (beforeFlowJobs.length > 0) {
      for (const before of beforeFlowJobs) {
        const jobRefer = jobRefers.find(
          job => job._id === before.config.jobReferId
        );
        const resultProducts = jobRefer.resultProducts || [];

        const productNames = resultProducts.map(e =>
          e.product ? e.product.name : ''
        );

        beforeResultProducts = beforeResultProducts.concat(productNames);
      }
    }

    return chosenFlowJobs.map(flowJob => {
      if (!flowJob.config.jobReferId) {
        return [];
      }

      const jobRefer = jobRefers.find(
        job => job._id === flowJob.config.jobReferId
      );
      const needProducts = jobRefer.needProducts || [];
      const resultProducts = jobRefer.resultProducts || [];

      beforeResultProducts =
        beforeResultProducts.length === 0 ? false : beforeResultProducts;

      return (
        <>
          {type !== 'last' && (
            <Info type="primary" title="">
              <FormGroup>
                <ControlLabel key={flowJob.id}>{flowJob.label}</ControlLabel>
              </FormGroup>
              {type === 'next' && this.renderProducts(needProducts, 'need')}
              {type === 'prev' && this.renderProducts(resultProducts, 'result')}
              {type === 'cur' &&
                this.renderProducts(needProducts, 'need', beforeResultProducts)}
            </Info>
          )}

          {type === 'last' && flowJob === this.props.lastFlowJob && (
            <Info type="primary" title="Статус">
              {type === 'last' &&
                this.renderProducts(
                  resultProducts,
                  'result',
                  undefined,
                  this.props.flowProduct
                )}
            </Info>
          )}
        </>
      );
    });
  };

  renderList(title, products, type) {
    return (
      <Info type="success" title={title}>
        {this.renderProducts(products, type)}
      </Info>
    );
  }

  renderContent() {
    const { jobRefers, activeFlowJob, flowJobs } = this.props;
    const activeFlowJobId =
      activeFlowJob && activeFlowJob.id ? activeFlowJob.id : '';
    const beforeFlowJobs = flowJobs.filter(e =>
      (e.nextJobIds || []).includes(activeFlowJobId)
    );
    const onChangeValue = (type, e) => {
      this.setState({ [type]: e.target.value } as any);
    };

    const findJobRefer = jobRefers.find(
      job => job._id === (activeFlowJob || {}).config.jobReferId
    );
    const needProducts = (findJobRefer || {}).needProducts || [];
    const resultProducts = (findJobRefer || {}).resultProducts || [];

    const {
      currentTab,
      jobReferId,
      description,
      inBranchId,
      inDepartmentId,
      outBranchId,
      outDepartmentId
    } = this.state;

    return (
      <DrawerDetail>
        <FormGroup>
          <ControlLabel>Jobs</ControlLabel>
          <FormControl
            name="type"
            componentClass="select"
            onChange={onChangeValue.bind(this, 'jobReferId')}
            required={true}
            value={jobReferId}
          >
            <option value="" />
            {jobRefers.map(jobRefer => (
              <option key={jobRefer._id} value={jobRefer._id}>
                {jobRefer.name}
              </option>
            ))}
          </FormControl>
        </FormGroup>
        <FormGroup>
          <ControlLabel>Description</ControlLabel>
          <FormControl
            name="description"
            value={description}
            onChange={onChangeValue.bind(this, 'description')}
          />
        </FormGroup>

        <Info type="success" title="">
          {activeFlowJob &&
            this.renderFlowJobs(
              [activeFlowJob],
              jobRefers,
              'last',
              beforeFlowJobs
            )}
        </Info>

        <FlowJobTabs>
          <Tabs full={true}>
            <TabTitle
              className={currentTab === 'inputs' ? 'active' : ''}
              onClick={this.tabOnClick.bind(this, 'inputs')}
            >
              {__('Inputs')}
            </TabTitle>
            <TabTitle
              className={currentTab === 'status' ? 'active' : ''}
              onClick={this.tabOnClick.bind(this, 'status')}
            >
              {__('Statuses')}
            </TabTitle>
          </Tabs>
        </FlowJobTabs>

        {currentTab === 'status' && (
          <FormWrapper>
            <FormColumn>
              <Info type="primary" title="Өмнөх жоб бүтээгдэхүүнүүд">
                {this.renderFlowJobs(beforeFlowJobs, jobRefers, 'prev', [])}
              </Info>
            </FormColumn>

            <FormColumn>
              <Info type="success" title="Шаардлагатай бүтээгдэхүүнүүд">
                {activeFlowJob &&
                  this.renderFlowJobs(
                    [activeFlowJob],
                    jobRefers,
                    'cur',
                    beforeFlowJobs
                  )}
              </Info>
            </FormColumn>

            {/*
          If you want to show next Job report on jobForm
          when double click job instance ,
          please uncomment below.
          */}

            {/* {activeFlowJob.label === this.props.lastFlowJobId &&
            <FormColumn>
              <Info type="info" title={this.props.lastFlowJobId}>
                {this.renderFlowJobs(afterFlowJobs, jobRefers, 'next', [])}
              </Info>
            </FormColumn>
          } */}
          </FormWrapper>
        )}

        {currentTab === 'inputs' && (
          <>
            <FormWrapper>
              <FormColumn>
                <FormGroup>
                  <ControlLabel>inBranch</ControlLabel>
                  <SelectBranches
                    label="Choose branch"
                    name="selectedBranchIds"
                    initialValue={inBranchId}
                    onSelect={branchId => this.onSelect('inBranchId', branchId)}
                    multi={false}
                    customOption={{ value: 'all', label: 'All branches' }}
                  />
                </FormGroup>
              </FormColumn>
              <FormColumn>
                <FormGroup>
                  <ControlLabel>inDepartment</ControlLabel>
                  <SelectDepartments
                    label="Choose department"
                    name="selectedDepartmentIds"
                    initialValue={inDepartmentId}
                    onSelect={departmentId =>
                      this.onSelect('inDepartmentId', departmentId)
                    }
                    multi={false}
                    customOption={{ value: 'all', label: 'All departments' }}
                  />
                </FormGroup>
              </FormColumn>
            </FormWrapper>

            {this.renderList('In products', needProducts, 'need')}

            <FormWrapper>
              <FormColumn>
                <FormGroup>
                  <ControlLabel>outBranch</ControlLabel>
                  <SelectBranches
                    label="Choose branch"
                    name="selectedBranchIds"
                    initialValue={outBranchId}
                    onSelect={branchId =>
                      this.onSelect('outBranchId', branchId)
                    }
                    multi={false}
                    customOption={{ value: 'all', label: 'All branches' }}
                  />
                </FormGroup>
              </FormColumn>
              <FormColumn>
                <FormGroup>
                  <ControlLabel>outDepartment</ControlLabel>
                  <SelectDepartments
                    label="Choose department"
                    name="selectedDepartmentIds"
                    initialValue={outDepartmentId}
                    onSelect={departmentId =>
                      this.onSelect('outDepartmentId', departmentId)
                    }
                    multi={false}
                    customOption={{ value: 'all', label: 'All departments' }}
                  />
                </FormGroup>
              </FormColumn>
            </FormWrapper>
            {this.renderList('Out products', resultProducts, 'result')}
          </>
        )}
      </DrawerDetail>
    );
  }

  render() {
    const {
      jobReferId,
      description,
      inBranchId,
      inDepartmentId,
      outBranchId,
      outDepartmentId
    } = this.state;

    return (
      <Common
        description={description}
        config={{
          jobReferId,
          inBranchId,
          inDepartmentId,
          outBranchId,
          outDepartmentId
        }}
        {...this.props}
      >
        {this.renderContent()}
      </Common>
    );
  }
}

export default JobForm;
