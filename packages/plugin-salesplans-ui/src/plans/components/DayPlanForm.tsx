import React from 'react';
import SelectBranches from '@erxes/ui/src/team/containers/SelectBranches';
import SelectDepartments from '@erxes/ui/src/team/containers/SelectDepartments';
import SelectProductCategory from '@erxes/ui-products/src/containers/SelectProductCategory';
import SelectProducts from '@erxes/ui-products/src/containers/SelectProducts';
import { __, router } from '@erxes/ui/src/utils';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import { IDayPlanParams } from '../types';
import {
  Button,
  ControlLabel,
  DateControl,
  Form as CommonForm,
  FormGroup
} from '@erxes/ui/src/components';
import {
  MainStyleModalFooter as ModalFooter,
  MainStyleScrollWrapper as ScrollWrapper
} from '@erxes/ui/src/styles/eindex';
import { DateContainer } from '@erxes/ui/src/styles/main';
import moment from 'moment';

type Props = {
  history: any;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
};

type State = {
  dayPlanParams: IDayPlanParams;
};

class Form extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      dayPlanParams: {
        date: new Date()
      }
    };
  }

  generateDoc = (values: { _id?: string }) => {
    const finalValues = values;
    const { dayPlanParams } = this.state;

    const strVal = moment(dayPlanParams.date).format('YYYY/MM/DD');

    return {
      ...finalValues,
      ...dayPlanParams,
      date: new Date(strVal)
    };
  };

  onInputChange = e => {
    e.preventDefault();
    const value = e.target.value;
    const name = e.target.name;

    this.setState({
      dayPlanParams: { ...this.state.dayPlanParams, [name]: value }
    });
  };

  onSelectChange = (name, value) => {
    this.setState({
      dayPlanParams: { ...this.state.dayPlanParams, [name]: value }
    });
  };

  onSelectDate = value => {
    this.setState({
      dayPlanParams: {
        ...this.state.dayPlanParams,
        date: new Date(moment(value).format('YYYY/MM/DD'))
      }
    });
  };

  onAfterSave = () => {
    router.removeParams(this.props.history, 'page');
    router.setParams(this.props.history, {
      ...this.state.dayPlanParams,
      date: moment(this.state.dayPlanParams.date).format('YYYY/MM/DD')
    });
    this.props.closeModal();
  };

  renderContent = (formProps: IFormProps) => {
    const { renderButton, closeModal } = this.props;
    const { values, isSubmitted } = formProps;

    const { dayPlanParams } = this.state;

    return (
      <>
        <ScrollWrapper>
          <FormGroup>
            <ControlLabel required={true}>{__(`Year`)}</ControlLabel>
            <DateContainer>
              <DateControl
                name="createdAtFrom"
                placeholder="Choose date"
                value={
                  dayPlanParams.date ||
                  new Date(moment(new Date()).format('YYYY/MM/DD'))
                }
                onChange={this.onSelectDate}
              />
            </DateContainer>
          </FormGroup>
          <FormGroup>
            <ControlLabel>Branch</ControlLabel>
            <SelectBranches
              label="Choose branch"
              name="selectedBranchId"
              initialValue={''}
              onSelect={branchId => this.onSelectChange('branchId', branchId)}
              multi={false}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>Department</ControlLabel>
            <SelectDepartments
              label="Choose department"
              name="selectedDepartmentId"
              initialValue={''}
              onSelect={departmentId =>
                this.onSelectChange('departmentId', departmentId)
              }
              multi={false}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel required={true}>Product Category</ControlLabel>
            <SelectProductCategory
              label="Choose product category"
              name="productCategoryId"
              initialValue={''}
              onSelect={categoryId =>
                this.onSelectChange('productCategoryId', categoryId)
              }
              multi={false}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel required={true}>Or Product</ControlLabel>
            <SelectProducts
              label="Choose product"
              name="productId"
              initialValue={''}
              onSelect={productId =>
                this.onSelectChange('productId', productId)
              }
              multi={false}
            />
          </FormGroup>
        </ScrollWrapper>
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
            values: this.generateDoc(values),
            isSubmitted,
            callback: this.onAfterSave,
            object: dayPlanParams
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
