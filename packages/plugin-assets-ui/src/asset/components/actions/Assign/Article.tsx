import { ContainerBox } from "../../../../style";
import { FormControl } from "@erxes/ui/src";
import { IAsset } from "../../../../common/types";
import { KbArticles } from "../../../../style";
import React from "react";
import { __ } from "@erxes/ui/src/utils";

type Props = {
  objects?: IAsset[];
  kbTopics: any[];
  loadArticles: (categoryId: string) => void;
  loadedArticles: any[];
  save: (doc: { ids: string[]; data: any; callback: () => void }) => void;
  closeModal: () => void;
  selectedArticleIds?: string[];
  article: any;
  selectedArticles: string[];
  setSelectedArticles: (articleIds: string[]) => void;
};

const Article = (props: Props) => {
  const { article, selectedArticles, setSelectedArticles } = props;

  const handleArticleSelect = (articleId) => {
    const newSelectedArticles = [...selectedArticles];

    if (newSelectedArticles.includes(articleId)) {
      const index = newSelectedArticles.indexOf(articleId);
      newSelectedArticles.splice(index, 1);
    } else {
      newSelectedArticles.push(articleId);
    }

    setSelectedArticles(newSelectedArticles);
  };

  return (
    <KbArticles key={article._id}>
      <ContainerBox $spaceBetween={true} align="center">
        <ContainerBox gap={5}>
          <FormControl
            componentclass="checkbox"
            checked={selectedArticles.includes(article._id)}
            onClick={() => handleArticleSelect(article._id)}
          />
          {article.title}
        </ContainerBox>
      </ContainerBox>
    </KbArticles>
  );
};

export default Article;
