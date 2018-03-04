import React from 'react';
import { Row as CommonRow } from '../../common/components';
import { UserForm } from '../containers';
import { NameCard } from 'modules/common/components';
import { withRouter } from 'react-router';

class Row extends CommonRow {
  constructor(props) {
    super(props);

    this.size = 'lg';
  }

  renderForm(props) {
    return <UserForm {...props} />;
  }

  renderRole() {
    const { object } = this.props;

    if (object.isOwner) {
      return 'owner';
    }

    return object.role;
  }

  render() {
    const { object, history } = this.props;
    const { email } = object;

    return (
      <tr>
        <td
          onClick={() => {
            history.push(`team/details/${object._id}`);
          }}
        >
          <NameCard user={object} avatarSize={30} singleLine />
        </td>
        <td>{email}</td>
        <td>{this.renderRole()}</td>

        {this.renderActions()}
      </tr>
    );
  }
}

export default withRouter(Row);
