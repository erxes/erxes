import React, { Component } from 'react';
import { ICategory } from '../../types';
import { CategoryRow } from './';
import { Categories } from './styles';

type Props = {
  currentCategoryId: string;
  topicIds: string;
  categories: ICategory[];
  articlesCount: number;
  remove: ( _id: string ) => void;
};

class CategoryList extends Component<Props> {
  render() {
    const {
      categories,
      remove,
      currentCategoryId,
      topicIds,
      articlesCount
    } = this.props;

    return (
      <Categories>
        {categories.map(category => (
          <CategoryRow
            key={category._id}
            isActive={currentCategoryId === category._id}
            articlesCount={articlesCount}
            topicIds={topicIds}
            category={category}
            remove={remove}
          />
        ))}
      </Categories>
    );
  }
}

export default CategoryList;
