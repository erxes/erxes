import React from 'react';

import Form from "@erxes/ui/src/components/form/Form";
import { FormColumn, FormWrapper, ModalFooter } from '@erxes/ui/src/styles/main';
import SelectProducts from '@erxes/ui-products/src/containers/SelectProducts';
import SelectProductCategory from '@erxes/ui-products/src/containers/SelectProductCategory';
import SelectTags from '@erxes/ui-tags/src/containers/SelectTags';
import { Button, ControlLabel, FormControl, FormGroup } from '@erxes/ui/src/components';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import { IProductRule } from '@erxes/ui-products/src/types';
import { __ } from '@erxes/ui/src/utils';

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
  rule?: IProductRule;
}

type State = {
  name: string;
  unitPrice: number;
  categoryIds?: string[];
  excludeCategoryIds?: string[];
  productIds?: string[];
  excludeProductIds?: string[];
  tagIds?: string[];
  excludeTagIds?: string[];
}

export default class ProductRuleForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const rule = props.rule || {};

    this.state = { unitPrice: 0, name: '', ...rule };
  }

  render() {
    const { renderButton, closeModal, rule } = this.props;
    const {
      unitPrice,
      categoryIds,
      excludeCategoryIds,
      productIds,
      excludeProductIds,
      tagIds,
      excludeTagIds,
      name
    } = this.state;

    const onSelectChange = (value, name: string) => {
      this.setState({ [name]: value } as unknown as Pick<State, keyof State>);
    };

    const onPriceChange = (e) => {
      const val = Number(e.target.value);

      this.setState({ unitPrice: val });
    };

    const onNameChange = (e) => {
      this.setState({ name: e.target.value });
    }

    const renderContent = (formProps: IFormProps) => {
      const { isSubmitted } = formProps;

      const callback = () => {
        if (isSubmitted) {
          closeModal();
        }
      }

      return (
        <>
          <FormWrapper>
            <FormColumn>
              <FormGroup>
                <ControlLabel required={true}>{__('Name')}</ControlLabel>
                <FormControl
                  name="name"
                  type="text"
                  defaultValue={name}
                  onBlur={onNameChange}
                />
              </FormGroup>
            </FormColumn>
            <FormColumn>
              <FormGroup>
                <ControlLabel required={true}>{__('Unit price')}</ControlLabel>
                <FormControl
                  name="unitPrice"
                  type="number"
                  min={0}
                  defaultValue={unitPrice}
                  onChange={onPriceChange}
                />
              </FormGroup>
            </FormColumn>
          </FormWrapper>

          <FormWrapper>
            <FormColumn>
              <FormGroup>
                <ControlLabel>{__('Choose categories to include')}</ControlLabel>
                <SelectProductCategory
                  label="Choose categories"
                  name="categoryIds"
                  multi={true}
                  initialValue={categoryIds}
                  onSelect={onSelectChange}
                />
              </FormGroup>
            </FormColumn>
            <FormColumn>
              <FormGroup>
                <ControlLabel>{__('Choose categories to exclude')}</ControlLabel>
                <SelectProductCategory
                  label="Choose exclude categories"
                  name="excludeCategoryIds"
                  multi={true}
                  initialValue={excludeCategoryIds}
                  onSelect={onSelectChange}
                />
              </FormGroup>
            </FormColumn>
          </FormWrapper>

          <FormWrapper>
            <FormColumn>
              <FormGroup>
                <ControlLabel>{__('Choose products')}</ControlLabel>
                <SelectProducts
                  label="Choose products"
                  name="productIds"
                  multi={true}
                  initialValue={productIds}
                  onSelect={onSelectChange}
                />
              </FormGroup>
            </FormColumn>
            <FormColumn>
              <FormGroup>
                <ControlLabel>{__('Choose exclude products')}</ControlLabel>
                <SelectProducts
                  label="Choose exclude products"
                  name="excludeProductIds"
                  multi={true}
                  initialValue={excludeProductIds}
                  onSelect={onSelectChange}
                />
              </FormGroup>
            </FormColumn>
          </FormWrapper>

          <FormWrapper>
            <FormColumn>
              <FormGroup>
                <ControlLabel>{__('Choose tags')}</ControlLabel>
                <SelectTags
                  tagsType='core:product'
                  label="Choose tags"
                  name="tagIds"
                  multi={true}
                  initialValue={tagIds}
                  onSelect={onSelectChange}
                />
              </FormGroup>
            </FormColumn>

            <FormColumn>
              <FormGroup>
                <ControlLabel>{__('Choose exclude tags')}</ControlLabel>
                <SelectTags
                  tagsType='core:product'
                  label="Choose exclude tags"
                  name="excludeTagIds"
                  multi={true}
                  initialValue={excludeTagIds}
                  onSelect={onSelectChange}
                />
              </FormGroup>
            </FormColumn>
          </FormWrapper>

          <ModalFooter>
            <Button btnStyle="simple" onClick={closeModal} icon="cancel-1">
              Close
            </Button>

            {renderButton({
              values: this.state,
              isSubmitted,
              callback,
              object: rule,
            })}
          </ModalFooter>
        </>
      );
    };

    return (
      <Form renderContent={renderContent}></Form>
    );
  }
}
