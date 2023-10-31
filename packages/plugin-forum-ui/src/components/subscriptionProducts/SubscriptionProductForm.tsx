import React from 'react';
import { timeDuractionUnits } from '../../constants';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import Form from '@erxes/ui/src/components/form/Form';
import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import Button from '@erxes/ui/src/components/Button';
import { IProduct } from '../../types';

type Props = {
  subscriptionProduct?: IProduct;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal?: () => void;
};

const SubscriptionProductForm: React.FC<Props> = ({
  subscriptionProduct = {} as IProduct,
  renderButton,
  closeModal
}) => {
  const generateDoc = (values: {
    _id?: string;
    name: string;
    description?: string;
    multiplier?: string;
    unit?: string;
    price?: string;
    userType?: string;
    listOrder?: string;
  }) => {
    const finalValues = values;

    if (subscriptionProduct) {
      finalValues._id = subscriptionProduct._id;
    }

    return {
      ...values,
      _id: finalValues._id,
      name: finalValues.name,
      description: finalValues.description,
      multiplier: parseInt(finalValues.multiplier, 10),
      unit: finalValues.unit,
      price: parseInt(finalValues.price, 10),
      userType: finalValues.userType,
      listOrder: parseInt(finalValues.listOrder, 10)
    };
  };

  const renderContent = (formProps: IFormProps) => {
    const { values, isSubmitted } = formProps;
    const {
      name,
      description,
      multiplier,
      unit,
      price,
      userType,
      listOrder
    } = subscriptionProduct;

    return (
      <>
        <FormGroup>
          <ControlLabel>Name</ControlLabel>
          <FormControl
            {...formProps}
            name="name"
            defaultValue={name}
            autoFocus={true}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>Description</ControlLabel>
          <FormControl
            {...formProps}
            name="description"
            defaultValue={description}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>Multiplier</ControlLabel>
          <FormControl
            {...formProps}
            name="multiplier"
            type="number"
            defaultValue={multiplier || 1}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>Unit</ControlLabel>
          <FormControl
            {...formProps}
            name="unit"
            componentClass="select"
            defaultValue={unit}
          >
            {timeDuractionUnits.map(tdu => (
              <option value={tdu} key={tdu}>
                {tdu}
              </option>
            ))}
          </FormControl>
        </FormGroup>
        <FormGroup>
          <ControlLabel>Price</ControlLabel>
          <FormControl
            {...formProps}
            name="price"
            type="number"
            defaultValue={price || 0}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>User Type</ControlLabel>
          <FormControl
            {...formProps}
            name="userType"
            componentClass="select"
            defaultValue={userType}
          >
            <option value="">All</option>
            <option value="customer">customer</option>
            <option value="company">company</option>
          </FormControl>
        </FormGroup>
        <FormGroup>
          <ControlLabel>List Order</ControlLabel>
          <FormControl
            {...formProps}
            name="listOrder"
            type="number"
            defaultValue={listOrder || 0}
          />
        </FormGroup>
        <ModalFooter id={'AddProductButtons'}>
          <Button btnStyle="simple" onClick={closeModal} icon="times-circle">
            Cancel
          </Button>

          {renderButton({
            name: 'subscription product',
            values: generateDoc(values),
            isSubmitted,
            callback: closeModal,
            object: subscriptionProduct
          })}
        </ModalFooter>
      </>
    );
  };

  return <Form renderContent={renderContent} />;
};

export default SubscriptionProductForm;
