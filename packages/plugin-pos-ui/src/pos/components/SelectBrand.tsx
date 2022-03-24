import BrandForm from './BrandForm';
import React from 'react';
import {
  __,
  Button,
  ControlLabel,
  FormControl,
  FormGroup,
  ModalTrigger
} from '@erxes/ui/src';
import { IFormProps } from '@erxes/ui/src/types';
import { IBrand } from '@erxes/ui/src/brands/types';
import { IButtonMutateProps } from '../../types';
import { Row } from '../../styles';

type Props = {
  brands: IBrand[];
  onChange?: (e: any) => any;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  defaultValue?: string;
  creatable?: boolean;
  isRequired?: boolean;
  formProps?: IFormProps;
  description?: string;
};

class SelectBrand extends React.Component<Props, {}> {
  renderAddBrand = () => {
    const { renderButton, creatable = true } = this.props;

    if (!creatable) {
      return;
    }

    const trigger = (
      <Button btnStyle="primary" icon="plus-circle">
        Create brand
      </Button>
    );

    const content = props => (
      <BrandForm {...props} renderButton={renderButton} />
    );

    return (
      <ModalTrigger title="Create brand" trigger={trigger} content={content} />
    );
  };

  render() {
    const {
      brands,
      onChange,
      defaultValue,
      formProps,
      isRequired,
      description
    } = this.props;

    return (
      <FormGroup>
        <ControlLabel required={isRequired}>Brand</ControlLabel>
        {description && <p>{description}</p>}
        <Row>
          <FormControl
            {...formProps}
            name="brandId"
            componentClass="select"
            placeholder={__('Select Brand')}
            defaultValue={defaultValue}
            onChange={onChange}
            required={isRequired}
          >
            <option />
            {brands.map(brand => (
              <option key={brand._id} value={brand._id}>
                {brand.name}
              </option>
            ))}
          </FormControl>
          {this.renderAddBrand()}
        </Row>
      </FormGroup>
    );
  }
}

export default SelectBrand;
