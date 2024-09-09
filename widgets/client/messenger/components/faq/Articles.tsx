import * as React from 'react';
import { iconSearch } from '../../../icons/Icons';
import { __ } from '../../../utils';
import Article from '../../containers/faq/Article';
import { IFaqArticle } from '../../types';

type Props = {
  articles: IFaqArticle[];
  loading?: boolean;
};

const Articles: React.FC<Props> = (props) => {
  const { articles = [], loading } = props;

  if (loading) {
    return (
      <div className="category-detail-container">
        <div className="loader" />
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="empty-articles">
        {iconSearch}
        {__('No articles found')}
      </div>
    );
  }

  return (
    <div className="category-detail-container">
      {articles.map((article) => (
        <Article key={article._id} article={article} />
      ))}
    </div>
  );
};

export default Articles;
