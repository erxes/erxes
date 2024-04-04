import { CategoryContent, CategoryItem } from "./styles";
import { Config, IKbArticle } from "../../types";

import Avatar from "../../common/Avatar";
import { Card } from "../../styles/cards";
import EmptyContent from "../../common/EmptyContent";
import Link from "next/link";
import React from "react";
import SingleArticle from "./SingleArticle";

type Props = {
  articles: IKbArticle[];
  config: Config;
};

class Lists extends React.Component<Props> {
  renderContent(article) {
    return (
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
                viewCount={article.viewCount || 0}
              />
            </CategoryContent>
          </CategoryItem>
        </Link>
      </React.Fragment>
    );
  }

  render() {
    const { articles, config } = this.props;

    if (!articles || articles.length === 0) {
      return (
        <Card fullHeight={true}>
          <EmptyContent text="There are no articles!" />
        </Card>
      );
    }

    if (articles && articles.length === 1) {
      return <SingleArticle article={articles[0]} config={config} />;
    }

    return (articles || []).map((article) => this.renderContent(article));
  }
}

export default Lists;
