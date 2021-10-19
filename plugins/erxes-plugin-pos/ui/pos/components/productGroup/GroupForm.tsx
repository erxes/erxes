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
  closeModal: () => void;
  mode: 'create' | 'update';
  categories: any[];
};

type State = {
  group: IProductGroup;
  categories: IProductCategory[];
};

class GroupForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      group: props.group,
      categories: props.categories
    };
  }

  onChangeFunction = (name: any, value: any) => {
    const { group } = this.state;
    group[name] = value;
    this.setState({ group });
  };

  onClicksave = () => {
    console.log(this.state.group);
    this.props.onSubmit(this.state.group);
    this.props.closeModal();
  };

  render() {
    const { mode, onDelete, onSubmit, onCancel } = this.props;
    const { group, categories } = this.state;

    const categoryOptions = categories.map(e => {
      return { value: e._id, label: e.name };
    });

    const categoryIds = group.categoryIds || [];
    const excludedCategoryIds = group.excludedCategoryIds || [];

    const onChangeName = e => {
      this.onChangeFunction(
        'name',
        (e.currentTarget as HTMLInputElement).value
      );
    };

    const onChangeDescription = e => {
      this.onChangeFunction(
        'description',
        (e.currentTarget as HTMLInputElement).value
      );
    };

    const onChangeCategories = values => {
      this.onChangeFunction(
        'categoryIds',
        values.map(e => e.value)
      );
    };

    const onChangeExcludeCategories = values => {
      this.onChangeFunction(
        'excludedCategoryIds',
        values.map(e => e.value)
      );
    };

    return (
      <>
        <FormGroup>
          <ControlLabel required={true}>Group Name</ControlLabel>

          <FormControl
            name="name"
            defaultValue={group.name}
            required={true}
            autoFocus={true}
            onChange={onChangeName}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Group Description</ControlLabel>

          <FormControl
            name="description"
            componentClass="textarea"
            rows={5}
            defaultValue={group.description}
            onChange={onChangeDescription}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Product Category</ControlLabel>
          {/* <Description>Select pos to display in the product category.</Description> */}
          <Select
            options={categoryOptions.filter(
              e => !excludedCategoryIds.includes(e.value)
            )}
            value={group.categoryIds}
            onChange={onChangeCategories}
            multi={true}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Exclude Product Category</ControlLabel>
          {/* <Description>Select pos to display in the product category.</Description> */}
          <Select
            options={categoryOptions.filter(
              e => !categoryIds.includes(e.value)
            )}
            value={group.excludedCategoryIds}
            onChange={onChangeExcludeCategories}
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
            onClick={this.onClicksave}
            btnStyle="success"
            icon={mode === 'update' ? 'check-circle' : 'plus-circle'}
          >
            {mode === 'update' ? 'Save' : 'Add to POS'}
          </Button>
        </Modal.Footer>
      </>
    );
  }
}

export default GroupForm;
