import Modal from 'react-bootstrap/Modal';
import React from 'react';
import { Button, ControlLabel, FormControl, FormGroup } from '@erxes/ui/src';
import SelectProducts from '@erxes/ui-products/src/containers/SelectProducts';
import { IProductGroup } from '../../../types';
import SelectProductCategory from '@erxes/ui-products/src/containers/SelectProductCategory';

type Props = {
  group?: IProductGroup;
  onSubmit: (group: IProductGroup) => void;
  onDelete: (group: IProductGroup) => void;
  closeModal: () => void;
  mode: 'create' | 'update';
};

type State = {
  group: IProductGroup;
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
      }
    };
  }

  onChangeFunction = (name: any, value: any) => {
    const { group } = this.state;

    this.setState({ group: { ...group, [name]: value } });
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
    const { group } = this.state;

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

    const onChangeCategories = (field, values) => {
      this.onChangeFunction(field, values);
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
          <SelectProductCategory
            label="Choose product category"
            name="productCategoryId"
            initialValue={group.categoryIds}
            customOption={{
              value: '',
              label: '...Clear product category filter'
            }}
            onSelect={categoryIds =>
              onChangeCategories('categoryIds', categoryIds)
            }
            multi={true}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>Exclude Product Category</ControlLabel>
          <SelectProductCategory
            label="Choose product category"
            name="productCategoryId"
            initialValue={group.excludedCategoryIds}
            customOption={{
              value: '',
              label: '...Clear product category filter'
            }}
            onSelect={categoryIds =>
              onChangeCategories('excludedCategoryIds', categoryIds)
            }
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
