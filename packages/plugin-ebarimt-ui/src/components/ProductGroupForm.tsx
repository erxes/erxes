import SelectProducts from "@erxes/ui-products/src/containers/SelectProducts";
import {
  Button,
  ControlLabel,
  Form,
  MainStyleFormColumn as FormColumn,
  FormControl,
  FormGroup,
  MainStyleFormWrapper as FormWrapper,
  MainStyleModalFooter as ModalFooter,
  __,
} from "@erxes/ui/src";
import {
  IButtonMutateProps,
  IFormProps,
} from "@erxes/ui/src/types";
import React, { useState } from "react";
import { IEbarimtProductGroup, IEbarimtProductGroupDoc } from "../types";

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  productGroup?: IEbarimtProductGroup;
  closeModal: () => void;
};

type State = {
  sortNum: number;
  mainProductId?: string;
  subProductId?: string;
  ratio?: number;
  isActive: boolean;
};

const ProductGroupForm = (props: Props) => {
  const { productGroup, closeModal, renderButton } = props;

  const [state, setState] = useState<State>(productGroup || { isActive: true, sortNum: 1 });

  const generateDoc = (values: { _id: string } & IEbarimtProductGroupDoc) => {
    const finalValues = values;

    if (productGroup) {
      finalValues._id = productGroup._id;
    }

    return {
      _id: finalValues._id,
      ...state,
      ratio: state.ratio && Number(state.ratio) || 0,
      sortNum: Number(state.sortNum) || 1,
    };
  };

  const renderFormGroup = (name, label, props) => {
    return (
      <FormGroup>
        <ControlLabel>{label}</ControlLabel>
        <FormControl
          name={name}
          defaultValue={state[name]}
          onChange={e => setState({ ...state, [name]: (e.target as any).value })}
          {...props} />
      </FormGroup>
    );
  };

  const handleState = (key: string, value: any) => {
    setState({ ...state, [key]: value })
  };

  const renderContent = (formProps: IFormProps) => {
    const { values, isSubmitted } = formProps;

    return (
      <>
        <FormWrapper>
          <FormColumn>
            <FormGroup>
              <ControlLabel>{__('Main product')}</ControlLabel>
              <SelectProducts
                name="mainProductId"
                label="Choose product"
                initialValue={state.mainProductId}
                onSelect={productId => handleState("mainProductId", productId)}
                multi={false}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>{__('Sub product')}</ControlLabel>
              <SelectProducts
                name="subProductId"
                label="Choose product"
                initialValue={state.subProductId}
                onSelect={productId => handleState("subProductId", productId)}
                multi={false}
              />
            </FormGroup>
            {renderFormGroup('sortNum', 'Sort Number', {
              ...formProps,
              type: 'number',
              value: Number(state.sortNum) || 0,
            })}
            {renderFormGroup('ratio', 'Ratio', {
              ...formProps,
              type: 'number',
              value: Number(state.ratio) || 0,
            })}
            <FormGroup>
              <ControlLabel>Is Active</ControlLabel>
              <FormControl
                checked={state.isActive}
                componentclass="checkbox"
                onChange={(e) => handleState('isActive', (e.target as any).checked)}
              />
            </FormGroup>

          </FormColumn>
        </FormWrapper>
        <FormWrapper>
        </FormWrapper>

        <ModalFooter>
          <Button btnStyle="simple" onClick={closeModal} icon="cancel-1">
            Close
          </Button>

          {renderButton({
            name: "productGroup",
            values: generateDoc(values),
            isSubmitted,
            object: props.productGroup
          })}
        </ModalFooter>
      </>
    );
  };
  return <Form renderContent={renderContent} />;
};

export default ProductGroupForm;
