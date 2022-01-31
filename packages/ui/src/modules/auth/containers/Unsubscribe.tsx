import { getEnv } from 'modules/common/utils';

const redirect = (name, value) => {
  const { REACT_APP_API_URL } = getEnv();
  window.location.href = `${REACT_APP_API_URL}/unsubscribe?${name}=${value}`;
};

const Unsubscribe = props => {
  const { queryParams } = props;

  if (queryParams) {
    const { uid, cid } = queryParams;

    if (cid) {
      redirect('cid', queryParams.cid);
    }

    if (uid) {
      redirect('uid', queryParams.uid);
    }
  }

  return null;
};

export default Unsubscribe;
