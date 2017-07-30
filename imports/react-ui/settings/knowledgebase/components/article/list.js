import React, { PropTypes } from 'react';
import { Table, Button } from 'react-bootstrap';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Wrapper } from '/imports/react-ui/layout/components';
import { Pagination } from '/imports/react-ui/common';
import ArticleRow from './row';
import { CommonList } from '../common';

const propTypes = {
  items: PropTypes.array.isRequired,
  categories: PropTypes.array.isRequired,
  removeItem: PropTypes.func.isRequired,
  loadMore: PropTypes.func.isRequired,
  hasMore: PropTypes.bool.isRequired,
};

class KbCategoryList extends CommonList {
  constructor(props) {
    super(props);
  }

  renderItems() {
    const { items, categories, removeItem } = this.props;

    return items.map(item => (
      <ArticleRow key={item._id} item={item} categories={categories} removeItem={removeItem} />
    ));
  }

  getHeader() {
    const breadcrumb = [{ title: 'Knowledge base', link: '/settings/knowledgebase' }];

    return <Wrapper.Header breadcrumb={breadcrumb} />;
  }

  getActionBar() {
    const actionBarLeft = (
      <Button bsStyle="link" href={FlowRouter.path('settings/knowledgebase/add')}>
        <i className="ion-plus-circled" /> Add
      </Button>
    );

    return <Wrapper.ActionBar left={actionBarLeft} />;
  }

  getContent() {
    const { loadMore, hasMore } = this.props;
    return (
      <Pagination loadMore={loadMore} hasMore={hasMore}>
        <Table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Summary</th>
              <th>Category</th>
              <th width="183" className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {this.renderItems()}
          </tbody>
        </Table>
      </Pagination>
    );
  }
}

KbCategoryList.propTypes = propTypes;

export default KbCategoryList;
