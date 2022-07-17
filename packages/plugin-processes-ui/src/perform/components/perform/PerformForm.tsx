import React from 'react';

import Button from '@erxes/ui/src/components/Button';
import FormControl from '@erxes/ui/src/components/form/Control';
import CommonForm from '@erxes/ui/src/components/form/Form';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import {
  FormColumn,
  FormWrapper,
  ModalFooter
} from '@erxes/ui/src/styles/main';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';

import { IJobRefer } from '../../../job/types';
import { IOverallWorkDocument } from '../../types';
import {
  FieldStyle,
  SidebarCounter,
  SidebarList
} from '@erxes/ui/src/layout/styles';
import { __ } from '@erxes/ui/src/utils';
import Box from '@erxes/ui/src/components/Box';
import { IFlowDocument } from '../../../flow/types';
import { calculateCount } from './common';

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
  overallWorkDetail?: IOverallWorkDocument;
  max: number;
  jobRefers: IJobRefer[];
  flows: IFlowDocument[];
};

type State = {
  count: number;
  results: any[];
  needProducts?: any[];
  resultProducts?: any[];
  jobRefer?: IJobRefer;
};

class Form extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const { overallWorkDetail, jobRefers, flows } = this.props;
    const resultProductsDetail = overallWorkDetail?.resultProductsDetail;

    const calculatedObject = calculateCount(
      jobRefers || [],
      flows || [],
      overallWorkDetail,
      'on perform component'
    );
    const { jobRefer } = calculatedObject;

    console.log('on constructor:', calculatedObject.jobRefer);

    this.state = {
      count: 1,
      results: (resultProductsDetail || []).map(e => ({
        product: e.product,
        quantity: e.quantity,
        uom: e.uom
      })),
      needProducts: jobRefer?.needProducts || [],
      resultProducts: jobRefer?.resultProducts || [],
      jobRefer
    };
  }

  renderView = (name: string, variable: string) => {
    const defaultName = '-';

    return (
      <li>
        <FieldStyle>{__(name)}</FieldStyle>
        <SidebarCounter>{variable || defaultName}</SidebarCounter>
      </li>
    );
  };

  renderProducts = (name: string, products: any[], realDatas: any[]) => {
    const result: React.ReactNode[] = [];

    result.push(
      <li>
        <FieldStyle>{__(name)}</FieldStyle>
        <SidebarCounter>{(products || []).length}</SidebarCounter>
      </li>
    );

    for (const product of products) {
      const { uom } = product;
      const productName = product.product ? product.product.name : 'not name';
      const uomCode = uom ? uom.code : 'not uom';
      const realData = realDatas.find(rd => rd._id === product._id);
      const quantity = realData ? realData.quantity : 0;

      result.push(this.renderView(productName, quantity + '/' + uomCode + '/'));
    }

    return result;
  };

  renderDetailNeed() {
    const { overallWorkDetail } = this.props;
    const { needProducts } = this.state;
    const needProductsDetail = overallWorkDetail?.needProductsDetail;

    return (
      <SidebarList className="no-link">
        {this.renderProducts(
          'NeedProducts',
          needProductsDetail || [],
          needProducts || []
        )}
      </SidebarList>
    );
  }

  renderDetailResult() {
    const { overallWorkDetail } = this.props;
    const { resultProducts } = this.state;
    const resultProductsDetail = overallWorkDetail?.resultProductsDetail;

    return (
      <SidebarList className="no-link">
        {this.renderProducts(
          'ResultProducts',
          resultProductsDetail || [],
          resultProducts || []
        )}
      </SidebarList>
    );
  }

  onChange = e => {
    const count = Number(e.target.value);
    const { jobRefer } = this.state;
    const { needProducts, resultProducts } = this.state;

    console.log('on onChange:', jobRefer);

    for (const need of jobRefer?.needProducts || []) {
      const currentNeed = needProducts?.find(n => n._id === need._id);

      const { quantity } = need;
      currentNeed.quantity = quantity * count;
    }

    for (const result of jobRefer?.resultProducts || []) {
      const currentResult = resultProducts?.find(n => n._id === result._id);

      const { quantity } = result;
      currentResult.quantity = quantity * count;
    }

    this.setState({
      count,
      needProducts,
      resultProducts
    });
  };

  renderLabel = (max: number) => {
    return max > 0 ? `Count /max: ${max}/` : `Count`;
  };

  renderContent = (formProps: IFormProps) => {
    const { closeModal, renderButton, max } = this.props;
    const { isSubmitted } = formProps;
    const { count, needProducts, resultProducts } = this.state;

    return (
      <>
        <FormGroup>
          <ControlLabel required={true}>{this.renderLabel(max)}</ControlLabel>
          <FormControl
            name="count"
            defaultValue={this.state.count}
            type="number"
            autoFocus={true}
            required={true}
            onChange={this.onChange}
          />
        </FormGroup>

        <ModalFooter>
          <Button
            btnStyle="simple"
            onClick={closeModal}
            icon="times-circle"
            uppercase={false}
          >
            Close
          </Button>

          {renderButton({
            name: 'Performance',
            values: {
              count,
              performNeedProducts: needProducts,
              performResultProducts: resultProducts
            },
            isSubmitted,
            callback: closeModal,
            object: null
          })}
        </ModalFooter>

        <Box title={'Counting result view:'}>
          <FormWrapper>
            <FormColumn>{this.renderDetailNeed()}</FormColumn>
            <FormColumn>{this.renderDetailResult()}</FormColumn>
          </FormWrapper>
        </Box>
      </>
    );
  };

  render() {
    return <CommonForm renderContent={this.renderContent} />;
  }
}

export default Form;
