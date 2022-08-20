import {
  __,
  Button,
  ControlLabel,
  DateControl,
  Form,
  FormControl,
  FormGroup,
  MainStyleFormWrapper as FormWrapper,
  MainStyleModalFooter as ModalFooter,
  MainStyleScrollWrapper as ScrollWrapper
} from '@erxes/ui/src';
import { DateContainer } from '@erxes/ui/src/styles/main';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import React from 'react';

import { IAdjustment, IAdjustmentDoc } from '../types';

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  adjustment: IAdjustment;
  closeModal: () => void;
};

type State = {
  date: Date;
};

class AdjustmentForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const { adjustment = {} } = props;

    this.state = {
      date: adjustment.date || new Date()
    };
  }

  generateDoc = (values: { _id: string } & IAdjustmentDoc) => {
    const { adjustment } = this.props;

    const finalValues = values;

    if (adjustment) {
      finalValues._id = adjustment._id;
    }

    return {
      _id: finalValues._id,
      ...this.state,
      date: this.state.date
    };
  };

  renderFormGroup = (label, props) => {
    return (
      <FormGroup>
        <ControlLabel>{label}</ControlLabel>
        <FormControl {...props} />
      </FormGroup>
    );
  };

  renderContent = (formProps: IFormProps) => {
    const adjustment = this.props.adjustment || ({} as IAdjustment);
    const { closeModal, renderButton } = this.props;
    const { values, isSubmitted } = formProps;

    const onChangeStartDate = value => {
      this.setState({ date: value });
    };

    return (
      <>
        <ScrollWrapper>
          <FormWrapper>
            <FormGroup>
              <ControlLabel required={true}>Date</ControlLabel>
              <DateContainer>
                <DateControl
                  {...formProps}
                  required={false}
                  name="date"
                  value={this.state.date}
                  onChange={onChangeStartDate}
                />
              </DateContainer>
            </FormGroup>
          </FormWrapper>
        </ScrollWrapper>

        <ModalFooter>
          <Button btnStyle="simple" onClick={closeModal} icon="cancel-1">
            Close
          </Button>

          {renderButton({
            name: 'adjustment',
            values: this.generateDoc(values),
            isSubmitted,
            object: this.props.adjustment
          })}
        </ModalFooter>
      </>
    );
  };

  render() {
    return <Form renderContent={this.renderContent} />;
  }
}

export default AdjustmentForm;
