import ArticleForm from '../containers/article/ArticleForm';
import ArticleList from '../containers/article/ArticleList';
import Button from '@erxes/ui/src/components/Button';
import { ICategory } from '@erxes/ui-knowledgebase/src/types';
import KnowledgeList from '../containers/knowledge/KnowledgeList';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Pagination from '@erxes/ui/src/components/pagination/Pagination';
import React from 'react';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { __ } from '@erxes/ui/src/utils/core';
import { Title } from '@erxes/ui-settings/src/styles';

type Props = {
  queryParams: any;
  articlesCount: number;
  currentCategory: ICategory;
};

const KnowledgeBase = (props: Props) => {
  const { articlesCount, queryParams, currentCategory } = props;

  const breadcrumb = () => {
    const currentBreadcrumb =
      currentCategory ||
      ({
        title: '',
        firstTopic: { title: '' },
      } as ICategory);

    const currentKnowledgeBase = currentBreadcrumb.firstTopic || { title: '' };
    const list = [{ title: __('Knowledge Base'), link: '/knowledgeBase' }];
    const categoryLink = `/knowledgeBase?id=${currentBreadcrumb._id}`;

    if (currentKnowledgeBase.title) {
      list.push({
        title: currentKnowledgeBase.title,
        link: currentBreadcrumb ? categoryLink : '',
      });
    }

    if (currentBreadcrumb.title) {
      list.push({
        title: currentBreadcrumb.title,
        link: categoryLink,
      });
    }

    return list;
  };

  const content = (props) => (
    <ArticleForm
      {...props}
      queryParams={queryParams}
      currentCategoryId={currentCategory._id}
      topicId={currentCategory.firstTopic && currentCategory.firstTopic._id}
    />
  );

  const renderActionBar = () => {
    const trigger = (
      <Button btnStyle="success" icon="plus-circle">
        Add Article
      </Button>
    );

    const actionBarLeft = currentCategory._id && (
      <ModalTrigger
        title={__("Add Article")}
        trigger={trigger}
        size="lg"
        autoOpenKey="showKBAddArticleModal"
        content={content}
        enforceFocus={false}
      />
    );

    const leftActionBar = (
      <Title>{`${currentCategory.title || ''} (${articlesCount})`}</Title>
    );

    return <Wrapper.ActionBar left={leftActionBar} right={actionBarLeft} />;
  };

  return (
    <Wrapper
      header={
        <Wrapper.Header
          title={`${currentCategory.title || ''}`}
          breadcrumb={breadcrumb()}
        />
      }
      leftSidebar={
        <KnowledgeList
          currentCategoryId={currentCategory._id}
          articlesCount={articlesCount}
          queryParams={queryParams}
        />
      }
      actionBar={renderActionBar()}
      footer={currentCategory._id && <Pagination count={articlesCount} />}
      transparent={true}
      content={
        <ArticleList
          queryParams={queryParams}
          currentCategoryId={currentCategory._id}
          topicId={currentCategory.firstTopic && currentCategory.firstTopic._id}
        />
      }
      hasBorder={true}
    />
  );
};

export default KnowledgeBase;
