import ActiveList from '../components/ActiveList';
import React from 'react';
import { useNavigate } from 'react-router-dom';

type Props = {
  queryParams: any;
};

const ActiveListContainer = (props: Props) => {
  const navigate = useNavigate();

  const updatedProps = {
    ...props,
  };

  return <ActiveList {...updatedProps} />;
};

export default ActiveListContainer;
