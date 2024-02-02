import { Categories } from './styles';
import CategoryRow from './CategoryRow';
import { ICategory } from '@erxes/ui-knowledgebase/src/types';
import React from 'react';

type Props = {
  currentCategoryId: string;
  topicId: string;
  categories: ICategory[];
  remove: (categoryId: string) => void;
  queryParams?: any;
};

const getParents = (array: any[]) => {
  const key = 'parentCategoryId';

  return array.reduce((rv, x) => {
    (rv[x[key]] = rv[x[key]] || []).push(x);

    return rv;
  }, {});
};

const CategoryList = (props: Props) => {
  const { categories, remove, currentCategoryId, topicId, queryParams } = props;

  const subFields = categories.filter((f) => f.parentCategoryId);
  const parents = categories.filter((f) => !f.parentCategoryId);
  const groupByParent = getParents(subFields);

  const renderRow = (category, isChild, isParent?) => {
    return (
      <CategoryRow
        key={category._id}
        isActive={currentCategoryId === category._id}
        topicId={topicId}
        category={category}
        queryParams={queryParams}
        remove={remove}
        isChild={isChild}
        isParent={isParent}
      />
    );
  };

  return (
    <Categories>
      {parents.map((category) => {
        const childrens = groupByParent[category._id] || [];

        return (
          <React.Fragment key={category._id}>
            {renderRow(category, false, childrens.length !== 0)}
            {childrens.map((child) => renderRow(child, true))}
          </React.Fragment>
        );
      })}
    </Categories>
  );
};

export default CategoryList;
