import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import User from '../components/User.jsx';


const propTypes = {
  user: PropTypes.object.isRequired,
};

function UserContainer({ user }) {
  return <User user={user} />;
}

UserContainer.propTypes = propTypes;

const mapStateToProps = (state, ownProps) => {
  const users = state.users || [];
  const user = users.find(s => s._id === ownProps.id) || {};
  return { user };
};

export default connect(mapStateToProps)(UserContainer);
