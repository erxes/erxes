import { Header } from '@erxes/ui-settings/src/styles';
import {
  Button,
  DataWithLoader,
  Icon,
  ModalTrigger,
  SidebarList,
  Tip,
  Wrapper,
} from '@erxes/ui/src';
import { __, router } from '@erxes/ui/src/utils';
import CollapsibleList from '@erxes/ui/src/components/collapsibleList/CollapsibleList';
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import SegmentFilter from '../../containers/SegmentFilter';
import TagFilter from '../../containers/TagFilter';
import CategoryForm from '../../containers/carCategory/CategoryForm';
import { ICarCategory } from '../../types';

type Props = {
  queryParams: any;
  refetch: any;
  remove: (carCategoryId: string) => void;
  carCategories: ICarCategory[];
  totalCount: number;
  loading: boolean;
};

const { Section } = Wrapper.Sidebar;

const CategoryList = (props: Props) => {
  const { queryParams, remove, carCategories, totalCount, loading } = props;
  const location = useLocation();
  const navigate = useNavigate();

  const clearCategoryFilter = () => {
    router.setParams(navigate, location, { categoryId: null });
  };

  const renderFormTrigger = (
    trigger: React.ReactNode,
    category?: ICarCategory
  ) => {
    const content = (props) => (
      <CategoryForm {...props} category={category} categories={carCategories} />
    );

    return (
      <ModalTrigger
        title={__('Add category')}
        trigger={trigger}
        content={content}
      />
    );
  };

  const renderEditAction = (category: ICarCategory) => {
    const trigger = (
      <Button btnStyle="link">
        <Tip text={__('Edit')} placement="bottom">
          <Icon icon="edit" />
        </Tip>
      </Button>
    );

    return renderFormTrigger(trigger, category);
  };

  const renderRemoveAction = (category: ICarCategory) => {
    return (
      <Button btnStyle="link" onClick={remove.bind(null, category._id)}>
        <Tip text={__('Remove')} placement="bottom">
          <Icon icon="cancel-1" />
        </Tip>
      </Button>
    );
  };

  const handleClick = (categoryId) => {
    router.removeParams(navigate, location, 'page');
    router.setParams(navigate, location, { categoryId: categoryId });
  };

  const renderContent = () => {
    return (
      <SidebarList>
        <CollapsibleList
          items={carCategories}
          editAction={renderEditAction}
          removeAction={renderRemoveAction}
          loading={loading}
          queryParams={queryParams}
          queryParamName="categoryId"
          treeView={true}
          keyCount="carCount"
          onClick={handleClick}
        />
      </SidebarList>
    );
  };

  const renderCategoryList = () => {
    return (
      <DataWithLoader
        data={renderContent()}
        loading={loading}
        count={totalCount}
        emptyText={__('There is no car category')}
        emptyIcon="folder-2"
        size="small"
      />
    );
  };

  const renderCategoryHeader = () => {
    const trigger = (
      <Button
        btnStyle="success"
        uppercase={false}
        icon="plus-circle"
        block={true}
      >
        Add category
      </Button>
    );

    return (
      <>
        <Header>{renderFormTrigger(trigger)}</Header>
        <Section.Title>
          {__('Categories')}
          <Section.QuickButtons>
            {router.getParam(location, 'categoryId') && (
              <a href="#cancel" tabIndex={0} onClick={clearCategoryFilter}>
                <Tip text={__('Clear filter')} placement="bottom">
                  <Icon icon="times-circle" />
                </Tip>
              </a>
            )}
          </Section.QuickButtons>
        </Section.Title>
      </>
    );
  };

  return (
    <>
      {renderCategoryHeader()}
      {renderCategoryList()}
      <SegmentFilter loadingMainQuery={loading} />
      <TagFilter />
    </>
  );
};

export default CategoryList;
