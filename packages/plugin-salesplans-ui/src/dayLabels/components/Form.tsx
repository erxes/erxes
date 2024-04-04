import Label from '@erxes/ui/src/components/Label';
import React from 'react';
import SelectBranches from '@erxes/ui/src/team/containers/SelectBranches';
import SelectDepartments from '@erxes/ui/src/team/containers/SelectDepartments';
import { Alert, __ } from '@erxes/ui/src/utils';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import { IDayLabelParams } from '../types';
import { DateContainer } from '@erxes/ui/src/styles/main';
import DateControl from '@erxes/ui/src/components/form/DateControl';
import {
  Button,
  ControlLabel,
  Form as CommonForm,
  FormGroup
} from '@erxes/ui/src/components';
import {
  MainStyleModalFooter as ModalFooter,
  MainStyleScrollWrapper as ScrollWrapper
} from '@erxes/ui/src/styles/eindex';
import moment from 'moment';
import SelectLabels from '../../settings/containers/SelectLabels';

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
};

type State = {
  dayLabelParams: IDayLabelParams;
};

class Form extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      dayLabelParams: {
        dates: []
      }
    };
  }

  generateDoc = (values: { _id?: string }) => {
    const finalValues = values;
    const { dayLabelParams } = this.state;

    return {
      ...finalValues,
      ...dayLabelParams,
      dates: (dayLabelParams.dates || []).map(d => new Date(d))
    };
  };

  onInputChange = e => {
    e.preventDefault();
    const value = e.target.value;
    const name = e.target.name;

    this.setState({
      dayLabelParams: { ...this.state.dayLabelParams, [name]: value }
    });
  };

  onSelectChange = (name, value) => {
    this.setState({
      dayLabelParams: { ...this.state.dayLabelParams, [name]: value }
    });
  };

  onSelectDate = value => {
    const { dayLabelParams } = this.state;

    const strVal = moment(value).format('YYYY/MM/DD');

    if (strVal === 'Invalid date') {
      return;
    }

    if (!(dayLabelParams.dates || []).includes(strVal)) {
      (dayLabelParams.dates || []).push(strVal);
    }

    this.setState({
      dayLabelParams: { ...dayLabelParams }
    });
  };

  removeDate = (date, e) => {
    const { dayLabelParams } = this.state;
    dayLabelParams.dates = (dayLabelParams.dates || []).filter(d => d !== date);
    this.setState({
      dayLabelParams: { ...dayLabelParams }
    });
  };

  onAfterSave = () => {
    this.props.closeModal();
  };

  renderContent = (formProps: IFormProps) => {
    const { renderButton, closeModal } = this.props;
    const { values, isSubmitted } = formProps;

    const { dayLabelParams } = this.state;

    return (
      <>
        <ScrollWrapper>
          {(dayLabelParams.dates || []).map(d => (
            <span key={Math.random()} onClick={this.removeDate.bind(this, d)}>
              <Label children={d} />
              &nbsp;
            </span>
          ))}
          <FormGroup>
            <ControlLabel required={true}>{__(`Date`)}</ControlLabel>
            <DateContainer>
              <DateControl
                name="createdAtFrom"
                placeholder="Choose date"
                defaultValue={
                  dayLabelParams.dates && dayLabelParams.dates.length
                    ? dayLabelParams.dates[dayLabelParams.dates.length - 1]
                    : new Date()
                }
                onChange={this.onSelectDate}
              />
            </DateContainer>
          </FormGroup>
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
            <ControlLabel required={true}>Labels</ControlLabel>
            <SelectLabels
              label="Choose label"
              name="labelIds"
              initialValue={''}
              onSelect={labelIds => this.onSelectChange('labelIds', labelIds)}
              multi={true}
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
            object: dayLabelParams
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
