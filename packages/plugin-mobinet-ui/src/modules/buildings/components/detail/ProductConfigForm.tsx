import Button from '@erxes/ui/src/components/Button';
import Form from '@erxes/ui/src/components/form/Form';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import React, { useEffect, useState } from 'react';

import { IProductPriceConfig } from '../../types';

type Props = {
  buildingId: string;
  productConfigs: IProductPriceConfig[];
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
};

const BuildingForm = (props: Props) => {
  const [productConfigs, setProductConfigs] = useState<IProductPriceConfig[]>(
    props.productConfigs
  );

  const generateDoc = () => {
    const finalValues: any = {};

    finalValues._id = props.buildingId;
    finalValues.productConfigs = productConfigs;

    return {
      ...finalValues
    };
  };

  const renderContent = (formProps: IFormProps) => {
    const { closeModal, renderButton } = props;
    const { isSubmitted } = formProps;

    return (
      <>
        <FormGroup>
          <ControlLabel>Product Configs</ControlLabel>
        </FormGroup>

        <ModalFooter>
          <Button btnStyle="simple" onClick={closeModal} icon="times-circle">
            Close
          </Button>

          {renderButton({
            name: 'productConfigs',
            values: generateDoc(),
            isSubmitted,
            callback: closeModal
          })}
        </ModalFooter>
      </>
    );
  };

  return <Form renderContent={renderContent} />;
};

export default BuildingForm;
