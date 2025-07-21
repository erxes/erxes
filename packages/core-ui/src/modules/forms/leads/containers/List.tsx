import ListContainer from '@erxes/ui-forms/src/forms/containers/List';
import React from 'react';

type Props = {
  queryParams: any;
  location?: any;
  navigate?: any;
};

const List = ({ queryParams, location, navigate }: Props) => {
  console.log(queryParams);
  console.log(location);
  console.log(navigate);
  
  return (
    <ListContainer
      type='lead'
      queryParams={queryParams}
      location={location}
      navigate={navigate}
      title='Leads'
    />
  );
};

export default List;
