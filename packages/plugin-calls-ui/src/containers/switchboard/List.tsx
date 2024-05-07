import React, { useEffect, useState } from 'react';
import { __ } from '@erxes/ui/src/utils';
import List from '../../components/switchboard/List';

type IProps = {
  navigate: any;
  location: any;
};

function ListContainer(props: IProps) {
  useEffect(() => {}, []);
  console.log('switchboard container');
  return <List {...props}/>;
}

export default ListContainer;
