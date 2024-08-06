import * as React from 'react';
import Categories from '../../containers/faq/Categories';
import SearchBar from './SearchBar';
import Container from '../common/Container';
import { __ } from '../../../utils';

type Props = {
  topicId: string;
  loading: boolean;
};

const FaqCategories = (props: Props) => {
  const { topicId, loading } = props;
  const [searchString, setSearchString] = React.useState('');

  const search = (searchString: string) => {
    setSearchString(searchString);
  };

  return (
    <Container
      withTopBar
      title={__('Help')}
      extra={<SearchBar onSearch={search} searchString={searchString} />}
    >
      <div className="scroll-wrapper">
        {loading ? (
          <div className="loader" />
        ) : (
          <Categories topicId={topicId} searchString={searchString} />
        )}
      </div>
    </Container>
  );
};

export default FaqCategories;
