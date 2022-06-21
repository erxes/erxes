// import { __ } from '@erxes/ui/src/utils';

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
import { DrawerDetail } from '../../../styles';
import Common from './Common';
import SelectBranches from '@erxes/ui/src/team/containers/SelectBranches';
import SelectDepartments from '@erxes/ui/src/team/containers/SelectDepartments';

type Props = {
  closeModal: () => void;
  onSave: () => void;
  activeAction?: IJob;
  jobRefers: IJobRefer[];
  actions: IJob[];
  lastAction: IJob;
  flowProduct: IProduct;
  addAction: (
    action: IJob,
    actionId?: string,
    jobReferId?: string,
    branchId?: string,
    departmentId?: string
  ) => void;
};

type State = {
  jobReferId: string;
  description: string;
  branchId: string;
  departmentId: string;
};

class Delay extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const {
      jobReferId,
      description,
      branchId,
      departmentId
    } = this.props.activeAction;

    this.state = {
      jobReferId: jobReferId ? jobReferId : '',
      description: description ? description : '',
      branchId: branchId ? branchId : '',
      departmentId: departmentId ? departmentId : ''
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.activeAction !== this.props.activeAction) {
      this.setState({ jobReferId: nextProps.activeAction.jobReferId });
    }
  }

  onSelect = (name, value) => {
    this.setState({ [name]: value } as any);
  };

  renderLabelInfo = (style, text) => {
    return <Label lblStyle={style}>{text}</Label>;
  };

  renderProducts = (
    products,
    type,
    matchProducts = undefined,
    flowProduct = undefined
  ) => {
    const style = type === 'need' ? 'simple' : 'default';
    const space = '\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0';

    return products.map(product => {
      const name = product.product.name;
      let matchResult = matchProducts
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
          <Info type="primary" title="">
            <FormGroup>
              <ControlLabel key={action.id}>{action.label}</ControlLabel>
            </FormGroup>
            {type === 'next' && this.renderProducts(needProducts, 'need')}
            {type === 'prev' && this.renderProducts(resultProducts, 'result')}
            {type === 'cur' &&
              this.renderProducts(needProducts, 'need', beforeResultProducts)}
          </Info>

          {type === 'cur' && action === this.props.lastAction && (
            <Info type="primary" title="Last check">
              {type === 'cur' &&
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

  renderContent() {
    const { jobRefers, actions, activeAction } = this.props;
    const activeActionId =
      activeAction && activeAction.id ? activeAction.id : '';
    const beforeActions = actions.filter(e =>
      e.nextJobIds.includes(activeActionId)
    );
    const onChangeValue = (type, e) => {
      this.setState({ [type]: e.target.value } as any);
    };

    return (
      <DrawerDetail>
        <FormGroup>
          <ControlLabel>Job</ControlLabel>
          <FormControl
            name="type"
            componentClass="select"
            onChange={onChangeValue.bind(this, 'jobReferId')}
            required={true}
            value={this.state.jobReferId}
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
            value={this.state.description}
            onChange={onChangeValue.bind(this, 'description')}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Branch</ControlLabel>
          <SelectBranches
            label="Choose branch"
            name="selectedBranchIds"
            initialValue={this.state.branchId}
            onSelect={branchId => this.onSelect('branchId', branchId)}
            multi={false}
            customOption={{ value: 'all', label: 'All branches' }}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>Department</ControlLabel>
          <SelectDepartments
            label="Choose department"
            name="selectedDepartmentIds"
            initialValue={this.state.departmentId}
            onSelect={departmentId =>
              this.onSelect('departmentId', departmentId)
            }
            multi={false}
            customOption={{ value: 'all', label: 'All departments' }}
          />
        </FormGroup>

        <FormWrapper>
          <FormColumn>
            <Info type="primary" title="Result products">
              {this.renderActions(beforeActions, jobRefers, 'prev', [])}
            </Info>
          </FormColumn>

          <FormColumn>
            <Info type="success" title="Need products">
              {this.renderActions(
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
      </DrawerDetail>
    );
  }

  render() {
    const { jobReferId, description, branchId, departmentId } = this.state;

    return (
      <Common
        jobReferId={jobReferId}
        description={description}
        branchId={branchId}
        departmentId={departmentId}
        {...this.props}
      >
        {this.renderContent()}
      </Common>
    );
  }
}

export default Delay;
