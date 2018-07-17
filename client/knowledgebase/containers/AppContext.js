import React from 'react';
import PropTypes from 'prop-types';

const AppContext = React.createContext();

export const AppConsumer = AppContext.Consumer;

export class AppProvider extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      activeRoute: 'CATEGORIES',
      activeCategory: null,
      activeArticle: null,
      searchString: '',
    }

    this.goToCategory = this.goToCategory.bind(this);
    this.goToCategories = this.goToCategories.bind(this);
    this.goToArticle = this.goToArticle.bind(this);
    this.goToArticles = this.goToArticles.bind(this);
    this.search = this.search.bind(this);
  }

  goToCategory(category) {
    this.setState({
      activeRoute: 'CATEGORY_DETAIL',
      activeCategory: category,
    });
  }

  goToArticle(article) {
    this.setState({
      activeRoute: 'ARTICLE_DETAIL',
      activeArticle: article,
    });
  }

  goToCategories() {
    this.setState({
      activeRoute: 'CATEGORIES',
      activeCategory: null,
    });
  }

  goToArticles() {
    const { activeCategory } = this.state;

    this.setState({ activeRoute: activeCategory ? 'CATEGORY_DETAIL': 'CATEGORIES' });
  }

  search(value) {
    let activeRoute = 'CATEGORIES'

    if (value) {
      activeRoute = 'ARTICLES';
    }

    this.setState({ searchString: value, activeRoute });
  }

  render() {
    return (
      <AppContext.Provider
        value={{
          ...this.state,
          goToCategory: this.goToCategory,
          goToCategories: this.goToCategories,
          goToArticle: this.goToArticle,
          goToArticles: this.goToArticles,
          search: this.search,
        }}
      >
        {this.props.children}
      </AppContext.Provider>
    )
  }
}

AppProvider.propTypes = {
  children: PropTypes.object,
}
