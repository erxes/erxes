import React, { Component, PropTypes } from 'react';
import { Table, Button } from 'react-bootstrap';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Wrapper } from '/imports/react-ui/layout/components';
import { Pagination } from '/imports/react-ui/common';

const propTypes = {
  // integrations: PropTypes.array.isRequired,
  // brands: PropTypes.array.isRequired,
  // removeIntegration: PropTypes.func.isRequired,
  // loadMore: PropTypes.func.isRequired,
  // hasMore: PropTypes.bool.isRequired,
};

class List extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    // const { loadMore, hasMore } = this.props;

    // const actionBarLeft = (
    //   <Button bsStyle="link" href={FlowRouter.path('settings/integrations/add')}>
    //     <i className="ion-plus-circled" /> Add integrations
    //   </Button>
    // );

    // const actionBar = <Wrapper.ActionBar left={actionBarLeft} />;

    // const content = (
    //   <Pagination loadMore={loadMore} hasMore={hasMore}>
    //     <Table>
    //       <thead>
    //         <tr>
    //           <th>Name</th>
    //           <th>Kind</th>
    //           <th>Brand</th>
    //           <th width="183" className="text-right">Actions</th>
    //         </tr>
    //       </thead>
    //       <tbody>
    //         {this.renderIntegrations()}
    //       </tbody>
    //     </Table>
    //   </Pagination>
    // );

    // const breadcrumb = [
    //   { title: 'Settings', link: '/settings/integrations' },
    //   { title: 'Integrations' },
    // ];

    return <div />;
  }
}

List.propTypes = propTypes;

export default List;
