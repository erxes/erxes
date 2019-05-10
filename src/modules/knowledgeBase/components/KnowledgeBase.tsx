import { Button, ModalTrigger, Pagination } from 'modules/common/components';
import { __ } from 'modules/common/utils';
import { Wrapper } from 'modules/layout/components';
import * as React from 'react';
import { ArticleForm, ArticleList, KnowledgeList } from '../containers';
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

    return [
      { title: __('Knowledge base'), link: '/knowledgeBase' },
      { title: `${currentKnowledgeBase.title || 'No Category'}` },
      { title: `${currentCategory.title || ''}` }
    ];
  }

  render() {
    const { articlesCount, queryParams, currentCategory } = this.props;

    const trigger = (
      <Button btnStyle="success" size="small" icon="add">
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
        content={content}
      />
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
        actionBar={<Wrapper.ActionBar right={actionBarLeft} />}
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
