import CatProdItem from '../../components/productGroup/CatProdItem';
import GroupForm from '../../components/productGroup/GroupForm';
import React from 'react';
import { CatProd, IPos, IProductGroup } from '../../../types';
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
import SelectProductCategory from '@erxes/ui-products/src/containers/SelectProductCategory';

type Props = {
  onChange: (name: 'pos' | 'description' | 'groups', value: any) => void;
  pos: IPos;
  groups: IProductGroup[];
  catProdMappings: CatProd[];
};

type State = {
  groups: IProductGroup[];
  currentMode: 'create' | 'update' | undefined;
  mappings: CatProd[];
  initialCategoryIds: string[];
  kioskExcludeCategoryIds: string[];
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
      kioskExcludeCategoryIds: (pos && pos.kioskExcludeCategoryIds) || [],
      kioskExcludeProductIds: (pos && pos.kioskExcludeProductIds) || []
    };
  }

  onSubmitGroup = (group: IProductGroup) => {
    const { groups } = this.state;
    const newGroups = [...groups];

    const index = groups.findIndex(e => e._id === group._id);

    if (index !== -1) {
      newGroups[index] = group;
    } else {
      newGroups.push(group);
    }

    this.props.onChange('groups', newGroups);
  };

  renderGroupFormTrigger(trigger: React.ReactNode, group?: IProductGroup) {
    const content = props => (
      <GroupForm {...props} group={group} onSubmit={this.onSubmitGroup} />
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

  renderMapping(mapping: CatProd, index: number) {
    const { pos, onChange } = this.props;

    const cleanFields = (cat: CatProd) => ({
      _id: cat._id,
      categoryId: cat.categoryId,
      productId: cat.productId,
      code: cat.code || '',
      name: cat.name || ''
    });

    // for omitting react __typename field
    const mappings = this.state.mappings.map(m => ({
      _id: m._id,
      categoryId: m.categoryId,
      productId: m.productId,
      code: m.code || '',
      name: m.name || ''
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
        index={index}
        key={mapping._id}
      />
    );
  }

  onChangeInitialCategory = values => {
    const { pos, onChange } = this.props;
    const initialCategoryIds = values;
    this.setState({ initialCategoryIds });

    pos.initialCategoryIds = initialCategoryIds;
    onChange('pos', pos);
  };

  onChangekioskExclude = (name, ids) => {
    const { pos, onChange } = this.props;
    this.setState({ [name]: ids } as any);

    pos[name] = ids;
    onChange('pos', pos);
  };

  render() {
    const { groups } = this.props;
    const {
      mappings = [],
      initialCategoryIds,
      kioskExcludeCategoryIds,
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
                <SelectProductCategory
                  label="Choose product category"
                  name="productCategoryId"
                  initialValue={initialCategoryIds}
                  customOption={{
                    value: '',
                    label: '...Clear product category filter'
                  }}
                  onSelect={categoryIds =>
                    this.onChangeInitialCategory(categoryIds)
                  }
                  multi={true}
                />
              </FormGroup>
            </Block>

            <Block>
              <h4>{__('kiosk exclude products')}</h4>
              <FormGroup>
                <ControlLabel>Categories</ControlLabel>
                <SelectProductCategory
                  label={'kiosk'}
                  name="kioskExcludeCategoryIds"
                  initialValue={kioskExcludeCategoryIds}
                  onSelect={categoryIds =>
                    this.onChangekioskExclude(
                      'kioskExcludeCategoryIds',
                      categoryIds
                    )
                  }
                  multi={true}
                />
              </FormGroup>
              <FormGroup>
                <ControlLabel>Products</ControlLabel>
                <SelectProducts
                  label={'kiosk'}
                  name="kioskExcludeProductIds"
                  initialValue={kioskExcludeProductIds}
                  onSelect={productIds =>
                    this.onChangekioskExclude(
                      'kioskExcludeProductIds',
                      productIds
                    )
                  }
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
                {mappings.map((item, index) => this.renderMapping(item, index))}
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
