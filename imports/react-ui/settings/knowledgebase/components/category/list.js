import React from 'react';
import PropTypes from 'prop-types';
import { Table } from 'react-bootstrap';
import { Wrapper } from '/imports/react-ui/layout/components';
import { Pagination } from '/imports/react-ui/common';
import { ActionButtons } from '../../components';
import CategoryRow from './row';
import { CommonList } from '../common';

const propTypes = {
  items: PropTypes.array.isRequired,
  removeItem: PropTypes.func.isRequired,
  loadMore: PropTypes.func.isRequired,
  hasMore: PropTypes.bool.isRequired,
};

class KbCategoryList extends CommonList {
  constructor(props) {
    super(props);
  }

  renderItems() {
    const { items, removeItem } = this.props;

    return items.map(item => <CategoryRow key={item._id} item={item} removeItem={removeItem} />);
  }

  getHeader() {
    const breadcrumb = [
      { title: 'Knowledge base', link: '/settings/knowledgebase' },
      { title: 'Categories' },
    ];

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
              <th>Name</th>
              <th>Description</th>
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
