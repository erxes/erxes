import React from 'react';
import {
  __,
  router,
  Box,
  FieldStyle,
  SidebarList,
  DataWithLoader
} from '@erxes/ui/src';
import { generateParamsIds } from '../../../../common/utils';

type Props = {
  articles: any[];
  queryParams: any;
  history: any;
  loading: boolean;
};

function ArticleFilter({ articles, queryParams, history, loading }: Props) {
  const isActive = articleId => {
    return queryParams.articleIds && queryParams.articleIds.includes(articleId);
  };

  const handleArticleSelect = id => {
    const articleIds = generateParamsIds(queryParams?.articleIds) || [];

    if (articleIds.includes(id)) {
      router.removeParams(history, 'page');
      router.setParams(history, {
        articleIds: (articleIds || []).filter(articleId => articleId !== id)
      });
    }

    router.setParams(history, { articleIds: [...articleIds, id] });
    router.removeParams(history, 'page');
  };

  const renderArticlesContent = () => {
    return (
      <SidebarList>
        {articles.map(article => (
          <li key={Math.random()} style={{ marginBottom: '5px' }}>
            <a
              href="#filter"
              tabIndex={0}
              className={isActive(article._id) ? 'active' : ''}
              onClick={() => handleArticleSelect(article._id)}
            >
              {/* <Icon icon={type.icon} /> */}
              <FieldStyle>{article.title}</FieldStyle>
            </a>
          </li>
        ))}
      </SidebarList>
    );
  };

  return (
    <Box
      title={__('Filter by Knowledgebase Article')}
      name="showFilterByKbArticle"
      isOpen={true}
      collapsible={articles.length > 6}
    >
      {renderArticlesContent()}
    </Box>
  );
}

export default ArticleFilter;
