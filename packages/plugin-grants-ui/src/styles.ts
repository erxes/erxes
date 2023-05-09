import styledTS from 'styled-components-ts';
import styled from 'styled-components';
import { colors, dimensions } from '@erxes/ui/src';
import { highlight } from '@erxes/ui/src/utils/animations';

export const SectionContent = styledTS<{}>(styled.div)`
    display:flex;
    padding: 10px 10px;
    justify-content:space-around;
    align-items: center;
`;

export const Padding = styledTS<{
  horizontal?: boolean;
  vertical?: boolean;
  padding?: string;
}>(styled.div)`
  padding: ${({ horizontal, vertical, padding }) =>
    !horizontal && !vertical
      ? '10px'
      : `${vertical ? (padding ? `${padding}px` : '10px') : '0px'} ${
          horizontal ? (padding ? `${padding}px` : '10px') : '0px'
        }`}
`;
export const ClearableBtn = styled.a`
  cursor: pointer;
`;

export const SidebarHeader = styled.h5`
  margin-bottom: ${dimensions.coreSpacing}px;
  color: ${colors.colorPrimary};
  padding-left: 10px;
`;

export const SelectBox = styled.div`
  display: flex;
  width: 125px;
  height: 40px;
  text-align: center;
  margin-bottom: 5px;
  border-radius: 6px;
  box-shadow: 0 0 5px 0 rgba(221, 221, 221, 0.7);
  justify-content: center;
  place-items: center;
  cursor: pointer;
  gap: 5px;

  &.active {
    animation: ${highlight} 0.9s ease;
    box-shadow: 0 0 5px 0 #63d2d6;
  }
`;

export const SelectBoxContainer = styledTS<{
  row?: boolean;
}>(styled.div)`
  display: flex;
  flex-wrap: wrap;
  flex-direction: ${({ row }) => row && 'row'};
  padding-top:10px;
  place-content:center;
  gap: 5px;
`;
