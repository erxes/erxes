import { Categories } from './styles';
import CategoryRow from './CategoryRow';
import { ICategory } from '@erxes/ui-knowledgeBase/src/types';
import React from 'react';

type Props = {
  currentCategoryId: string;
  topicId: string;
  categories: ICategory[];
  remove: (categoryId: string) => void;
  queryParams?: any;
};

class CategoryList extends React.Component<Props> {
  groupByParent = (array: any[]) => {
    const key = 'parentCategoryId';

    return array.reduce((rv, x) => {
      (rv[x[key]] = rv[x[key]] || []).push(x);

      return rv;
    }, {});
  };

  renderRow(category, isChild, isParent?) {
    const { remove, currentCategoryId, topicId, queryParams } = this.props;

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
  }

  render() {
    const { categories } = this.props;

    const subFields = categories.filter(f => f.parentCategoryId);
    const parents = categories.filter(f => !f.parentCategoryId);

    const groupByParent = this.groupByParent(subFields);

    return (
      <Categories>
        {parents.map(category => {
          const childrens = groupByParent[category._id] || [];

          return (
            <React.Fragment key={category._id}>
              {this.renderRow(category, false, childrens.length !== 0)}
              {childrens.map(child => this.renderRow(child, true))}
            </React.Fragment>
          );
        })}
      </Categories>
    );
  }
}

export default CategoryList;
