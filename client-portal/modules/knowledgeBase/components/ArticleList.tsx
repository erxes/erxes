import React from "react";
import {
  CategoryContent,
  CategoryItem,
  TextWrapper,
  ImageWrapper,
  Image,
} from "./styles";
import Link from "next/link";
import Avatar from "../../common/Avatar";
import EmptyContent from "../../common/EmptyContent";
import { IKbArticle } from "../../types";

type Props = {
  articles: IKbArticle[];
  type?: string;
};

class Lists extends React.Component<Props> {
  render() {
    const { articles, type } = this.props;

    if (!articles || articles.length === 0) {
      return <EmptyContent text="There are no articles!" />;
    }

    return (
      <>
        {(articles || []).map((article) => (
          <React.Fragment key={article._id}>
            <Link
              href={`/knowledge-base/article?id=${article._id}&catId=${article.categoryId}`}
            >
              <CategoryItem type={type}>
                <CategoryContent type={type}>
                  {type !== "layout" && (
                    <>
                      <h5 className="base-color">{article.title}</h5>
                      <p>{article.summary}</p>

                      <Avatar
                        date={article.modifiedDate}
                        user={article.createdUser}
                      />
                    </>
                  )}
                  {type === "layout" && (
                    <>
                      <ImageWrapper>
                        <Image src={article.image.url} />
                      </ImageWrapper>
                      <TextWrapper>
                        <h5 className="base-color">{article.title}</h5>
                        <p>{article.summary}</p>
                      </TextWrapper>
                    </>
                  )}
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
