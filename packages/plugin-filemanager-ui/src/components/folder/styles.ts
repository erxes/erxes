import { colors, dimensions } from '@erxes/ui/src/styles';

import { ActionButtons } from '@erxes/ui-settings/src/styles';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

const FolderItemRow = styledTS<{
  isActive?: boolean;
}>(styled.li)`
  position: relative;
  background: ${props => props.isActive && colors.colorSecondary};
  padding-right: 20px;
  overflow: hidden;
  list-style: none;

  > div {
    padding: ${() => '10px 0 10px 20px'};
    display: flex;

    > a {
      white-space: normal;
      display: block;
      color: ${props =>
        props.isActive ? colors.colorWhite : colors.textPrimary};
      position: relative;
      flex: 1;
      display: flex;
      align-items: center;
      max-width: 100%;
      overflow: hidden;
  
      span {
        color: ${colors.colorCoreGray};
        padding-left: 5px;
      }
  
      img {
        width: 20px;
        margin-right: 5px;
      }
  
      &:focus {
        color: ${props => (props.isActive ? colors.colorWhite : 'inherit')};
        text-decoration: none;
      }
    }
  }

  .toggle-icon {
    padding-left: 15px;
    display: flex;
    align-items: center;
    cursor: pointer;
    
    > i {
      color: ${props =>
        props.isActive ? colors.colorWhite : colors.colorCoreGray};
      transition: all ease 0.3s;
    }
  }

  &:last-child {
    border: none;
  }

  &:hover {
    background: ${props =>
      props.isActive ? colors.colorSecondary : colors.bgActive};

    ${ActionButtons} {
      width: 60px;

      > button {
        color: ${props => props.isActive && colors.colorWhite} !important;
      }
    }
  }
`;
const RowActions = styled.div`
  font-size: 12px;
  color: ${colors.colorCoreGray};
  padding-right: ${dimensions.coreSpacing}px;

  i {
    padding: ${dimensions.unitSpacing}px 0;
  }

  &:hover {
    cursor: pointer;
  }
`;

const SectionHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const SectionTitle = styled.div`
  flex: 1;
  cursor: pointer;
  padding: 10px ${dimensions.coreSpacing}px;

  span {
    display: block;
    font-size: 12px;
    color: ${colors.colorCoreGray};
  }
`;

export { FolderItemRow, RowActions, SectionHead, SectionTitle };
