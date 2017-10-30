import { withCurrentUser } from 'modules/auth/containers';
import { AuthLayout } from '../components';

export default withCurrentUser(AuthLayout);
