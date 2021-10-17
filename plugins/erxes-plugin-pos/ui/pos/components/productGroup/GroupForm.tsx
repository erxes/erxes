import { Button, FormControl, FormGroup, ControlLabel } from 'erxes-ui';
import React from 'react';
import { IProductGroup } from '../../../types';
import Modal from 'react-bootstrap/Modal';
import { Description } from '../../../styles';
import Select from 'react-select-plus';
import { IProductCategory } from 'erxes-ui/lib/products/types';

type Props = {
  group: IProductGroup;
  onSubmit: (group: IProductGroup) => void;
  onDelete: (group: IProductGroup) => void;
  onCancel: () => void;
  mode: 'create' | 'update';
  categories: IProductCategory[];
};

type State = {
  group: IProductGroup;
  categories: IProductCategory[];
};

class GroupForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    console.log(props)

    this.state = {
      group: props.group,
      categories: props.categories
    };
  }

  onChangeCategories = values => {
    console.log(values);
  };

  render() {
    const { mode, onDelete, onSubmit, onCancel } = this.props;
    const { group, categories } = this.state;

    const categoryOptions = categories.map(e => {
      return { value: e._id, label: e.name };
    });

    return (
      <>
        <FormGroup>
          <ControlLabel required={true}>Group Name</ControlLabel>

          <FormControl
            name="name"
            defaultValue={group.name}
            required={true}
            autoFocus={true}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Group Description</ControlLabel>

          <FormControl
            name="description"
            componentClass="textarea"
            rows={5}
            defaultValue={group.description}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Product Category</ControlLabel>
          {/* <Description>Select pos to display in the product category.</Description> */}
          <Select
            options={categories}
            value={categoryOptions}
            onChange={this.onChangeCategories}
            multi={true}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Exclude Product Category</ControlLabel>
          {/* <Description>Select pos to display in the product category.</Description> */}
          <Select
            options={categories}
            value={categoryOptions}
            onChange={this.onChangeCategories}
            multi={true}
          />
        </FormGroup>

        <Modal.Footer>
          <Button
            btnStyle="simple"
            type="button"
            icon="times-circle"
            onClick={onCancel}
          >
            Cancel
          </Button>

          <Button
            onClick={onSubmit}
            btnStyle="success"
            icon={mode === 'update' ? 'check-circle' : 'plus-circle'}
          >
            {mode === 'update' ? 'Save' : 'Add to Form'}
          </Button>
        </Modal.Footer>
      </>
    );
  }
}

export default GroupForm;
