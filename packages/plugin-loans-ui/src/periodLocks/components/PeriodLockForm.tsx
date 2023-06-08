import {
  Button,
  ControlLabel,
  DateControl,
  Form,
  FormControl,
  FormGroup,
  MainStyleFormWrapper as FormWrapper,
  MainStyleModalFooter as ModalFooter
} from '@erxes/ui/src';
import { DateContainer } from '@erxes/ui/src/styles/main';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import React from 'react';
import { __ } from 'coreui/utils';
import { IPeriodLock, IPeriodLockDoc } from '../types';

import SelectContract from '../../contracts/components/common/SelectContract';
import styled from 'styled-components';

const ContractContainer = styled.div`
  img {
    height: 20px;
    width: 20px;
  }
`;

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  periodLock: IPeriodLock;
  closeModal: () => void;
};

type State = {
  date: Date;
  excludeContracts: string[];
};

class PeriodLockForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const { periodLock = {} } = props;

    this.state = {
      date: periodLock.date || new Date(),
      excludeContracts: periodLock.excludeContracts || []
    };
  }

  generateDoc = (values: { _id: string } & IPeriodLockDoc) => {
    const { periodLock } = this.props;

    const finalValues = values;

    if (periodLock) {
      finalValues._id = periodLock._id;
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
    const { closeModal, renderButton } = this.props;
    const { values, isSubmitted } = formProps;

    const onChangeStartDate = value => {
      this.setState({ date: value });
    };

    const onChangeExcludeContracts = value => {
      this.setState({ excludeContracts: value });
    };

    return (
      <>
        <FormWrapper>
          <FormGroup>
            <ControlLabel required={true}>{__('Date')}</ControlLabel>
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
        <FormGroup>
          <ControlLabel>{__('Exclude Contracts')}</ControlLabel>
          <ContractContainer>
            <SelectContract
              onSelect={onChangeExcludeContracts}
              label={__('Contracts')}
              name="excludeContracts"
              initialValue={this.props.periodLock?.excludeContracts}
              multi={true}
            />
          </ContractContainer>
        </FormGroup>
        <ModalFooter>
          <Button btnStyle="simple" onClick={closeModal} icon="cancel-1">
            {__('Close')}
          </Button>

          {renderButton({
            name: 'periodLock',
            values: this.generateDoc(values),
            isSubmitted,
            object: this.props.periodLock
          })}
        </ModalFooter>
      </>
    );
  };

  render() {
    return <Form renderContent={this.renderContent} />;
  }
}

export default PeriodLockForm;
