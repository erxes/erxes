import React, { PropTypes } from 'react';
import { Table, Button } from 'react-bootstrap';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Wrapper } from '/imports/react-ui/layout/components';
import { Pagination } from '/imports/react-ui/common';
import Sidebar from '../../Sidebar';
import CategoryRow from './category';
import { CommonList } from './common';

// console.log("CommonList: ", CommonList);
// console.log("CategoryRow: ", CategoryRow);
// console.log("Sidebar: ", Sidebar);
const propTypes = {
  items: PropTypes.array.isRequired,
  removeItem: PropTypes.func.isRequired,
  loadMore: PropTypes.func.isRequired,
  hasMore: PropTypes.bool.isRequired,
};

class CategoryList extends CommonList {
  constructor(props) {
    console.log('props: ', props);
    super(props);

    // this.renderItems = this.renderItems.bind(this);
    // this.getActionBar = this.getActionBar.bind(this);
    // this.getContent = this.getContent.bind(this);
    // this.getHeader = this.getHeader.bind(this);
    // this.render = this.render.bind(this);
  }

  renderItems() {
    const { items, removeItem } = this.props;

    return items.map(item => <Row key={item._id} item={item} removeItem={removeItem} />);
  }

  getHeader() {
    const breadcrumb = [
      { title: 'Knowledge base', link: '/settings/knowledgebase' },
      { title: 'Categories' },
    ];

    return <Wrapper.Header breadcrumb={breadcrumb} />;
  }

  getActionBar() {
    const actionBarLeft = (
      <Button bsStyle="link" href={FlowRouter.path('settings/knowledgebase/categories/add')}>
        <i className="ion-plus-circled" /> Add category
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
              <th>Name</th>
              <th>Brand</th>
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

  render() {
    return (
      <div>
        <Wrapper
          header={this.getHeader()}
          leftSidebar={<Sidebar />}
          actionBar={this.getActionBar()}
          content={this.getContent()}
        />
      </div>
    );
  }
}

CategoryList.propTypes = propTypes;

export default CategoryList;
