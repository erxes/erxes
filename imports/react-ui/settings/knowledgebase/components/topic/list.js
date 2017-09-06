import React from 'react';
import PropTypes from 'prop-types';
import { Table } from 'react-bootstrap';
import { Wrapper } from '/imports/react-ui/layout/components';
import { Pagination } from '/imports/react-ui/common';
import { ActionButtons } from '../../components';
import KbTopicRow from './Row';
import { CommonList } from '../common';

const propTypes = {
  items: PropTypes.array.isRequired,
  removeItem: PropTypes.func.isRequired,
  loadMore: PropTypes.func.isRequired,
  hasMore: PropTypes.bool.isRequired,
};

class KbTopicList extends CommonList {
  constructor(props) {
    super(props);
  }

  renderItems() {
    const { items, removeItem } = this.props;

    return items.map(item => <KbTopicRow key={item._id} item={item} removeItem={removeItem} />);
  }

  getHeader() {
    const breadcrumb = [
      { title: 'Topics', link: '/settings/knowledgebase' },
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
              <th>Title</th>
              <th>Description</th>
              <th>Brand</th>
              <th width="183" className="text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>{this.renderItems()}</tbody>
        </Table>
      </Pagination>
    );
  }
}

KbTopicList.propTypes = propTypes;

export default KbTopicList;
