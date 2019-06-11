import {
  Button,
  ButtonMutate,
  ControlLabel,
  Form,
  FormControl,
  FormGroup
} from 'modules/common/components';
import { ModalFooter } from 'modules/common/styles/main';
import { __ } from 'modules/common/utils';
import * as React from 'react';
import Toggle from 'react-toggle';
import { IFormProps } from '../../../common/types';
import { mutations } from '../graphql';
import { IFieldGroup } from '../types';

type Props = {
  group?: IFieldGroup;
  type: string;
  refetchQueries: any;
  closeModal: () => void;
};

type State = {
  isVisible: boolean;
  isSubmitted: boolean;
  mutation: string;
};

class PropertyGroupForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    let isVisible = true;
    let mutation = mutations.fieldsGroupsAdd;

    if (props.group) {
      isVisible = props.group.isVisible;
      mutation = mutations.fieldsGroupsEdit;
    }

    this.state = {
      isVisible,
      isSubmitted: false,
      mutation
    };
  }

  onSubmit = () => {
    this.setState({ isSubmitted: true });
  };

  generateDoc = (values: {
    _id?: string;
    name: string;
    description: string;
  }) => {
    const { group, type } = this.props;
    const finalValues = values;

    if (group) {
      finalValues._id = group._id;
    }

    return {
      _id: finalValues._id,
      name: finalValues.name,
      description: finalValues.description,
      contentType: type,
      isVisible: this.state.isVisible
    };
  };

  visibleHandler = e => {
    const isVisible = e.target.checked;

    this.setState({ isVisible });
  };

  renderFieldVisible() {
    if (!this.props.group) {
      return;
    }

    return (
      <FormGroup>
        <ControlLabel>Visible</ControlLabel>
        <div>
          <Toggle
            checked={this.state.isVisible}
            onChange={this.visibleHandler}
            icons={{
              checked: <span>Yes</span>,
              unchecked: <span>No</span>
            }}
          />
        </div>
      </FormGroup>
    );
  }

  renderContent = (formProps: IFormProps) => {
    const { group, closeModal, refetchQueries } = this.props;

    const object = group || ({} as IFieldGroup);

    return (
      <>
        <FormGroup>
          <ControlLabel required={true}>Name</ControlLabel>
          <FormControl
            {...formProps}
            name="name"
            autoFocus={true}
            required={true}
            defaultValue={object.name || ''}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel required={true}>Description</ControlLabel>
          <FormControl
            {...formProps}
            name="description"
            required={true}
            defaultValue={object.description || ''}
          />
        </FormGroup>

        {this.renderFieldVisible()}

        <ModalFooter>
          <Button btnStyle="simple" onClick={closeModal} icon="cancel-1">
            Close
          </Button>

          <ButtonMutate
            mutation={this.state.mutation}
            variables={this.generateDoc(formProps.values)}
            callback={closeModal}
            refetchQueries={refetchQueries}
            isSubmitted={this.state.isSubmitted}
            type="submit"
            icon="checked-1"
            successMessage={`You successfully ${
              group ? 'updated' : 'added'
            } a group.`}
          >
            {__('Save')}
          </ButtonMutate>
        </ModalFooter>
      </>
    );
  };

  render() {
    return <Form renderContent={this.renderContent} onSubmit={this.onSubmit} />;
  }
}

export default PropertyGroupForm;
