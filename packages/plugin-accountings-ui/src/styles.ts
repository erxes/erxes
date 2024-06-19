import { colors, dimensions } from '@erxes/ui/src/styles';
import styled from 'styled-components';

const Box = styled('div')`
  flex: 1;
  padding: ${dimensions.unitSpacing * 1.5}px;
  text-align: left;
  background: ${colors.colorWhite};
  margin: 10px 10px 0 0;
`;

const DropdownList = styled.div`
  max-height: 300px;
  overflow-y: auto;

  h3 {
    cursor: default;
  }

  li {
    padding: 5px 15px;
    white-space: nowrap;
    
    &:hover {
      background: ${colors.bgGray};
    }
  }
`;

const DropdownNoPadding = styled.div`
  [id^="headlessui-menu-items-"] {
    padding: 0;
  } 
`

export {
  Box,
  DropdownList,
  DropdownNoPadding,
};
