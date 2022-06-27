import React from 'react';
import { IProduct } from '@erxes/ui-products/src/types';
import { ControlLabel } from '@erxes/ui/src/components/form';
import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import Info from '@erxes/ui/src/components/Info';
import Label from '@erxes/ui/src/components/Label';
import { FormColumn, FormWrapper } from '@erxes/ui/src/styles/main';

import { IJob } from '../../../../flow/types';
import { IJobRefer } from '../../../../job/types';
import { DrawerDetail, ActionTabs } from '../../../styles';
import Common from './Common';
import SelectBranches from '@erxes/ui/src/team/containers/SelectBranches';
import SelectDepartments from '@erxes/ui/src/team/containers/SelectDepartments';
import { Tabs, TabTitle } from '@erxes/ui/src/components/tabs';
import { __ } from '@erxes/ui/src/utils';

type Props = {
  closeModal: () => void;
  onSave: () => void;
  activeAction?: IJob;
  jobRefers: IJobRefer[];
  actions: IJob[];
  lastAction?: IJob;
  flowProduct?: IProduct;
  addAction: (
    action: IJob,
    actionId?: string,
    jobReferId?: string,
    inBranchId?: string,
    inDepartmentId?: string,
    outBranchId?: string,
    outDepartmentId?: string
  ) => void;
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

class Delay extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const {
      jobReferId,
      description,
      inBranchId,
      inDepartmentId,
      outBranchId,
      outDepartmentId
    } = this.props.activeAction || {};

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
    if (nextProps.activeAction !== this.props.activeAction) {
      this.setState({ jobReferId: nextProps.activeAction.jobReferId });
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
      const name = product.product.name;
      let matchResult =
        matchProducts && matchProducts.length
          ? matchProducts.includes(name)
          : matchProducts;

      if (flowProduct) {
        matchResult = flowProduct && flowProduct.name === name ? true : false;
      }

      return (
        <>
          <FormGroup>
            <ControlLabel key={product.id}>
              {space} -{matchResult === undefined && name}
              {matchResult === true && name}
              {matchResult === false && this.renderLabelInfo('danger', name)}
              {/* {this.renderLabelInfo(style, type)} */}
            </ControlLabel>
          </FormGroup>
        </>
      );
    });
  };

  renderActions = (
    chosenActions: IJob[],
    jobRefers,
    type,
    beforeActions: IJob[]
  ) => {
    let beforeResultProducts = [];
    if (beforeActions.length > 0) {
      for (const before of beforeActions) {
        const jobRefer = jobRefers.find(job => job._id === before.jobReferId);
        const resultProducts = jobRefer.resultProducts || [];
        const productNames = resultProducts.map(e => e.product.name);

        beforeResultProducts = beforeResultProducts.concat(productNames);
      }
    }

    if (type === 'cur') {
      console.log('current last product:', this.props.lastAction);
    }

    return chosenActions.map(action => {
      if (!action.jobReferId) {
        return [];
      }

      const jobRefer = jobRefers.find(job => job._id === action.jobReferId);
      const needProducts = jobRefer.needProducts || [];
      const resultProducts = jobRefer.resultProducts || [];

      return (
        <>
          {type !== 'last' && (
            <Info type="primary" title="">
              <FormGroup>
                <ControlLabel key={action.id}>{action.label}</ControlLabel>
              </FormGroup>
              {type === 'next' && this.renderProducts(needProducts, 'need')}
              {type === 'prev' && this.renderProducts(resultProducts, 'result')}
              {type === 'cur' &&
                this.renderProducts(needProducts, 'need', beforeResultProducts)}
            </Info>
          )}

          {type === 'last' && action === this.props.lastAction && (
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
    const { jobRefers, actions, activeAction } = this.props;
    const activeActionId =
      activeAction && activeAction.id ? activeAction.id : '';
    const beforeActions = actions.filter(e =>
      (e.nextJobIds || []).includes(activeActionId)
    );
    const onChangeValue = (type, e) => {
      this.setState({ [type]: e.target.value } as any);
    };

    const findJobRefer = jobRefers.find(
      job => job._id === (activeAction || {}).jobReferId
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
          {activeAction &&
            this.renderActions(
              [activeAction],
              jobRefers,
              'last',
              beforeActions
            )}
        </Info>

        <ActionTabs>
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
        </ActionTabs>

        {currentTab === 'status' && (
          <FormWrapper>
            <FormColumn>
              <Info type="primary" title="Өмнөх жоб бүтээгдэхүүнүүд">
                {this.renderActions(beforeActions, jobRefers, 'prev', [])}
              </Info>
            </FormColumn>

            <FormColumn>
              <Info type="success" title="Шаардлагатай бүтээгдэхүүнүүд">
                {activeAction &&
                  this.renderActions(
                    [activeAction],
                    jobRefers,
                    'cur',
                    beforeActions
                  )}
              </Info>
            </FormColumn>

            {/*
          If you want to show next Job report on jobForm
          when double click job instance ,
          please uncomment below.
          */}

            {/* {activeAction.label === this.props.lastActionId &&
            <FormColumn>
              <Info type="info" title={this.props.lastActionId}>
                {this.renderActions(afterActions, jobRefers, 'next', [])}
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
        jobReferId={jobReferId}
        description={description}
        inBranchId={inBranchId}
        inDepartmentId={inDepartmentId}
        outBranchId={outBranchId}
        outDepartmentId={outDepartmentId}
        {...this.props}
      >
        {this.renderContent()}
      </Common>
    );
  }
}

export default Delay;
