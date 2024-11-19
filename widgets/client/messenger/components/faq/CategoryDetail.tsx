import * as React from 'react';
import Articles from '../../containers/faq/Articles';
import { IFaqCategory } from '../../types';
import SearchBar from './SearchBar';
import { __ } from '../../../utils';
import Container from '../common/Container';
import CategoriesContainer from '../../containers/faq/Categories';

type Props = {
  category: IFaqCategory;
  loading: boolean;
  topicId: string;
};

const CategoryDetail = ({ category, loading, topicId }: Props) => {
  const [searchString, setSearchString] = React.useState('');

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

    if (category.articles) {
      return (
        <div className="scroll-wrapper">
          <Articles
            topicId={topicId}
            articles={category.articles}
            searchString={searchString}
          />
        </div>
      );
    }
    return (
      <div className="scroll-wrapper">
        <CategoriesContainer
          topicId={topicId}
          searchString=""
          initialCategory={category}
        />
      </div>
    );
  };

  return (
    <Container
      title={renderHead()}
      backRoute="faqCategories"
      extra={<SearchBar onSearch={search} searchString={searchString} />}
    >
      {renderContent()}
    </Container>
  );
};

export default CategoryDetail;
