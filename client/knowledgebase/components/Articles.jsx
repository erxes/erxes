import React from 'react';
import PropTypes from 'prop-types';
import { Article } from '../containers';

const propTypes = {
  articles: PropTypes.arrayOf(PropTypes.object),
  category: PropTypes.object,
};

export default class Articles extends React.Component {
  constructor(props) {
    super(props);
  }

  renderArticles() {
    const { articles, category } = this.props;
    return articles.map(article => {
      return (
        <Article key={article._id} article={article} category={category} />
      );
    });
  }

  render() {
    return (
      <div>
        {this.renderArticles()}
      </div>
    );
  }
}

Articles.propTypes = propTypes;
