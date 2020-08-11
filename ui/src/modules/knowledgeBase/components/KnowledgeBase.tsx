import Button from 'modules/common/components/Button';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import Pagination from 'modules/common/components/pagination/Pagination';
import { Title } from 'modules/common/styles/main';
import { __ } from 'modules/common/utils';
import Wrapper from 'modules/layout/components/Wrapper';
import React from 'react';
import ArticleForm from '../containers/article/ArticleForm';
import ArticleList from '../containers/article/ArticleList';
import KnowledgeList from '../containers/knowledge/KnowledgeList';
import { ICategory } from '../types';

type Props = {
  queryParams: any;
  articlesCount: number;
  currentCategory: ICategory;
};

class KnowledgeBase extends React.Component<Props> {
  breadcrumb() {
    const currentCategory = this.props.currentCategory || {
      title: '',
      firstTopic: { title: '' }
    };
    const currentKnowledgeBase = currentCategory.firstTopic || { title: '' };
    const list = [{ title: __('Knowledge base'), link: '/knowledgeBase' }];
    const categoryLink = `/knowledgeBase?id=${currentCategory._id}`;

    if (currentKnowledgeBase.title) {
      list.push({
        title: currentKnowledgeBase.title,
        link: currentCategory ? categoryLink : ''
      });
    }

    if (currentCategory.title) {
      list.push({
        title: currentCategory.title,
        link: categoryLink
      });
    }

    return list;
  }

  render() {
    const { articlesCount, queryParams, currentCategory } = this.props;

    const trigger = (
      <Button btnStyle="primary" uppercase={false} icon="plus-circle">
        Add Article
      </Button>
    );

    const content = props => (
      <ArticleForm
        {...props}
        queryParams={queryParams}
        currentCategoryId={currentCategory._id}
        topicIds={currentCategory.firstTopic && currentCategory.firstTopic._id}
      />
    );

    const actionBarLeft = currentCategory._id && (
      <ModalTrigger
        title="Add Article"
        trigger={trigger}
        size="lg"
        autoOpenKey="showKBAddArticleModal"
        content={content}
        enforceFocus={false}
      />
    );

    const leftActionBar = (
      <Title>
        {currentCategory.title}
        <span>
          ({articlesCount} {articlesCount > 1 ? __('articles') : __('article')})
        </span>
      </Title>
    );

    return (
      <Wrapper
        header={
          <Wrapper.Header
            title={`${currentCategory.title || ''}`}
            breadcrumb={this.breadcrumb()}
          />
        }
        leftSidebar={
          <KnowledgeList
            currentCategoryId={currentCategory._id}
            articlesCount={articlesCount}
            queryParams={queryParams}
          />
        }
        actionBar={
          <Wrapper.ActionBar left={leftActionBar} right={actionBarLeft} />
        }
        footer={currentCategory._id && <Pagination count={articlesCount} />}
        transparent={true}
        content={
          <ArticleList
            queryParams={queryParams}
            currentCategoryId={currentCategory._id}
            topicIds={
              currentCategory.firstTopic && currentCategory.firstTopic._id
            }
          />
        }
      />
    );
  }
}

export default KnowledgeBase;
