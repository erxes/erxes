import * as React from 'react';
import { IFaqCategory } from '../../types';
import { __ } from '../../../utils';
import { IconChevronRight } from '../../../icons/Icons';

type Props = {
  category: IFaqCategory;
  childrens?: IFaqCategory[];
  getCurrentItem?: (currentCategory: IFaqCategory) => void;
  onClick: (category?: IFaqCategory) => void;
  isParent?: boolean;
};

const Category: React.FC<Props> = ({
  category,
  getCurrentItem,
  childrens,
  onClick,
  isParent,
}) => {
  const handleOnClick = (event: React.FormEvent<HTMLDivElement>) => {
    event.preventDefault();

    if (childrens && getCurrentItem) {
      childrens.length === 0 ? onClick(category) : getCurrentItem(category);
    } else {
      onClick(category);
    }
  };

  const renderCount = () => {
    if (!childrens) {
      return category.numOfArticles;
    }

    return childrens.length === 0 ? category.numOfArticles : childrens.length;
  };

  return (
    <div className="category-item-container" onClick={handleOnClick}>
      <div className="category-detail">
        <h6>{category.title}</h6>
        <p>{category.description}</p>
        <div className="description">{`${renderCount()} ${__(isParent ? 'categories' : 'articles')}`}</div>
      </div>
      <IconChevronRight />
    </div>
  );
};

export default Category;
