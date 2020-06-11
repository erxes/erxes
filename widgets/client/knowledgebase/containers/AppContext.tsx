import gql from "graphql-tag";
import * as React from "react";
import client from "../../apollo-client";
import { IKbArticle, IKbCategory } from "../types";
import graphql from "./graphql";

interface IState {
  activeRoute: string;
  activeCategory: IKbCategory | null;
  activeArticle: IKbArticle | null;
  searchString: string;
}

interface IStore extends IState {
  goToCategory: (category: IKbCategory) => void;
  goToArticle: (article: IKbArticle) => void;
  goToArticles: () => void;
  search: (value: string) => void;
  goToCategories: () => void;
  incReactionCount: (articleId: string, reactionChoice: string) => void;
}

const AppContext = React.createContext({} as IStore);

export const AppConsumer = AppContext.Consumer;

export class AppProvider extends React.Component<{}, IState> {
  constructor(props: {}) {
    super(props);

    this.state = {
      activeRoute: "CATEGORIES",
      activeCategory: null,
      activeArticle: null,
      searchString: ""
    };
  }

  goToCategory = (category: IKbCategory) => {
    this.setState({
      activeRoute: "CATEGORY_DETAIL",
      activeCategory: category
    });
  };

  goToArticle = (article: IKbArticle) => {
    this.setState({
      activeRoute: "ARTICLE_DETAIL",
      activeArticle: article
    });
  };

  goToCategories = () => {
    this.setState({
      activeRoute: "CATEGORIES",
      activeCategory: null
    });
  };

  goToArticles = () => {
    const { activeCategory } = this.state;

    this.setState({
      activeRoute: activeCategory ? "CATEGORY_DETAIL" : "CATEGORIES"
    });
  };

  incReactionCount = (articleId: string, reactionChoice: string) => {
    client.mutate({
      mutation: gql(graphql.incReactionCount),
      variables: {
        articleId,
        reactionChoice
      }
    });
  };

  search = (value: string) => {
    let activeRoute = "CATEGORIES";

    if (value) {
      activeRoute = "ARTICLES";
    }

    this.setState({ searchString: value, activeRoute });
  };

  render() {
    return (
      <AppContext.Provider
        value={{
          ...this.state,
          goToCategory: this.goToCategory,
          goToCategories: this.goToCategories,
          goToArticle: this.goToArticle,
          goToArticles: this.goToArticles,
          incReactionCount: this.incReactionCount,
          search: this.search
        }}
      >
        {this.props.children}
      </AppContext.Provider>
    );
  }
}
