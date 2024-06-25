import * as React from 'react';
import { useState } from 'react';
import { iconLeft } from '../../../icons/Icons';
import TopBar from '../../containers/TopBar';
import Articles from '../../containers/faq/Articles';
import { IFaqCategory } from '../../types';
import SearchBar from './SearchBar';
import { __ } from '../../../utils';
import { useAppContext } from '../../containers/AppContext';

type Props = {
  category: IFaqCategory;
  goToCategories: () => void;
  loading: boolean;
  topicId: string;
};

interface IState {
  searchString: string;
}

const CategoryDetail: React.FC<Props> = ({
  category,
  goToCategories,
  loading,
  topicId,
}) => {
  const { changeRoute } = useAppContext();
  const [searchString, setSearchString] = useState<string>('');

  const search = (searchString: string) => {
    setSearchString(searchString);
  };

  const renderHead = () => {
    if (loading) {
      return <div className="loader" />;
    }

    return (
      <div className="erxes-topbar-title limited">
        <div>
          {category.title} <span>({category.numOfArticles})</span>
        </div>
        <span>{category.description}</span>
      </div>
    );
  };

  const renderContent = () => {
    if (loading) {
      return <div className="loader bigger" />;
    }

    return (
      <div className="erxes-content slide-in">
        <button
          className="back-category-button left"
          onClick={() => changeRoute('faqCategories')}
        >
          {iconLeft('#888')} {__('Back to categories')}
        </button>
        <SearchBar onSearch={search} searchString={searchString} />
        <div className="scroll-wrapper">
          <Articles
            topicId={topicId}
            articles={category.articles}
            searchString={searchString}
          />
        </div>
      </div>
    );
  };

  return (
    <>
      <TopBar
        middle={renderHead()}
        buttonIcon={iconLeft()}
        onLeftButtonClick={goToCategories}
      />
      <div className="erxes-content">{renderContent()}</div>
    </>
  );
};

export default CategoryDetail;
