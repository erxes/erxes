import Button from 'modules/common/components/Button';
import FormControl from 'modules/common/components/form/Control';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import { ModalFooter } from 'modules/common/styles/main';
import { __ } from 'modules/common/utils';
import React from 'react';
import { IBrand } from '../../../../settings/brands/types';

type Props = {
  onSave: (brandId: string, name: string) => void;
  brands: IBrand[];
  trigger: React.ReactNode;
  brandId?: string;
};

class ResponseTemplateModal extends React.Component<Props, {}> {
  onSave = () => {
    const doc = {
      brandId: (document.getElementById(
        'template-brand-id'
      ) as HTMLInputElement).value,
      name: (document.getElementById('template-name') as HTMLInputElement).value
    };

    this.props.onSave(doc.brandId, doc.name);
  };

  renderForm = () => {
    const { brands, brandId } = this.props;

    return (
      <React.Fragment>
        <FormGroup>
          <ControlLabel>Brand</ControlLabel>

          <FormControl
            id="template-brand-id"
            componentClass="select"
            placeholder={__('Select Brand') as string}
            defaultValue={brandId}
          >
            {brands.map(brand => (
              <option key={brand._id} value={brand._id}>
                {brand.name}
              </option>
            ))}
          </FormControl>
        </FormGroup>

        <FormGroup>
          <ControlLabel>Name</ControlLabel>
          <FormControl id="template-name" type="text" required={true} />
        </FormGroup>

        <ModalFooter>
          <Button onClick={this.onSave} btnStyle="success" icon="checked-1">
            Save
          </Button>
        </ModalFooter>
      </React.Fragment>
    );
  };

  render() {
    const { trigger } = this.props;

    return (
      <ModalTrigger
        title="Create response template"
        trigger={trigger}
        content={this.renderForm}
      />
    );
  }
}

export default ResponseTemplateModal;
