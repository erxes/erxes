import React, { Component, PropTypes } from 'react';
import { Table, Button } from 'react-bootstrap';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Wrapper } from '/imports/react-ui/layout/components';
import { Pagination } from '/imports/react-ui/common';
import Sidebar from '../../Sidebar';
import Row from './row';

const propTypes = {
  kbTopics: PropTypes.array.isRequired,
  brands: PropTypes.array.isRequired,
  removeKbTopic: PropTypes.func.isRequired,
  loadMore: PropTypes.func.isRequired,
  hasMore: PropTypes.bool.isRequired,
};

class List extends Component {
  constructor(props) {
    super(props);

    this.renderKbTopics = this.renderKbTopics.bind(this);
  }

  renderKbTopics() {
    const { brands, kbTopics, removeKbTopic } = this.props;

    return kbTopics.map(kbTopic => (
      <Row key={kbTopics._id} kbTopic={kbTopic} brands={brands} removeKbTopic={removeKbTopic} />
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
            {this.renderKbTopics()}
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

List.propTypes = propTypes;

export default List;
