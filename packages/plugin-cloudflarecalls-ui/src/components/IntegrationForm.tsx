import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import Button from '@erxes/ui/src/components/Button';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import Form from '@erxes/ui/src/components/form/Form';
import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import React, { useState } from 'react';
import SelectBrand from '@erxes/ui-inbox/src/settings/integrations/containers/SelectBrand';
import SelectChannels from '@erxes/ui-inbox/src/settings/integrations/containers/SelectChannels';
import { __ } from '@erxes/ui/src/utils/core';
import OperatorForm from './OperatorForm';
import { Operator } from '../types';

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  callback: () => void;
  onChannelChange: () => void;
  channelIds: string[];
};

const IntegrationForm: React.FC<Props> = ({
  renderButton,
  callback,
  onChannelChange,
  channelIds,
}: Props) => {
  const [operators, setOperators] = useState<Operator[]>([]);

  const generateDoc = (values: any) => {
    return {
      name: values.name,
      brandId: values.brandId,
      kind: 'cloudflarecalls',
      data: {
        operators,
      },
    };
  };

  const renderField = ({
    label,
    fieldName,
    formProps,
  }: {
    label: string;
    fieldName: string;
    formProps: IFormProps;
  }) => {
    return (
      <FormGroup>
        <ControlLabel required={true}>{label}</ControlLabel>
        <FormControl
          {...formProps}
          name={fieldName}
          required={true}
          autoFocus={fieldName === 'name'}
        />
      </FormGroup>
    );
  };

  const renderContent = (formProps: IFormProps) => {
    const { values, isSubmitted } = formProps;

    const onChangeOperators = (index: number, value: any) => {
      const updatedOperators = [...operators];
      updatedOperators[index] = value;
      setOperators(updatedOperators);
    };

    const handleAddOperation = () => {
      setOperators([...operators, { userId: '' }]);
    };

    const handleRemoveOperator = (index: number) => {
      setOperators(operators.filter((l, i) => i !== index));
    };

    return (
      <>
        {renderField({ label: 'Name', fieldName: 'name', formProps })}
        <>
          {operators.map((operator, index) => (
            <OperatorForm
              operator={operator}
              index={index}
              onChange={onChangeOperators}
              removeOperator={handleRemoveOperator}
              key={index}
            />
          ))}
          <FormGroup>
            <div style={{ display: 'flex', justifyContent: 'end' }}>
              <Button
                btnStyle="primary"
                icon="plus"
                size="medium"
                onClick={handleAddOperation}
              >
                {__('Add Operator')}
              </Button>
            </div>
          </FormGroup>
        </>

        <SelectBrand
          isRequired={true}
          formProps={formProps}
          description={__(
            'Which specific Brand does this integration belong to?',
          )}
        />

        <SelectChannels
          defaultValue={channelIds}
          isRequired={true}
          onChange={onChannelChange}
        />

        <ModalFooter>
          <Button
            btnStyle="simple"
            type="button"
            onClick={callback}
            icon="times-circle"
          >
            Cancel
          </Button>
          {renderButton({
            values: generateDoc(values),
            isSubmitted,
            callback,
          })}
        </ModalFooter>
      </>
    );
  };

  return <Form renderContent={renderContent} />;
};

export default IntegrationForm;
