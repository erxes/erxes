import ListContainer from '@erxes/ui-forms/src/forms/containers/List';
import React from 'react';

type Props = {
  queryParams: any;
  location?: any;
  navigate?: any;
};

const List = ({ queryParams, location, navigate }: Props) => {  
  return (
    <ListContainer
      type='bm-tours'
      queryParams={queryParams}
      location={location}
      navigate={navigate}
      title='Tour forms'
    />
  );
};

export default List;
