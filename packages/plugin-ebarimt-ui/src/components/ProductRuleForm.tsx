import SelectProductCategory from "@erxes/ui-products/src/containers/SelectProductCategory";
import SelectProducts from "@erxes/ui-products/src/containers/SelectProducts";
import SelectTags from "@erxes/ui-tags/src/containers/SelectTags";
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
import React, { useEffect, useState } from "react";
import { TAX_TYPES } from "../constants";
import { IEbarimtProductRule, IEbarimtProductRuleDoc } from "../types";

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  productRule?: IEbarimtProductRule;
  closeModal: () => void;
};

type State = {
  title: string;
  kind?: string;

  // filters
  productIds?: string[];
  productCategoryIds?: string[];
  excludeCategoryIds?: string[];
  excludeProductIds?: string[];
  tagIds?: string[];
  excludeTagIds?: string[];

  // vat
  taxType?: string;
  taxCode?: string;
  taxPercent?: number;
};

const ProductRuleForm = (props: Props) => {
  const { productRule, closeModal, renderButton } = props;

  const [state, setState] = useState<State>(productRule || {
    title: '',
    taxType: 'ctax'
  });

  useEffect(() => {
    const chosen = TAX_TYPES[state.taxType || '']
    if (!chosen) {
      return
    }
    if (state.taxType === 'ctax') {
      setState({ ...state, kind: 'ctax' })
    } else {
      setState({ ...state, taxPercent: Number(chosen.percent) || 0, kind: 'vat' })
    }
  }, [state.taxType]);

  const generateDoc = (values: { _id: string } & IEbarimtProductRuleDoc) => {
    const finalValues = values;

    if (productRule) {
      finalValues._id = productRule._id;
    }

    return {
      _id: finalValues._id,
      kind: state.taxType === 'ctax' && 'ctax' || 'vat',
      ...state,
      taxPercent: Number(state.taxPercent)
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
            {renderFormGroup('title', 'Title', {
              ...formProps,
            })}

            {renderFormGroup('taxType', 'tax Type', {
              ...formProps,
              componentclass: 'select',
              options: Object.keys(TAX_TYPES).map(key => ({ value: key, label: TAX_TYPES[key].label }))
            })}

            {renderFormGroup('taxCode', 'Tax Code', {
              ...formProps,
              componentclass: 'select',
              options: [{ value: '', label: 'Choose' }, ...((TAX_TYPES[state.taxType || ''] || {}).options || [])]
            })}
            {renderFormGroup('kind', 'Kind', {
              ...formProps,
              value: state.kind,
              disabled: true
            })}
            {renderFormGroup('taxPercent', 'Percent', {
              ...formProps,
              type: 'number',
              value: Number(state.taxPercent) || 0,
              disabled: (TAX_TYPES[state.taxType || ''] || {}).percent
            })}
          </FormColumn>

          <FormColumn>
            <FormGroup>
              <ControlLabel>{__('Product Categories')}</ControlLabel>
              <SelectProductCategory
                name="productCategoryIds"
                label="Choose categories"
                initialValue={state.productCategoryIds}
                onSelect={categories => handleState("productCategoryIds", categories)}
                multi={true}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>{__('Exclude Categories')}</ControlLabel>
              <SelectProductCategory
                name="excludeCategoryIds"
                label="Choose categories"
                initialValue={state.excludeCategoryIds}
                onSelect={categories => handleState("excludeCategoryIds", categories)}
                multi={true}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>{__('Products')}</ControlLabel>
              <SelectProducts
                name="productIds"
                label="Choose products"
                initialValue={state.productIds}
                onSelect={products => handleState("productIds", products)}
                multi={true}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>{__('Exclude Products')}</ControlLabel>
              <SelectProducts
                name="excludeProductIds"
                label="Choose products"
                initialValue={state.excludeProductIds}
                onSelect={products => handleState("excludeProductIds", products)}
                multi={true}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>{__('Tags')}</ControlLabel>
              <SelectTags
                tagsType="core:product"
                name="tagIds"
                label="Choose tags"
                initialValue={state.tagIds}
                onSelect={tags => handleState("tagIds", tags)}
                multi={true}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>{__('Exclude tags')}</ControlLabel>
              <SelectTags
                tagsType="core:product"
                name="excludeTagIds"
                label="Choose tags"
                initialValue={state.excludeTagIds}
                onSelect={tags => handleState("excludeTagIds", tags)}
                multi={true}
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
            name: "productRule",
            values: generateDoc(values),
            isSubmitted,
            object: props.productRule
          })}
        </ModalFooter>
      </>
    );
  };
  return <Form renderContent={renderContent} />;
};

export default ProductRuleForm;
