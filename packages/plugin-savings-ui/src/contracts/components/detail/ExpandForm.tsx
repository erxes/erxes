import {
  Button,
  ControlLabel,
  Form,
  FormGroup,
  MainStyleModalFooter as ModalFooter,
  MainStyleScrollWrapper as ScrollWrapper,
  Info,
} from '@erxes/ui/src';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import React, { useState } from 'react';
import { IContract } from '../../types';
import { __ } from 'coreui/utils';
import SelectContractType from '../../../contractTypes/containers/SelectContractType';

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  contract: IContract;
  closeModal: () => void;
};

const ExpandForm = (props: Props) => {
  const [contractTypeId, setContractTypeId] = useState(
    props.contract.contractTypeId,
  );
  const { contract } = props;

  const generateDoc = () => {
    return {
      id: contract._id,
      contractTypeId: contractTypeId,
    };
  };

  const onSelectContractType = (value) => {
    setContractTypeId(value);
  };

  const renderContent = (formProps: IFormProps) => {
    const { closeModal, renderButton } = props;
    const { isSubmitted } = formProps;

    return (
      <>
        <ScrollWrapper>
          <Info type="danger" title="Анхаар">
            Гэрээний сунгалт {contract.duration} сараар хийгдэнэ
          </Info>
          <FormGroup>
            <ControlLabel required={true}>{__('Contract Type')}</ControlLabel>
            <SelectContractType
              label={__('Choose type')}
              name="contractTypeId"
              value={contractTypeId || ''}
              onSelect={onSelectContractType}
              multi={false}
            ></SelectContractType>
          </FormGroup>
        </ScrollWrapper>

        <ModalFooter>
          <Button btnStyle="simple" onClick={closeModal} icon="cancel-1">
            {__('Close')}
          </Button>

          {renderButton({
            name: 'contract',
            values: generateDoc(),
            isSubmitted,
            object: contract,
          })}
        </ModalFooter>
      </>
    );
  };

  return <Form renderContent={renderContent} />;
};

export default ExpandForm;
