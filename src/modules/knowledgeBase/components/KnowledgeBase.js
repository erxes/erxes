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
    return [
      { title: 'Knowledge base', link: '/knowledgeBase' },
      { title: `${this.props.currentCategory.title}` }
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
        <ArticleForm currentCategoryId={currentCategory._id} />
      </ModalTrigger>
    );

    return (
      <Wrapper
        header={<Wrapper.Header breadcrumb={this.breadcrumb()} />}
        leftSidebar={
          <KnowledgeList
            currentCategoryId={currentCategory._id}
            queryParams={queryParams}
          />
        }
        actionBar={<Wrapper.ActionBar right={actionBarLeft} />}
        footer={<Pagination count={articlesCount} />}
        transparent={true}
        content={
          <DataWithLoader
            data={
              <ArticleList
                queryParams={queryParams}
                currentCategoryId={currentCategory._id}
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

export default KnowledgeBase;
