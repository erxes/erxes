import {
  Button,
  ControlLabel,
  FormControl,
  FormGroup,
  ModalTrigger
} from "modules/common/components";
import { ModalFooter } from "modules/common/styles/main";
import { __ } from "modules/common/utils";
import * as React from "react";
import { IBrand } from "../../../../settings/brands/types";

type Props = {
  onSave: (brandId, name) => void;
  brands: IBrand[];
  trigger: JSX.Element;
  brandId: string;
};

class ResponseTemplateModal extends React.Component<Props, {}> {
  constructor(props) {
    super(props);

    this.onSave = this.onSave.bind(this);
  }

  onSave() {
    const doc = {
      brandId: (document.getElementById(
        "template-brand-id"
      ) as HTMLInputElement).value,
      name: (document.getElementById("template-name") as HTMLInputElement).value
    };

    this.props.onSave(doc.brandId, doc.name);
  }

  render() {
    const { brands, trigger, brandId } = this.props;

    return (
      <ModalTrigger title="Create response template" trigger={trigger}>
        <FormGroup>
          <ControlLabel>Brand</ControlLabel>

          <FormControl
            id="template-brand-id"
            componentClass="select"
            placeholder={__("Select Brand") as string}
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
          <FormControl id="template-name" type="text" required />
        </FormGroup>

        <ModalFooter>
          <Button onClick={this.onSave} btnStyle="success" icon="checked-1">
            Save
          </Button>
        </ModalFooter>
      </ModalTrigger>
    );
  }
}

export default ResponseTemplateModal;
