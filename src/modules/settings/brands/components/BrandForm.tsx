import {
  Button,
  ControlLabel,
  Form,
  FormControl,
  FormGroup
} from 'modules/common/components';
import ButtonMutate from 'modules/common/components/ButtonMutate';
import { ModalFooter } from 'modules/common/styles/main';
import { IFormProps } from 'modules/common/types';
import * as React from 'react';
import { mutations } from '../graphql';
import { IBrand } from '../types';

type Props = {
  brand?: IBrand;
  closeModal: () => void;
  refetchQueries: any;
};

class BrandForm extends React.Component<Props, { isSubmitted: boolean }> {
  constructor(props: Props) {
    super(props);

    this.state = {
      isSubmitted: false
    };
  }

  onSubmit = () => {
    this.setState({ isSubmitted: true });
  };

  getMutation = () => {
    if (this.props.brand) {
      return mutations.brandEdit;
    }

    return mutations.brandAdd;
  };

  renderContent = (formProps: IFormProps) => {
    const { brand, closeModal, refetchQueries } = this.props;
    const object = brand || ({} as IBrand);

    const finalValues = formProps.values;

    if (brand) {
      finalValues._id = brand._id;
    }

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
            type="button"
            icon="cancel-1"
            onClick={closeModal}
          >
            Cancel
          </Button>

          <ButtonMutate
            mutation={this.getMutation()}
            variables={finalValues}
            callback={closeModal}
            refetchQueries={refetchQueries}
            isSubmitted={this.state.isSubmitted}
            type="submit"
            icon="checked-1"
            successMessage={`You successfully ${
              brand ? 'updated' : 'added'
            } a brand.`}
          >
            Save
          </ButtonMutate>
        </ModalFooter>
      </>
    );
  };

  render() {
    return <Form renderContent={this.renderContent} onSubmit={this.onSubmit} />;
  }
}

export default BrandForm;
