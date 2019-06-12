import {
  Button,
  ButtonMutate,
  ControlLabel,
  Form,
  FormControl,
  FormGroup
} from 'modules/common/components';
import { ModalFooter } from 'modules/common/styles/main';
import { IFormProps } from 'modules/common/types';
import { __, generateRandomColorCode } from 'modules/common/utils';
import { ITag } from 'modules/tags/types';
import * as React from 'react';
import { mutations } from '../graphql';

type Props = {
  tag?: ITag;
  type: string;
  refetchQueries: any;
  closeModal: () => void;
};

type State = {
  isSubmitted: boolean;
};

class FormComponent extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      isSubmitted: false
    };
  }

  submit = () => {
    this.setState({ isSubmitted: true });
  };

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

  getMutation = () => {
    if (this.props.tag) {
      return mutations.edit;
    }

    return mutations.add;
  };

  renderContent = (formProps: IFormProps) => {
    const { tag, refetchQueries, closeModal } = this.props;
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

          <ButtonMutate
            mutation={this.getMutation()}
            variables={this.generateDoc(formProps.values)}
            callback={closeModal}
            refetchQueries={refetchQueries}
            isSubmitted={this.state.isSubmitted}
            type="submit"
            icon="checked-1"
            successMessage={`You successfully ${
              tag ? 'updated' : 'added'
            } a tag.`}
          >
            {__('Save')}
          </ButtonMutate>
        </ModalFooter>
      </>
    );
  };

  render() {
    return <Form renderContent={this.renderContent} onSubmit={this.submit} />;
  }
}

export default FormComponent;
