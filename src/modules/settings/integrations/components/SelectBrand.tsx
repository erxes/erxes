import { Button } from 'modules/common/components';
import { IButtonMutateProps } from 'modules/common/types';
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
  brands: IBrand[]; // eslint-disable-line react/forbid-prop-types
  onChange?: (e: any) => any;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  defaultValue?: string;
  creatable?: boolean;
  isRequired?: boolean;
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
    const { brands, onChange, defaultValue, isRequired } = this.props;

    return (
      <FormGroup>
        <ControlLabel required={isRequired}>Brand</ControlLabel>
        <Row>
          <FormControl
            componentClass="select"
            placeholder={__('Select Brand')}
            defaultValue={defaultValue}
            onChange={onChange}
            id="selectBrand"
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
