import CatProdItem from '../../components/productGroup/CatProdItem';
import GroupForm from '../../components/productGroup/GroupForm';
import React from 'react';
import Select from 'react-select-plus';
import { CatProd, IPos, IProductGroup } from '../../../types';
import { IProductCategory } from '@erxes/ui-products/src/types';
import { LeftItem } from '@erxes/ui/src/components/step/styles';
import {
  FormGroup,
  ControlLabel,
  Button,
  Icon,
  Tip,
  ModalTrigger,
  __
} from '@erxes/ui/src';
import SelectProducts from '@erxes/ui-products/src/containers/SelectProducts';
import {
  ActionButtons,
  Description,
  FlexColumn,
  FlexItem,
  Block,
  BlockRow
} from '../../../styles';

type Props = {
  onChange: (name: 'pos' | 'description' | 'groups', value: any) => void;
  pos?: IPos;
  groups: IProductGroup[];
  catProdMappings: CatProd[];
  productCategories: IProductCategory[];
};

type State = {
  groups: IProductGroup[];
  currentMode: 'create' | 'update' | undefined;
  mappings: CatProd[];
  initialCategoryIds: string[];
  kioskExcludeProductIds: string[];
};

export default class ConfigStep extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const { groups = [], pos } = props;

    this.state = {
      groups,
      currentMode: undefined,
      mappings: pos && pos.catProdMappings ? pos.catProdMappings : [],
      initialCategoryIds: (pos && pos.initialCategoryIds) || [],
      kioskExcludeProductIds: (pos && pos.kioskExcludeProductIds) || []
    };
  }

  onSubmitGroup = (group: IProductGroup) => {
    const { groups } = this.state;

    const index = groups.findIndex(e => e._id === group._id);

    if (index !== -1) {
      groups[index] = group;
    } else {
      groups.push(group);
    }

    this.props.onChange('groups', groups);
  };

  renderGroupFormTrigger(trigger: React.ReactNode, group?: IProductGroup) {
    const { productCategories } = this.props;

    const content = props => (
      <GroupForm
        {...props}
        group={group}
        onSubmit={this.onSubmitGroup}
        categories={productCategories}
      />
    );

    const title = group ? 'Edit group' : 'Add group';

    return <ModalTrigger title={title} trigger={trigger} content={content} />;
  }

  renderEditAction(group: IProductGroup) {
    const trigger = (
      <Button btnStyle="link" style={{ float: 'right' }}>
        <Tip text={__('Edit')} placement="bottom">
          <Icon icon="edit" />
        </Tip>
      </Button>
    );

    return this.renderGroupFormTrigger(trigger, group);
  }

  renderRemoveAction(group: IProductGroup) {
    const remove = () => {
      let { groups } = this.state;

      groups = groups.filter(e => e._id !== group._id);

      this.setState({ groups });
      this.props.onChange('groups', groups);
    };

    return (
      <Button btnStyle="link" onClick={remove} style={{ float: 'right' }}>
        <Tip text={__('Remove')} placement="bottom">
          <Icon icon="cancel-1" />
        </Tip>
      </Button>
    );
  }

  renderGroup(group: IProductGroup) {
    return (
      <FormGroup key={group._id}>
        <BlockRow>
          <ControlLabel>
            {group.name}
            <Description>{group.description}</Description>
          </ControlLabel>
          <ActionButtons>
            {this.renderEditAction(group)}
            {this.renderRemoveAction(group)}
          </ActionButtons>
        </BlockRow>
      </FormGroup>
    );
  }

  renderMapping(mapping: CatProd) {
    const { productCategories, pos, onChange } = this.props;

    const cleanFields = (cat: CatProd) => ({
      _id: cat._id,
      categoryId: cat.categoryId,
      productId: cat.productId
    });

    // for omitting react __typename field
    const mappings = this.state.mappings.map(m => ({
      _id: m._id,
      categoryId: m.categoryId,
      productId: m.productId
    }));

    const editMapping = (item: CatProd) => {
      const index = mappings.findIndex(i => i._id === item._id);
      const cleanItem = cleanFields(item);

      if (index !== -1) {
        mappings[index] = cleanItem;
      } else {
        mappings.push(cleanItem);
      }

      this.setState({ mappings });

      pos.catProdMappings = mappings;

      onChange('pos', pos);
    };

    const removeMapping = (_id: string) => {
      const excluded = mappings.filter(m => m._id !== _id);

      this.setState({ mappings: excluded });

      pos.catProdMappings = excluded;

      onChange('pos', pos);
    };

    return (
      <CatProdItem
        editMapping={editMapping}
        removeMapping={removeMapping}
        item={mapping}
        productCategories={productCategories}
        key={mapping._id}
      />
    );
  }

  onChangeInitialCategory = values => {
    const { pos, onChange } = this.props;
    const initialCategoryIds = values.map(v => v.value);
    this.setState({ initialCategoryIds });

    pos.initialCategoryIds = initialCategoryIds;
    onChange('pos', pos);
  };

  onChangekioskExcludeProduct = ids => {
    const { pos, onChange } = this.props;
    this.setState({ kioskExcludeProductIds: ids });

    pos.kioskExcludeProductIds = ids;
    onChange('pos', pos);
  };

  render() {
    const { groups, productCategories } = this.props;
    const {
      mappings = [],
      initialCategoryIds,
      kioskExcludeProductIds
    } = this.state;

    const groupTrigger = (
      <Button btnStyle="primary" icon="plus-circle">
        Add group
      </Button>
    );

    const onClick = () => {
      const m = mappings.slice();

      m.push({
        _id: Math.random().toString(),
        categoryId: '',
        productId: ''
      });

      this.setState({ mappings: m });
    };

    return (
      <FlexItem>
        <FlexColumn>
          <LeftItem>
            <Block>
              <h4>{__('Product Groups')}</h4>
              <FormGroup>
                {groups.map(group => this.renderGroup(group))}
              </FormGroup>

              {this.renderGroupFormTrigger(groupTrigger)}
            </Block>

            <Block>
              <h4>{__('Initial product categories')}</h4>
              <Description></Description>
              <FormGroup>
                <ControlLabel>Product Category</ControlLabel>
                <Select
                  options={productCategories.map(e => ({
                    value: e._id,
                    label: e.name
                  }))}
                  value={initialCategoryIds}
                  onChange={this.onChangeInitialCategory}
                  multi={true}
                />
              </FormGroup>
            </Block>

            <Block>
              <h4>{__('kiosk exclude products')}</h4>
              <FormGroup>
                <ControlLabel>Products</ControlLabel>
                <SelectProducts
                  label={'kiosk'}
                  name="kioskExcludeProductIds"
                  initialValue={kioskExcludeProductIds}
                  onSelect={this.onChangekioskExcludeProduct}
                  multi={true}
                />
              </FormGroup>
            </Block>

            <Block>
              <h4>{__('Product & category mappings')}</h4>
              <Description>
                Map a product to category. When a product within that category
                is sold in pos system with "take" option, then the mapped
                product will be added to the price.
              </Description>
              <FormGroup>
                {mappings.map(item => this.renderMapping(item))}
              </FormGroup>
              <Button btnStyle="primary" icon="plus-circle" onClick={onClick}>
                Add mapping
              </Button>
            </Block>
          </LeftItem>
        </FlexColumn>
      </FlexItem>
    );
  } // end render()
}
