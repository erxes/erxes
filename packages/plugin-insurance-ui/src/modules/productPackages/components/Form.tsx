import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import React from 'react';

import Button from '@erxes/ui/src/components/Button';
import FormControl from '@erxes/ui/src/components/form/Control';
import Form from '@erxes/ui/src/components/form/Form';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import { __ } from '@erxes/ui/src/utils/core';
import { InsurancePackage } from '../../../gql/types';
import SelectProducts from '../../products/containers/SelectProducts';

type Props = {
  insurancePackage?: InsurancePackage;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
  refetch?: () => void;
};

const PackageForm = (props: Props) => {
  const [insurancePackage, setPackage] = React.useState<any>(
    props.insurancePackage || {}
  );

  const generateDoc = () => {
    const finalValues: any = {};

    finalValues.name = insurancePackage.name;
    finalValues.productIds = insurancePackage.productIds;

    return finalValues;
  };

  const renderContent = (formProps: IFormProps) => {
    const { closeModal, renderButton } = props;
    const { isSubmitted } = formProps;

    const renderInput = (
      name: string,
      type: string,
      value: any,
      label: string,
      required?: boolean
    ) => {
      const onChangeInput = (e: any) => {
        setPackage({
          ...insurancePackage,
          [name]: e.target.value
        });
      };

      return (
        <FormGroup>
          <ControlLabel>{__(label)}</ControlLabel>
          <FormControl
            {...formProps}
            id={name}
            name={name}
            type={type}
            required={required}
            defaultValue={value}
            onChange={onChangeInput}
          />
        </FormGroup>
      );
    };

    return (
      <>
        {renderInput('name', 'text', insurancePackage.name, 'Name', true)}

        <FormGroup>
          <ControlLabel>{__('Products')}</ControlLabel>
          <SelectProducts
            label="Products"
            name="products"
            onSelect={(values: string[] | string) => {
              setPackage({
                ...insurancePackage,
                productIds: values
              });
            }}
            initialValue={insurancePackage.productIds}
          />
        </FormGroup>

        <ModalFooter>
          <Button btnStyle="simple" onClick={closeModal} icon="times-circle">
            Close
          </Button>

          {renderButton({
            name: 'package',
            values: generateDoc(),
            isSubmitted,
            callback: () => {
              closeModal();
              if (props.refetch) {
                props.refetch();
              }
            },
            object: insurancePackage
          })}
        </ModalFooter>
      </>
    );
  };

  return <Form renderContent={renderContent} />;
};

export default PackageForm;
