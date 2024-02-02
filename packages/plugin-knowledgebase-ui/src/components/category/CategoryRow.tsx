import { ActionButtons } from '@erxes/ui-settings/src/styles';
import Button from '@erxes/ui/src/components/Button';
import CategoryForm from '../../containers/category/CategoryForm';
import { CategoryItem } from './styles';
import { ICategory } from '@erxes/ui-knowledgebase/src/types';
import Icon from '@erxes/ui/src/components/Icon';
import { Link } from 'react-router-dom';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import React from 'react';
import Tip from '@erxes/ui/src/components/Tip';
import { __ } from '@erxes/ui/src/utils/core';

type Props = {
  topicId: string;
  category: ICategory;
  remove: (categoryId: string) => void;
  isActive: boolean;
  isChild?: boolean;
  isParent?: boolean;
  queryParams?: any;
};

const CategoryRow = (props: Props) => {
  const {
    category,
    topicId,
    isActive,
    isChild,
    isParent,
    queryParams,
    remove,
  } = props;

  const handleRemove = () => {
    remove(category._id);
  };

  const renderEditForm = (formProps) => {
    return <CategoryForm queryParams={queryParams} {...formProps} />;
  };

  const renderEditAction = () => {
    const editTrigger = (
      <Button btnStyle="link">
        <Tip text={__('Edit')} placement="bottom">
          <Icon icon="edit" />
        </Tip>
      </Button>
    );

    const content = (modalProps) => {
      return renderEditForm({ ...modalProps, category, topicId });
    };

    return (
      <ModalTrigger
        size="lg"
        title="Edit"
        trigger={editTrigger}
        content={content}
      />
    );
  };

  return (
    <CategoryItem key={category._id} isActive={isActive} isChild={isChild}>
      <Link to={`?id=${category._id}`}>
        <div>
          {category.title}
          <span>({category.articles.length})</span>
        </div>
        {isParent && <Icon icon="angle-down" />}
      </Link>
      <ActionButtons>
        {renderEditAction()}
        <Tip text={__('Delete')} placement="bottom">
          <Button btnStyle="link" onClick={handleRemove} icon="cancel-1" />
        </Tip>
      </ActionButtons>
    </CategoryItem>
  );
};

export default CategoryRow;
