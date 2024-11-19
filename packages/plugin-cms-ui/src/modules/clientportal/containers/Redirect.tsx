import React from 'react';
import { gql, useQuery } from '@apollo/client';
import { useLocation, useNavigate } from 'react-router-dom';

type Props = {
};

const GET_LAST_QUERY = gql`
  query clientPortalGetLast($kind: BusinessPortalKind) {
    clientPortalGetLast(kind: $kind) {
      _id
      name
      domain
      url
    }
  }
`;

const Redirect = (props: Props) => {
    const location = useLocation();
    const navigate = useNavigate();

  const { data, loading, error } = useQuery(GET_LAST_QUERY, {
    variables: { kind: 'client' },
  });

  console.log('data', data);

  if (data?.clientPortalGetLast?._id) {
    const cpId = data.clientPortalGetLast._id;
    navigate(`${location.pathname}/${cpId}`, { replace: true });
  }

//   React.useEffect(() => {
//     if (loading || error || !data?.clientPortalGetLast?._id) {
//       console.log('Loading:', loading, 'Error:', error, 'Data:', data);
//       return; // Wait for data to be ready
//     }

//     const cpId = data.clientPortalGetLast._id;
//     let path = '';

//     if (props.route === 'post') {
//       path = `/cms/posts/${cpId}`;
//     } else if (props.route === 'category') {
//       path = `/cms/categories/${cpId}`;
//     }

//     if (path) {
//       console.log('Navigating to:', path); // Debugging log
//       navigate(path, { replace: true });
//     }
//   }, [data, loading, error, navigate, props.route]);

  return null;
};

export default Redirect;
