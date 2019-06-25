import { Button } from 'modules/common/components';
import { IButtonMutateProps, IFormProps } from 'modules/common/types';
import BrandForm from 'modules/settings/brands/components/BrandForm';
import * as React from 'react';
import {
  ControlLabel,
  FormControl,
  FormGroup,
  ModalTrigger
} from '../../../common/components';
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
};

class SelectBrand extends React.Component<Props, {}> {
  renderAddBrand = () => {
    const { renderButton, creatable = true } = this.props;

    if (!creatable) {
      return;
    }

    const trigger = <Button>Create brand</Button>;

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
      isRequired
    } = this.props;

    return (
      <FormGroup>
        <ControlLabel required={isRequired}>Brand</ControlLabel>
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
