import React, { PropTypes, Component } from 'react';
import { Button, Table } from 'react-bootstrap';
import { Wrapper } from '/imports/react-ui/layout/components';
import { ModalTrigger, Pagination } from '/imports/react-ui/common';
import { InviteForm } from '../components';
import Sidebar from '../../Sidebar.jsx';
import Row from './Row.jsx';


const propTypes = {
  users: PropTypes.array.isRequired,
  channels: PropTypes.array.isRequired,
  deactivate: PropTypes.func.isRequired,
  inviteMember: PropTypes.func.isRequired,
  updateInvitationInfos: PropTypes.func.isRequired,
  loadMore: PropTypes.func.isRequired,
  hasMore: PropTypes.bool.isRequired,
};

class UsersList extends Component {
  constructor(props) {
    super(props);

    this.renderRows = this.renderRows.bind(this);
  }

  renderRows() {
    const { users, channels, deactivate, updateInvitationInfos } = this.props;

    return users.map(user =>
      <Row
        user={user}
        channels={channels}
        deactivate={deactivate}
        updateInvitationInfos={updateInvitationInfos}
        key={user._id}
      />
    );
  }

  render() {
    const { hasMore, loadMore } = this.props;
    const trigger = (
      <Button bsStyle="link">
        <i className="ion-plus-circled" /> Invite a new member
      </Button>
    );

    const actionBarLeft = (
      <ModalTrigger title="Invite a new member" trigger={trigger}>
        <InviteForm
          save={this.props.inviteMember}
          user={{ emails: [{}], details: {} }}
          channels={this.props.channels}
        />
      </ModalTrigger>
    );

    const actionBar = (
      <Wrapper.ActionBar left={actionBarLeft} />
    );

    const content = (
      <Pagination loadMore={loadMore} hasMore={hasMore}>
        <Table>
          <thead>
            <tr>
              <th>Full name</th>
              <th>Email</th>
              <th>Role</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {this.renderRows()}
          </tbody>
        </Table>
      </Pagination>
    );

    const breadcrumb = [
      { title: 'Settings', link: '/settings/channels' },
      { title: 'Team members' },
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

UsersList.propTypes = propTypes;

export default UsersList;
