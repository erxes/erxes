import { connect } from 'react-redux';
import { User } from '../components';


const mapStateToProps = ({ users }, ownProps) => ({
  user: users.find(u => u._id === ownProps.id),
});

export default connect(mapStateToProps)(User);
