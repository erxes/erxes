import Modal from 'react-bootstrap/Modal';
import React from 'react';
import Select from 'react-select-plus';
import { Button, ControlLabel, FormControl, FormGroup } from '@erxes/ui/src';
import SelectProducts from '@erxes/ui-products/src/containers/SelectProducts';
import { IProductCategory } from '@erxes/ui-products/src/types';
import { IProductGroup } from '../../../types';

type Props = {
  group?: IProductGroup;
  onSubmit: (group: IProductGroup) => void;
  onDelete: (group: IProductGroup) => void;
  closeModal: () => void;
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

    this.state = {
      group: props.group || {
        _id: `temporaryId${String(Math.random())}`,
        name: '',
        description: '',
        categoryIds: [],
        excludedCategoryIds: [],
        excludedProductIds: []
      },
      categories: props.categories
    };
  }

  onChangeFunction = (name: any, value: any) => {
    const { group } = this.state;
    group[name] = value;
    this.setState({ group });
  };

  onClicksave = () => {
    this.props.onSubmit(this.state.group);
    this.props.closeModal();
  };

  onClickCancel = () => {
    this.props.closeModal();
  };

  render() {
    const { mode } = this.props;
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

    const onChangeExcludeProducts = values => {
      this.onChangeFunction('excludedProductIds', values);
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
          <Select
            options={categoryOptions.filter(
              e => !categoryIds.includes(e.value)
            )}
            value={group.excludedCategoryIds}
            onChange={onChangeExcludeCategories}
            multi={true}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>Exclude Products</ControlLabel>
          <SelectProducts
            label={'exclude products'}
            name="excludeProductsIds"
            initialValue={group.excludedProductIds}
            onSelect={onChangeExcludeProducts}
            multi={true}
          />
        </FormGroup>
        <Modal.Footer>
          <Button
            btnStyle="simple"
            type="button"
            icon="times-circle"
            onClick={this.onClickCancel}
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
