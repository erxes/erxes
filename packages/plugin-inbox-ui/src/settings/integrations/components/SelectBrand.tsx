import Button from 'modules/common/components/Button';
import FormControl from 'modules/common/components/form/Control';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import { IButtonMutateProps, IFormProps } from 'modules/common/types';
import BrandForm from 'modules/settings/brands/components/BrandForm';
import React from 'react';
import { __ } from '../../../common/utils';
import { IBrand } from '../../brands/types';
import { Row } from '../styles';

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
