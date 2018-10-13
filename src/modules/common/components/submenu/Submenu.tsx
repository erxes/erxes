import { ISubMenuItem } from 'modules/common/types';
import { __ } from 'modules/common/utils';
import * as React from 'react';
import styled from 'styled-components';
import { dimensions } from '../../styles';
import MenuItem from './MenuItem';

const Items = styled.ul`
  display: inline-block;
  padding: 0;
  margin: 0;
  list-style: none;
  font-size: 14px;
`;

function Submenu({ items }: { items?: ISubMenuItem[] }) {
  if (items) {
    return (
      <Items>
        {items.map(b => (
          <MenuItem to={b.link || ''} key={b.title}>
            {b.title}
          </MenuItem>
        ))}
      </Items>
    );
  }

  return null;
}

export default Submenu;
