import React, { useState } from 'react';
import { IArticle } from '@erxes/ui-knowledgebase/src/types';
import { IAsset } from '../../../common/types';
import { generateTree } from '@erxes/ui/src/utils/core';
import { KbCategories, KbCategoriesContainer, KbTopics } from '../../../style';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import styled from 'styled-components';
import { FlexRow, Row } from '@erxes/ui-settings/src/styles';
import { __ } from '@erxes/ui/src/utils/core';

const KbCat = styled(KbCategories)`
  &:before {
  }
`;

type Props = {
  kbArticleIds: string[];
  articles: IArticle[];
  asset: IAsset;
};

const KbArticles = ({ articles, asset }: Props) => {
  const { knowledgeData = {} } = asset;
  const [selectedCategoryIds, setCategoryIds] = useState([] as string[]);

  const handleClick = (_id) => {
    if (selectedCategoryIds.includes(_id)) {
      return setCategoryIds(
        selectedCategoryIds.filter((categoryId) => categoryId !== _id),
      );
    }
    setCategoryIds([...selectedCategoryIds, _id]);
  };

  const onCellClick = (e) => {
    e.stopPropagation();
  };

  return (
    <>
      {generateTree(
        knowledgeData,
        null,
        ({ _id, title }) => (
          <>
            <KbTopics key={_id} onClick={() => handleClick(_id)}>
              <FlexRow style={{ justifyContent: 'space-between' }}>
                <ControlLabel>{title}</ControlLabel>
                <a
                  onClick={onCellClick}
                  target="_blank"
                  href={`/knowledgeBase?id=${_id}`}
                >
                  {__('View Category')}
                </a>
              </FlexRow>
            </KbTopics>
            {selectedCategoryIds.includes(_id) && (
              <KbCategoriesContainer>
                {articles
                  .filter((article) => article.categoryId === _id)
                  .map((article) => (
                    <KbCat key={article._id}>
                      <ControlLabel>{article.title}</ControlLabel>
                    </KbCat>
                  ))}
              </KbCategoriesContainer>
            )}
          </>
        ),
        -1,
        'parentCategoryId',
      )}
    </>
  );
};

export default KbArticles;
