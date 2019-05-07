import { Button } from 'modules/common/components';
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
  save: (
    params: {
      doc: {
        name: string;
        description: string;
      };
    },
    callback: () => void
  ) => void;
  defaultValue?: string;
  isVisible?: boolean;
};

class SelectBrand extends React.Component<Props, {}> {
  renderAddBrand = () => {
    const { save, isVisible } = this.props;

    if (isVisible) {
      return;
    }

    const trigger = <Button>Add brand</Button>;

    const content = props => <BrandForm {...props} save={save} />;

    return (
      <ModalTrigger title="Add brand" trigger={trigger} content={content} />
    );
  };

  render() {
    const { brands, onChange, defaultValue, save } = this.props;

    return (
      <FormGroup>
        <ControlLabel required={true}>Brand</ControlLabel>
        <Row>
          <FormControl
            componentClass="select"
            placeholder={__('Select Brand')}
            defaultValue={defaultValue}
            onChange={onChange}
            id="selectBrand"
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
