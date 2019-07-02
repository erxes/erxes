import {
  Button,
  ControlLabel,
  Form,
  FormControl,
  FormGroup
} from 'modules/common/components';
import { ModalFooter } from 'modules/common/styles/main';
import { IButtonMutateProps, IFormProps } from 'modules/common/types';
import { __, generateRandomColorCode } from 'modules/common/utils';
import { ITag } from 'modules/tags/types';
import * as React from 'react';

type Props = {
  tag?: ITag;
  type: string;
  afterSave: () => void;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal?: () => void;
};

class FormComponent extends React.Component<Props> {
  generateDoc = (values: { _id?: string; name: string; colorCode: string }) => {
    const { tag, type } = this.props;
    const finalValues = values;

    if (tag) {
      finalValues._id = tag._id;
    }

    return {
      _id: finalValues._id,
      name: finalValues.name,
      colorCode: finalValues.colorCode,
      type
    };
  };

  renderContent = (formProps: IFormProps) => {
    const { tag, closeModal, afterSave, renderButton } = this.props;
    const { values, isSubmitted } = formProps;
    const object = tag || ({} as ITag);

    return (
      <>
        <FormGroup>
          <ControlLabel required={true}>Name</ControlLabel>
          <FormControl
            {...formProps}
            name="name"
            defaultValue={object.name}
            required={true}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Color code</ControlLabel>
          <FormControl
            {...formProps}
            type="color"
            name="colorCode"
            defaultValue={object.colorCode || generateRandomColorCode()}
          />
        </FormGroup>

        <ModalFooter>
          <Button btnStyle="simple" onClick={closeModal} icon="cancel-1">
            Cancel
          </Button>

          {renderButton({
            name: 'tag',
            values: this.generateDoc(values),
            isSubmitted,
            callback: closeModal || afterSave,
            object: tag
          })}
        </ModalFooter>
      </>
    );
  };

  render() {
    return <Form renderContent={this.renderContent} />;
  }
}

export default FormComponent;
