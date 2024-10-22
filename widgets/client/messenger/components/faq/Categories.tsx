import * as React from 'react';
import Category from '../../containers/faq/Category';
import { IFaqTopic, IFaqCategory } from '../../types';
import { iconLeft, iconSearch } from '../../../icons/Icons';
import { __ } from '../../../utils';

type Props = {
  faqTopics?: IFaqTopic;
  loading: boolean;
  initialCategory?: IFaqCategory;
};

type State = {
  currentCategory: IFaqCategory | undefined;
  textColor: string;
};

const Categories: React.FC<Props> = ({
  faqTopics,
  loading,
  initialCategory,
}) => {
  const [currentCategory, setCurrentCategory] = React.useState<
    IFaqCategory | undefined
  >(undefined);
  const [textColor, setTextColor] = React.useState('#888');

  React.useEffect(() => {
    if (initialCategory) {
      setCurrentCategory(initialCategory);
    }
  }, [initialCategory]);

  const groupByParent = (array: any[]) => {
    const key = 'parentCategoryId';

    return array.reduce((rv, x) => {
      (rv[x[key]] = rv[x[key]] || []).push(x);

      return rv;
    }, {});
  };

  const getCurrentItem = (currentCategory: IFaqCategory) => {
    setCurrentCategory(currentCategory);
  };

  if (!faqTopics || loading) {
    return <div className="loader bigger" />;
  }

  const categories = faqTopics.categories || ({} as IFaqCategory[]);

  const subFields = categories.filter((f) => f.parentCategoryId);
  const parents = categories.filter((f) => !f.parentCategoryId);

  const group = groupByParent(subFields);

  const renderChildrenCategories = () => {
    if (currentCategory) {
      const childrens = group[currentCategory._id] || [];

      if (childrens.length === 0) {
        return (
          <div className="empty-articles">
            {iconSearch}
            {__('No category found')}
          </div>
        );
      }

      return (
        <div className="fade-in faq-collection-container">
          <button
            className="back-category-button left"
            onClick={() => setCurrentCategory(undefined)}
          >
            {iconLeft(textColor)} {__('Back to FAQ')}
          </button>
          {childrens.map((child: IFaqCategory) => (
            <Category key={child._id} category={child} />
          ))}
        </div>
      );
    }
  };

  if (currentCategory) {
    return renderChildrenCategories();
  }

  return (
    <div className="faq-collection-container">
      <div className="collection-count">
        {`${parents.length || 0} ${__('collections')}`}
      </div>
      {parents.map((category) => {
        const childrens = group[category._id] || [];

        return (
          <Category
            key={category._id}
            childrens={childrens}
            getCurrentItem={getCurrentItem}
            category={category}
            isParent={childrens.length > 0}
          />
        );
      })}
    </div>
  );
};
export default Categories;
