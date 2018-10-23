import * as React from "react";
import { IFaqArticle, IFaqCategory } from "../../types";

interface IState {
  activeRoute: string;
  activeCategory: IFaqCategory | null;
  activeArticle: IFaqArticle | null;
}

interface IStore extends IState {
  goToCategory: (category: IFaqCategory) => void;
  goToArticle: (article: IFaqArticle) => void;
  goToArticles: () => void;
}

const FaqContext = React.createContext({} as IStore);

export const FaqConsumer = FaqContext.Consumer;

export class FaqProvider extends React.Component<{}, IState> {
  constructor(props: {}) {
    super(props);

    this.state = {
      activeRoute: "CATEGORY_DETAIL",
      activeCategory: null,
      activeArticle: null
    };
  }

  goToCategory = (category: IFaqCategory) => {
    this.setState({
      activeRoute: "CATEGORY_DETAIL",
      activeCategory: category
    });
  };

  goToArticle = (article: IFaqArticle) => {
    this.setState({
      activeRoute: "ARTICLE_DETAIL",
      activeArticle: article
    });
  };

  goToArticles = () => {
    this.setState({ activeRoute: "CATEGORY_DETAIL" });
  };

  render() {
    return (
      <FaqContext.Provider
        value={{
          ...this.state,
          goToCategory: this.goToCategory,
          goToArticle: this.goToArticle,
          goToArticles: this.goToArticles
        }}
      >
        {this.props.children}
      </FaqContext.Provider>
    );
  }
}
