import * as React from 'react';
import { iconLeft } from '../../../icons/Icons';
import TopBar from '../../containers/TopBar';
import Articles from '../../containers/faq/Articles';
import { IFaqCategory } from '../../types';
import SearchBar from './SearchBar';
import { __ } from '../../../utils';
import { useRouter } from '../../context/Router';
import Container from '../common/Container';

type Props = {
  category: IFaqCategory;
  goToCategories: () => void;
  loading: boolean;
  topicId: string;
};

interface IState {
  searchString: string;
}

const CategoryDetail = ({
  category,
  loading,
  topicId,
  goToCategories,
}: Props) => {
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

    return (
      <div className="scroll-wrapper">
        <Articles
          topicId={topicId}
          articles={category.articles}
          searchString={searchString}
        />
      </div>
    );
  };
  {
    /* <TopBar
    middle={}
    buttonIcon={iconLeft()}
    onLeftButtonClick={goToCategories}
    
  /> */
  }

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
