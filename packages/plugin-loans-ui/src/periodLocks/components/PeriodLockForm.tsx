import {
  Button,
  ControlLabel,
  DateControl,
  Form,
  FormGroup,
  MainStyleFormWrapper as FormWrapper,
  MainStyleModalFooter as ModalFooter,
} from '@erxes/ui/src';
import { DateContainer } from '@erxes/ui/src/styles/main';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import React, { useState } from 'react';
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

const PeriodLockForm = (props: Props) => {
  const { periodLock = {} as IPeriodLock } = props;
  const [date, setDate] = useState(periodLock.date || new Date());
  const [excludeContracts, setExcludeContracts] = useState(
    periodLock.excludeContracts || [],
  );

  const generateDoc = (values: { _id: string } & IPeriodLockDoc) => {
    const finalValues = values;

    if (periodLock) {
      finalValues._id = periodLock._id;
    }

    return {
      _id: finalValues._id,
      excludeContracts,
      date: date,
    };
  };

  const renderContent = (formProps: IFormProps) => {
    const { closeModal, renderButton } = props;
    const { values, isSubmitted } = formProps;

    const onChangeStartDate = (value) => {
      setDate(value);
    };

    const onChangeExcludeContracts = (value) => {
      setExcludeContracts(value);
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
                dateFormat="YYYY/MM/DD"
                name="date"
                value={date}
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
              initialValue={periodLock?.excludeContracts}
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
            values: generateDoc(values),
            isSubmitted,
            object: props.periodLock,
          })}
        </ModalFooter>
      </>
    );
  };

  return <Form renderContent={renderContent} />;
};

export default PeriodLockForm;
