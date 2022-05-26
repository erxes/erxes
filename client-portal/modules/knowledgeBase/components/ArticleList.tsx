import React from "react";
import { CategoryContent, CategoryItem } from "./styles";
import Link from "next/link";
import Avatar from "../../common/Avatar";
import EmptyContent from "../../common/EmptyContent";
import { IKbArticle } from "../../types";

type Props = {
  articles: IKbArticle[];
  searchValue?: string;
};

class Lists extends React.Component<Props> {
  render() {
    const { articles } = this.props;

    if (!articles || articles.length === 0) {
      return <EmptyContent text="Thare are no articles in this category!" />;
    }

    return articles.map((article) => (
      <Link
        href={`/knowledge-base/article?id=${article._id}&catId=${article.categoryId}`}
        key={article._id}
      >
        <CategoryItem>
          <CategoryContent>
            <h5 className="base-color">{article.title}</h5>
            <p>{article.summary}</p>

            <Avatar date={article.modifiedDate} user={article.createdUser} />
          </CategoryContent>
        </CategoryItem>
      </Link>
    ));
  }
}

export default Lists;
