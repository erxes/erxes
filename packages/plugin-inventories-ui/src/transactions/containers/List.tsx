import React from 'react';
import { useQuery } from 'react-apollo';
// import { queries } from '../graphql';
import gql from 'graphql-tag';
import ListComponent from '../components/List';

const ListContainer = () => {
  return <ListComponent loading />;
};

export default ListContainer;
