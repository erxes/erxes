import Button from 'modules/common/components/Button';
import FormControl from 'modules/common/components/form/Control';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import { ModalFooter } from 'modules/common/styles/main';
import { IAttachment } from 'modules/common/types';
import { __, Alert } from 'modules/common/utils';
import { IBrand } from 'modules/settings/brands/types';
import { SaveResponseTemplateMutationVariables } from 'modules/settings/responseTemplates/types';
import React from 'react';

type Props = {
  saveResponseTemplate: (
    doc: SaveResponseTemplateMutationVariables,
    callback: (error?: Error) => void
  ) => void;
  brands: IBrand[];
  trigger: React.ReactNode;
  brandId?: string;
  files?: IAttachment[];
  content?: string;
};

class Modal extends React.Component<Props, {}> {
  onSave = () => {
    const { content, files } = this.props;

    const doc = {
      content,
      files,
      brandId: (document.getElementById(
        'template-brand-id'
      ) as HTMLInputElement).value,
      name: (document.getElementById('template-name') as HTMLInputElement).value
    };

    this.props.saveResponseTemplate(doc, error => {
      if (error) {
        return Alert.error(error.message);
      }

      const element = document.querySelector('button.close') as HTMLElement;

      return element.click();
    });
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
          <Button onClick={this.onSave} btnStyle="success" icon="check-circle">
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

export default Modal;
