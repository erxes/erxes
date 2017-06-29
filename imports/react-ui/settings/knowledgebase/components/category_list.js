import React, { Component, PropTypes } from 'react';
import { Table, Button } from 'react-bootstrap';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Wrapper } from '/imports/react-ui/layout/components';
import { Pagination } from '/imports/react-ui/common';
import Sidebar from '../../Sidebar';
import Row from './row';
import CommonList from './common';

const propTypes = {
  kbCategories: PropTypes.array.isRequired,
  brands: PropTypes.array.isRequired,
  removeKbCategory: PropTypes.func.isRequired,
  loadMore: PropTypes.func.isRequired,
  hasMore: PropTypes.bool.isRequired,
};

class CategoryList extends Component {
  constructor(props) {
    super(props);

    this.renderKbCategories = this.renderKbCategories.bind(this);
  }

  renderKbCategories() {
    const { brands, kbTopics, removeKbCategory } = this.props;

    return kbCategories.map(kbTopic => (
      <Row
        key={kbCategories._id}
        kbTopic={kbTopic}
        brands={brands}
        removeKbCategory={removeKbCategory}
      />
    ));
  }

  render() {
    const { loadMore, hasMore } = this.props;

    const actionBarLeft = (
      <Button bsStyle="link" href={FlowRouter.path('settings/knowledgebase/add')}>
        <i className="ion-plus-circled" /> Add topic
      </Button>
    );

    const actionBar = <Wrapper.ActionBar left={actionBarLeft} />;

    const content = (
      <Pagination loadMore={loadMore} hasMore={hasMore}>
        <Table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Kind</th>
              <th>Brand</th>
              <th width="183" className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {this.renderKbCategories()}
          </tbody>{' '}
        </Table>
      </Pagination>
    );

    const breadcrumb = [
      { title: 'Settings', link: '/settings/integrations' },
      { title: 'Integrations' },
    ];

    return (
      <div>
        <Wrapper
          header={<Wrapper.Header breadcrumb={breadcrumb} />}
          leftSidebar={<Sidebar />}
          actionBar={actionBar}
          content={content}
        />
      </div>
    );
  }
}

CategoryList.propTypes = propTypes;

export default CategoryList;
