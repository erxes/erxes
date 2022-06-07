import React from "react";
import { CategoryContent, CategoryItem } from "./styles";
import Link from "next/link";
import Avatar from "../../common/Avatar";
import EmptyContent from "../../common/EmptyContent";
import { IKbArticle } from "../../types";

type Props = {
  articles: IKbArticle[];
  searchValue?: any;
};

class Lists extends React.Component<Props> {
  renderSearchResult = () => {
    const { searchValue, articles } = this.props;

    if (!searchValue) {
      return null;
    }

    if (articles.length === 0) {
      return (
        <span className="search-result">
          We couldn't find any articles for: <b>{searchValue}</b>
        </span>
      );
    }

    return (
      <span className="search-result">
        Search result for: <b>{searchValue}</b>
      </span>
    );
  };

  render() {
    const { articles } = this.props;

    if (!articles || articles.length === 0) {
      return <EmptyContent text="There are no articles!" />;
    }

    return (
      <>
        {this.renderSearchResult()}
        {(articles || []).map((article) => (
          <React.Fragment key={article._id}>
            <Link
              href={`/knowledge-base/article?id=${article._id}&catId=${article.categoryId}`}
            >
              <CategoryItem>
                <CategoryContent>
                  <h5 className="base-color">{article.title}</h5>
                  <p>{article.summary}</p>

                  <Avatar
                    date={article.modifiedDate}
                    user={article.createdUser}
                  />
                </CategoryContent>
              </CategoryItem>
            </Link>
          </React.Fragment>
        ))}
      </>
    );
  }
}

export default Lists;
