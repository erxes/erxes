import React, { useEffect } from 'react';
import {  useQuery } from '@apollo/client';
import { useLocation, useNavigate } from 'react-router-dom';

import queries from '../graphql/queries';

const Redirect = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { data, loading, error } = useQuery(queries.GET_LAST_QUERY, {
    variables: { kind: 'client' },
  });

  useEffect(() => {
    if (data?.clientPortalGetLast?._id) {
      const cpId = data.clientPortalGetLast._id;
      navigate(`${location.pathname}?web=${cpId}`, { replace: true });
    }
  }, [data, navigate, location.pathname]);

  // You might want to handle loading or error states
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error loading data</div>;

  return null;
};

export default Redirect;
