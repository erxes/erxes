import { IBreadCrumbItem } from '../../types';
import { __ } from '../../utils/core';
import React from 'react';
import styled from 'styled-components';
import MenuItem from './MenuItem';

const Items = styled.ul`
  display: inline-block;
  padding: 0;
  margin: 0;
  list-style: none;
  font-size: 14px;

  > span {
    padding: 14px 40px 14px 0;
    cursor: pointer;
  }
`;

function Submenu({
  items,
  additionalMenuItem
}: {
  items?: IBreadCrumbItem[];
  additionalMenuItem?: React.ReactNode;
}) {
  
  const getLink = (url) => {
    const storageValue = window.localStorage.getItem('pagination:perPage');

    let parsedStorageValue;

    try {
      parsedStorageValue = JSON.parse(storageValue || '');
    } catch {
      parsedStorageValue = {};
    }

    if (url.includes('?')) {
      const pathname = url.split('?')[0];

      if(!url.includes('perPage') && parsedStorageValue[pathname]){
          return `${url}&perPage=${parsedStorageValue[pathname]}`;
      } 

      return url;
    }  

    if (parsedStorageValue[url]) {
      return `${url}?perPage=${parsedStorageValue[url]}`;
    }

    return url;
   }

  if (items) {
    return (
      <Items>
        {items.map(b => (
          <MenuItem to={getLink(b.link) || ''} key={b.title}>
            {__(b.title)}
          </MenuItem>
        ))}
        {additionalMenuItem}
      </Items>
    );
  }

  return null;
}

export default Submenu;
