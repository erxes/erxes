import * as React from "react";
import { iconLeft } from "../../../icons/Icons";
import { TopBar } from "../../containers";
import { Articles } from "../../containers/faq";
import { IFaqCategory } from "../../types";
import { SearchBar } from "./";
import { AppConsumer } from "../../containers/AppContext";
import { __ } from "../../../utils";

type Props = {
  category: IFaqCategory;
  goToCategories: () => void;
  loading: boolean;
  topicId: string;
};

interface IState {
  searchString: string;
}

class CategoryDetail extends React.Component<Props, IState> {
  constructor(props: Props) {
    super(props);

    this.state = { searchString: "" };

    this.search = this.search.bind(this);
  }

  search(searchString: string) {
    this.setState({ searchString });
  }

  renderHead = () => {
    const { category, loading } = this.props;

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

  renderContent = () => {
    const { topicId, category, loading } = this.props;
    const { searchString } = this.state;

    if (loading) {
      return <div className="loader bigger" />;
    }

    return (
      <div className="erxes-content slide-in">
        <AppConsumer>
          {({ changeRoute }) => (
            <button
              className="back-category-button left"
              onClick={() => changeRoute("faqCategories")}
            >
              {iconLeft("#888")} {__("Back to categories")}
            </button>
          )}
        </AppConsumer>
        <SearchBar onSearch={this.search} searchString={searchString} />
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

  render() {
    const { goToCategories } = this.props;

    return (
      <>
        <TopBar
          middle={this.renderHead()}
          buttonIcon={iconLeft()}
          onLeftButtonClick={goToCategories}
        />
        <div className="erxes-content">{this.renderContent()}</div>
      </>
    );
  }
}

export default CategoryDetail;
