import React, { useEffect, useState } from 'react';
import { __ } from '@erxes/ui/src/utils';
import List from '../../components/switchboard/List';

function ListContainer() {
  useEffect(() => {}, []);
    console.log('switchboard container')
  return <List/>;
}

export default ListContainer;
