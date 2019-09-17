import Button from 'modules/common/components/Button';
import FormControl from 'modules/common/components/form/Control';
import CommonForm from 'modules/common/components/form/Form';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import { IButtonMutateProps, IFormProps } from 'modules/common/types';
import React from 'react';
import { Modal } from 'react-bootstrap';
import { IProductCategory } from '../../types';

type Props = {
  categories: IProductCategory[];
  category?: IProductCategory;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
};

class Form extends React.Component<Props> {
  generateCategoriesChoices = () => {
    return this.props.categories.map(category => ({
      value: category._id,
      label: category.name
    }));
  };

  renderContent = (formProps: IFormProps) => {
    const { renderButton, closeModal, category } = this.props;
    const { values, isSubmitted } = formProps;

    const object = category || ({} as IProductCategory);

    if (category) {
      values._id = category._id;
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
          <ControlLabel required={true}>Code</ControlLabel>
          <FormControl
            {...formProps}
            name="code"
            defaultValue={object.description}
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

        <FormGroup>
          <ControlLabel>Category</ControlLabel>

          <FormControl
            {...formProps}
            name="parentId"
            componentClass="select"
            defaultValue={object.parentId}
            options={[
              { value: '', label: '' },
              ...this.generateCategoriesChoices()
            ]}
          />
        </FormGroup>

        <Modal.Footer>
          <Button btnStyle="simple" onClick={closeModal} icon="cancel-1">
            Close
          </Button>

          {renderButton({
            name: 'product & service category',
            values,
            isSubmitted,
            callback: closeModal,
            object: category
          })}
        </Modal.Footer>
      </>
    );
  };

  render() {
    return <CommonForm renderContent={this.renderContent} />;
  }
}

export default Form;
