import React from 'react';
import SelectBranches from '@erxes/ui/src/team/containers/SelectBranches';
import SelectDepartments from '@erxes/ui/src/team/containers/SelectDepartments';
import SelectProductCategory from '@erxes/ui-products/src/containers/SelectProductCategory';
import { __ } from '@erxes/ui/src/utils';
import {
  Button,
  ControlLabel,
  Form as CommonForm,
  FormControl,
  FormGroup
} from '@erxes/ui/src/components';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import { ITimeProportionParams, ITimeframe } from '../types';
import {
  MainStyleModalFooter as ModalFooter,
  MainStyleScrollWrapper as ScrollWrapper
} from '@erxes/ui/src/styles/eindex';
import { FlexItem, FlexRow } from '@erxes/ui-settings/src/styles';

type Props = {
  timeframes: ITimeframe[];
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
};

type State = {
  timesParams: ITimeProportionParams;
  sumPercent: number;
};

class Form extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    const { timeframes } = props;

    this.state = {
      timesParams: {
        percents: timeframes.map(tf => ({
          _id: Math.random(),
          timeId: tf._id,
          percent: tf.percent
        }))
      },
      sumPercent: timeframes.length
        ? timeframes.map(tf => tf.percent).reduce((sum, per) => sum + per)
        : 0
    };
  }

  generateDoc = (values: { _id?: string }) => {
    const finalValues = values;
    const { timesParams } = this.state;

    return {
      ...finalValues,
      ...timesParams
    };
  };

  onInputChange = e => {
    e.preventDefault();
    const value = e.target.value;
    const name = e.target.name;

    this.setState({
      timesParams: { ...this.state.timesParams, [name]: value }
    });
  };

  onSelectChange = (name, value) => {
    this.setState({
      timesParams: { ...this.state.timesParams, [name]: value }
    });
  };

  onAfterSave = () => {
    this.props.closeModal();
  };

  renderPercent = percent => {
    const onChange = e => {
      const { timesParams } = this.state;
      const { percents } = timesParams;
      const value = Number(e.target.value);

      this.setState(
        {
          timesParams: {
            ...timesParams,
            percents: (percents || []).map(p =>
              p.timeId === percent.timeId ? { ...p, percent: value } : p
            )
          }
        },
        () => {
          const pers = this.state.timesParams.percents;
          this.setState({
            sumPercent:
              pers && pers.length
                ? pers.map(tf => tf.percent).reduce((sum, per) => sum + per)
                : 0
          });
        }
      );
    };

    const percentInfo =
      this.props.timeframes.find(tf => tf._id === percent.timeId) || {};
    return (
      <FlexRow key={percent._id}>
        <FlexItem>
          <ControlLabel>{percentInfo.name}</ControlLabel>
        </FlexItem>
        <FlexItem>{`${percentInfo.description}`}</FlexItem>
        <FlexItem>{percentInfo.startTime}</FlexItem>
        <FlexItem>{percentInfo.endTime}</FlexItem>
        <FlexItem>
          <FormControl
            type="number"
            componentClass="number"
            min={0}
            max={100}
            id={`${percent._id}`}
            value={percent.percent || 0}
            onChange={onChange}
          />
        </FlexItem>
      </FlexRow>
    );
  };

  renderTimes = () => {
    const { timesParams, sumPercent } = this.state;
    const { percents } = timesParams;
    return (
      <>
        <FlexRow>
          <FlexItem>
            <ControlLabel>Name</ControlLabel>
          </FlexItem>
          <FlexItem>
            <ControlLabel>Description</ControlLabel>
          </FlexItem>
          <FlexItem>
            <ControlLabel>Start time (Hour)</ControlLabel>
          </FlexItem>
          <FlexItem>
            <ControlLabel>End time (Hour)</ControlLabel>
          </FlexItem>
          <FlexItem>
            <ControlLabel>Percent</ControlLabel>
          </FlexItem>
        </FlexRow>
        {(percents || []).map(p => this.renderPercent(p))}
        <FlexRow>Summary Percent: {sumPercent}</FlexRow>
      </>
    );
  };

  renderContent = (formProps: IFormProps) => {
    const { renderButton, closeModal } = this.props;
    const { values, isSubmitted } = formProps;

    const { timesParams } = this.state;

    return (
      <>
        <ScrollWrapper>
          <FormGroup>
            <ControlLabel>Branch</ControlLabel>
            <SelectBranches
              label="Choose branch"
              name="branchIds"
              initialValue={''}
              onSelect={branchIds =>
                this.onSelectChange('branchIds', branchIds)
              }
              multi={true}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>Department</ControlLabel>
            <SelectDepartments
              label="Choose department"
              name="departmentIds"
              initialValue={''}
              onSelect={departmentIds =>
                this.onSelectChange('departmentIds', departmentIds)
              }
              multi={true}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>Product Category</ControlLabel>
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
          {this.renderTimes()}
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
            object: timesParams
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
