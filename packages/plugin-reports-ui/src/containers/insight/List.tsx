import React from 'react';
import List from '../../components/insight/List';

type Props = {
  component: any;
  queryParams: any;
  history: any;
};

const ListContainer = (props: Props) => {
  const { queryParams, history, component } = props;

  const updatedProps = {
    ...props,
  };

  return <List {...updatedProps} />;
};

export default ListContainer;
