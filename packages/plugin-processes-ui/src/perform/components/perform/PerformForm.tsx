import Box from '@erxes/ui/src/components/Box';
import Button from '@erxes/ui/src/components/Button';
import CommonForm from '@erxes/ui/src/components/form/Form';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import React from 'react';
import { __ } from '@erxes/ui/src/utils';
import { calculateCount } from './common';
import {
  FieldStyle,
  SidebarCounter,
  SidebarList
} from '@erxes/ui/src/layout/styles';
import {
  FormColumn,
  FormWrapper,
  ModalFooter,
  DateContainer
} from '@erxes/ui/src/styles/main';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import { IOverallWorkDet } from '../../../overallWork/types';
import { IProductsData } from '../../../types';
import DateControl from '@erxes/ui/src/components/form/DateControl';
import moment from 'moment';
import SelectBranches from '@erxes/ui/src/team/containers/SelectBranches';
import SelectDepartments from '@erxes/ui/src/team/containers/SelectDepartments';
import { JOB_TYPE_CHOISES } from '../../../constants';

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
  overallWorkDetail?: IOverallWorkDet;
  max?: number;
};

type State = {
  // jobReferId: string;
  type: string;
  // typeId: string;
  // productIds: string;
  count: number;
  date: Date;
  needProducts: IProductsData[];
  resultProducts: IProductsData[];
  inBranchId: string;
  inDepartmentId: string;
  outBranchId: string;
  outDepartmentId: string;
};

// type State = {
//   count: number;
//   results: any[];
//   needProducts?: any[];
//   resultProducts?: any[];
//   jobRefer?: IJobRefer;
// };

class Form extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const { overallWorkDetail } = this.props;

    // const calculatedObject = calculateCount(
    //   jobRefers || [],
    //   flows || [],
    //   overallWorkDetail
    // );
    // const { jobRefer } = calculatedObject;

    this.state = {
      date: new Date(),
      count: 1,
      type: overallWorkDetail?.key.type || '',
      needProducts: overallWorkDetail?.needProducts || [],
      resultProducts: overallWorkDetail?.resultProducts || [],
      inBranchId: overallWorkDetail?.key.inBranchId || '',
      inDepartmentId: overallWorkDetail?.key.inDepartmentId || '',
      outBranchId: overallWorkDetail?.key.outBranchId || '',
      outDepartmentId: overallWorkDetail?.key.outDepartmentId || ''
    };
  }

  renderView = (name: string, variable: string) => {
    const defaultName = '-';

    return (
      <li key={Math.random()}>
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

    const { count } = this.state;

    for (const product of products) {
      const { uom } = product;
      const productName = product.product ? product.product.name : 'not name';
      const uomCode = uom ? uom.code : 'not uom';
      const realData = realDatas.find(rd => rd._id === product._id);
      const quantity = realData ? realData.quantity : 0;

      result.push(
        this.renderView(productName, quantity * count + '/' + uomCode + '/')
      );
    }

    return result;
  };

  renderDetailNeed() {
    const { overallWorkDetail } = this.props;
    const { needProducts } = this.state;
    const needProductsDetail = overallWorkDetail?.needProductsData;

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
    const resultProductsDetail = overallWorkDetail?.resultProductsData;

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

    this.setState({
      count
    });
  };

  renderLabel = (max?: number) => {
    return max && max > 0 ? `Count /max: ${max}/` : `Count`;
  };

  onSelectDate = (value, name) => {
    this.setState({ [name]: value } as any);
  };

  onChangeSelect = (name, value) => {
    this.setState({ [name]: value } as any);
  };

  renderContent = (formProps: IFormProps) => {
    const { closeModal, renderButton, max } = this.props;
    const { isSubmitted } = formProps;
    const {
      type,
      count,
      needProducts,
      resultProducts,
      date,
      inBranchId,
      inDepartmentId,
      outBranchId,
      outDepartmentId
    } = this.state;

    return (
      <>
        <FormWrapper>
          <FormColumn>
            <FormGroup>
              <ControlLabel required={true}>{__(`Date`)}</ControlLabel>
              <DateContainer>
                <DateControl
                  name="date"
                  dateFormat="YYYY/MM/DD"
                  timeFormat={true}
                  placeholder="Choose date"
                  value={date}
                  onChange={value => this.onSelectDate(value, 'date')}
                />
              </DateContainer>
            </FormGroup>
          </FormColumn>
          <FormColumn>
            <FormGroup>
              <ControlLabel required={true}>
                {this.renderLabel(max)}
              </ControlLabel>
              <FormControl
                name="count"
                defaultValue={this.state.count}
                type="number"
                max={max}
                autoFocus={true}
                required={true}
                onChange={this.onChange}
              />
            </FormGroup>
          </FormColumn>
          <FormColumn>
            <FormGroup>
              <ControlLabel>Type</ControlLabel>
              <FormControl
                name="type"
                componentClass="select"
                value={type}
                required={false}
                onChange={this.onChangeSelect.bind(this, 'type')}
              >
                <option value="">All type</option>
                {Object.keys(JOB_TYPE_CHOISES).map(jt => (
                  <option value={jt} key={Math.random()}>
                    {JOB_TYPE_CHOISES[jt]}
                  </option>
                ))}
              </FormControl>
            </FormGroup>
          </FormColumn>
        </FormWrapper>
        <FormWrapper>
          <FormColumn>
            <FormGroup>
              <ControlLabel>In Branch</ControlLabel>
              <SelectBranches
                label="Choose branch"
                name="inBranchId"
                initialValue={inBranchId}
                customOption={{
                  value: '',
                  label: '...Clear branch filter'
                }}
                onSelect={branchId =>
                  this.setState({ inBranchId: branchId.toString() })
                }
                multi={false}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>In Department</ControlLabel>
              <SelectDepartments
                label="Choose department"
                name="inDepartmentId"
                initialValue={inDepartmentId}
                customOption={{
                  value: '',
                  label: '...Clear department filter'
                }}
                onSelect={departmentId =>
                  this.setState({ inDepartmentId: departmentId.toString() })
                }
                multi={false}
              />
            </FormGroup>
          </FormColumn>

          <FormColumn>
            <FormGroup>
              <ControlLabel>Out Branch</ControlLabel>
              <SelectBranches
                label="Choose branch"
                name="outBranchId"
                initialValue={outBranchId}
                customOption={{
                  value: '',
                  label: '...Clear branch filter'
                }}
                onSelect={branchId =>
                  this.setState({ outBranchId: branchId.toString() })
                }
                multi={false}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>Out Department</ControlLabel>
              <SelectDepartments
                label="Choose department"
                name="outDepartmentId"
                initialValue={outDepartmentId}
                customOption={{
                  value: '',
                  label: '...Clear department filter'
                }}
                onSelect={departmentId =>
                  this.setState({ outDepartmentId: departmentId.toString() })
                }
                multi={false}
              />
            </FormGroup>
          </FormColumn>
        </FormWrapper>

        <Box title={'Details:'}>
          <FormWrapper>
            <FormColumn>{this.renderDetailNeed()}</FormColumn>
            <FormColumn>{this.renderDetailResult()}</FormColumn>
          </FormWrapper>
        </Box>

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
      </>
    );
  };

  render() {
    return <CommonForm renderContent={this.renderContent} />;
  }
}

export default Form;
