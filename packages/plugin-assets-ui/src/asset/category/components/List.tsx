import { SidebarListItem, ActionButtons } from '@erxes/ui-settings/src/styles';
import {
  Box,
  Button,
  DataWithLoader,
  Icon,
  ModalTrigger,
  SidebarList,
  Spinner,
  Tip,
  __
} from '@erxes/ui/src';
import React from 'react';
import { IAssetCategoryTypes } from '../../../common/types';
import { ContainerBox } from '../../../style';
import Form from '../containers/Form';
import { Link } from 'react-router-dom';
import AssetStatusFilter from './StatusFilter';
import { router } from '@erxes/ui/src/utils/core';

type Props = {
  assetCategories: IAssetCategoryTypes[];
  totalCount: number;
  loading: boolean;
  remove: (_id) => any;
  refetchAssetCategories: () => void;
  queryParams: any;
  history: any;
};

class List extends React.Component<Props> {
  addFormTrigger = (
    <Button btnStyle="success" icon="plus-circle" block>
      Add Category
    </Button>
  );

  renderFormContent = props => {
    const { refetchAssetCategories, assetCategories } = this.props;

    const updatedProps = {
      ...props,
      refetchAssetCategories,
      categories: assetCategories
    };

    return <Form {...updatedProps} />;
  };

  renderAddForm() {
    return (
      <ModalTrigger
        title="Add Asset Category"
        trigger={this.addFormTrigger}
        content={this.renderFormContent}
      />
    );
  }

  renderEditAction(category) {
    const trigger = (
      <Button btnStyle="link">
        <Tip text="Edit">
          <Icon icon="edit" />
        </Tip>
      </Button>
    );

    const content = props => {
      const { refetchAssetCategories, assetCategories } = this.props;

      const updatedProps = {
        ...props,
        refetchAssetCategories,
        category,
        categories: assetCategories
      };

      return <Form {...updatedProps} />;
    };

    return (
      <ModalTrigger
        isAnimate
        title="Edit Asset Category"
        content={content}
        trigger={trigger}
      />
    );
  }

  renderRemoveAction(_id) {
    const { remove } = this.props;

    return (
      <Button btnStyle="link" onClick={() => remove(_id)}>
        <Tip text="remove" placement="bottom">
          <Icon icon="cancel-1" />
        </Tip>
      </Button>
    );
  }
  isActive = (id: string) => {
    const { queryParams } = this.props;
    const currentCategory = queryParams.categoryId || '';

    return currentCategory === id;
  };

  renderContent() {
    const { assetCategories, loading } = this.props;

    if (loading) {
      return <Spinner objective />;
    }

    const result: React.ReactNode[] = [];

    for (const category of assetCategories) {
      const order = category.order;

      const m = order.match(/[/]/gi);

      let space = '';

      if (m) {
        space = '\u00a0\u00a0'.repeat(m.length);
      }
      const name = category.isRoot ? (
        `${category.name} (${category.assetCount})`
      ) : (
        <span>
          {category.name} ({category.assetCount})
        </span>
      );

      result.push(
        <SidebarListItem
          key={category._id}
          isActive={this.isActive(category._id)}
        >
          <Link to={`?categoryId=${category._id}`}>
            {space}
            {name}
          </Link>
          <ActionButtons>
            {this.renderEditAction(category)}
            {this.renderRemoveAction(category._id)}
          </ActionButtons>
        </SidebarListItem>
      );
    }
    return result;
  }

  renderCategoryList() {
    const { totalCount, loading } = this.props;

    return (
      <SidebarList>
        <DataWithLoader
          data={this.renderContent()}
          loading={loading}
          count={totalCount}
          emptyText="There is no asset category"
          emptyIcon="folder-2"
          size="small"
        />
      </SidebarList>
    );
  }

  clearCategoryFilter = () => {
    router.setParams(this.props.history, { categoryId: null });
  };

  clearSelectedCategoryButton = (
    <Button btnStyle="link">
      {router.getParam(this.props.history, 'categoryId') && (
        <a href="#cancel" tabIndex={0} onClick={this.clearCategoryFilter}>
          <Tip text={__('Clear filter')} placement="bottom">
            <Icon icon="cancel-1" />
          </Tip>
        </a>
      )}
    </Button>
  );

  renderAssetCategories() {
    return (
      <Box
        title="Asset Category"
        extraButtons={this.clearSelectedCategoryButton}
        name="assetCategory"
      >
        {this.renderCategoryList()}
      </Box>
    );
  }

  render() {
    return (
      <ContainerBox gap={15} column>
        {this.renderAddForm()}
        {this.renderAssetCategories()}
        <AssetStatusFilter />
      </ContainerBox>
    );
  }
}

export default List;
