import React from 'react';
import { ICategory } from '../../types';
import CategoryRow from './CategoryRow';
import { Categories } from './styles';

type Props = {
  currentCategoryId: string;
  topicId: string;
  categories: ICategory[];
  articlesCount: number;
  remove: (categoryId: string) => void;
};

class CategoryList extends React.Component<Props> {
  groupByParent = (array: any[]) => {
    const key = 'parentCategoryId';

    return array.reduce((rv, x) => {
      (rv[x[key]] = rv[x[key]] || []).push(x);

      return rv;
    }, {});
  };

  render() {
    const {
      categories,
      remove,
      currentCategoryId,
      topicId,
      articlesCount
    } = this.props;

    const subFields = categories.filter(f => f.parentCategoryId);
    const parents = categories.filter(f => !f.parentCategoryId);

    const groupByParent = this.groupByParent(subFields);

    return (
      <Categories>
        {parents.map(category => {
          const childrens = groupByParent[category._id] || [];

          return (
            <>
              <CategoryRow
                isActive={currentCategoryId === category._id}
                articlesCount={articlesCount}
                topicId={topicId}
                category={category}
                remove={remove}
                isParent={childrens.length > 0}
              />
              {childrens &&
                childrens.map(child => (
                  <CategoryRow
                    key={child._id}
                    isActive={currentCategoryId === child._id}
                    articlesCount={articlesCount}
                    topicId={topicId}
                    category={child}
                    remove={remove}
                    isChild={true}
                  />
                ))}
            </>
          );
        })}
      </Categories>
    );
  }
}

export default CategoryList;
