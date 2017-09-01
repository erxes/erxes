import React, { PropTypes } from 'react';
import { Table } from 'react-bootstrap';
import { Wrapper } from '/imports/react-ui/layout/components';
import { Pagination } from '/imports/react-ui/common';
import ArticleRow from './row';
import { ActionButtons } from '../../components';
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

    return items.map(item =>
      <ArticleRow key={item._id} item={item} categories={categories} removeItem={removeItem} />,
    );
  }

  getHeader() {
    const breadcrumb = [{ title: 'Knowledge base', link: '/settings/knowledgebase' }];

    return <Wrapper.Header breadcrumb={breadcrumb} />;
  }

  getActionBar() {
    return <Wrapper.ActionBar left={<ActionButtons />} />;
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
              <th width="183" className="text-right">
                Actions
              </th>
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
