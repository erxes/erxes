import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Pagination,
  ModalTrigger,
  Button,
  DataWithLoader
} from 'modules/common/components';
import { Wrapper } from 'modules/layout/components';
import { KnowledgeList, ArticleList, ArticleForm } from '../containers';

const propTypes = {
  queryParams: PropTypes.object,
  articlesCount: PropTypes.number.isRequired,
  loading: PropTypes.bool.isRequired,
  currentCategory: PropTypes.object
};

class KnowledgeBase extends Component {
  breadcrumb() {
    const { __ } = this.context;

    const currentCategory = this.props.currentCategory || {};
    const currentKnowledgeBase = currentCategory.firstTopic || {};

    return [
      { title: __('Knowledge base'), link: '/knowledgeBase' },
      { title: `${currentKnowledgeBase.title || 'No Category'}` },
      { title: `${currentCategory.title || ''}` }
    ];
  }

  render() {
    const { articlesCount, loading, queryParams, currentCategory } = this.props;

    const trigger = (
      <Button btnStyle="success" size="small" icon="plus">
        Add Article
      </Button>
    );

    const actionBarLeft = currentCategory._id && (
      <ModalTrigger title="Add Article" trigger={trigger} size="lg">
        <ArticleForm
          queryParams={queryParams}
          currentCategoryId={currentCategory._id}
          topicIds={
            currentCategory.firstTopic && currentCategory.firstTopic._id
          }
        />
      </ModalTrigger>
    );

    return (
      <Wrapper
        header={<Wrapper.Header breadcrumb={this.breadcrumb()} />}
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
          <DataWithLoader
            data={
              <ArticleList
                queryParams={queryParams}
                currentCategoryId={currentCategory._id}
                topicIds={
                  currentCategory.firstTopic && currentCategory.firstTopic._id
                }
              />
            }
            loading={loading}
            count={articlesCount}
            emptyText="There is no data."
            emptyImage="/images/robots/robot-05.svg"
          />
        }
      />
    );
  }
}

KnowledgeBase.propTypes = propTypes;
KnowledgeBase.contextTypes = {
  __: PropTypes.func
};

export default KnowledgeBase;
