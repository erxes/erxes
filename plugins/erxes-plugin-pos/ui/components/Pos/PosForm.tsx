import {
  generateCategoryOptions,
  MainStyleModalFooter as ModalFooter,
  Button,
  Form as CommonForm,
  ControlLabel,
  FormControl,
  FormGroup
} from 'erxes-ui';
import { IButtonMutateProps, IFormProps } from 'erxes-ui/lib/types';
import React from 'react';
import { IPos } from '../../types';

type Props = {
  pos?: IPos;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
};

class PosForm extends React.Component<Props> {
  renderContent = (formProps: IFormProps) => {
    const { renderButton, closeModal, pos } = this.props;
    const { values, isSubmitted } = formProps;

    const object = pos || ({} as IPos);

    if (pos) {
      values._id = pos._id;
    }

    return (
      <>
        <FormGroup>
          <ControlLabel required={true}>Name</ControlLabel>
          <FormControl
            {...formProps}
            name="name"
            defaultValue={object.name}
            autoFocus={true}
            required={true}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Description</ControlLabel>
          <FormControl
            {...formProps}
            name="description"
            componentClass="textarea"
            rows={5}
            defaultValue={object.description}
          />
        </FormGroup>

        <ModalFooter>
          <Button
            btnStyle="simple"
            onClick={closeModal}
            icon="times-circle"
            uppercase={false}
          >
            Close
          </Button>

          {renderButton({
            name: 'pos',
            values,
            isSubmitted,
            callback: closeModal,
            object: pos
          })}
        </ModalFooter>
      </>
    );
  };

  render() {
    return <CommonForm renderContent={this.renderContent} />;
  }
}

export default PosForm;
