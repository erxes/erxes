import * as React from 'react';
import { withRouter } from 'react-router';
import styled from 'styled-components';
import { NameCard } from 'modules/common/components';
import { Row as CommonRow } from '../../common/components';
import { UserForm } from '../containers';

const UserAvatar = styled.td`
  &:hover {
    cursor: pointer;
  }
`;

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
        <UserAvatar
          onClick={() => {
            history.push(`team/details/${object._id}`);
          }}
        >
          <NameCard user={object} avatarSize={30} singleLine />
        </UserAvatar>
        <td>{email}</td>
        <td>{this.renderRole()}</td>

        {this.renderActions()}
      </tr>
    );
  }
}

export default withRouter(Row);
