import styled from 'styled-components';
import { dimensions, colors } from '@erxes/ui/src/styles';

export const Attributes = styled.ul`
  list-style: none;
  margin: 0;
  right: 20px;
  max-height: 200px;
  min-width: 200px;
  overflow: auto;
  padding: ${dimensions.unitSpacing}px;
  border-radius: ${dimensions.unitSpacing - 5}px;

  > div {
    padding: 0;
  }

  b {
    margin-bottom: ${dimensions.unitSpacing + 10}px;
    color: black;
  }

  li {
    color: ${colors.colorCoreGray};
    padding-bottom: ${dimensions.unitSpacing - 5}px;
    cursor: pointer;
    font-weight: 400;
    transition: all ease 0.3s;

    &:hover {
      color: ${colors.textPrimary};
    }
  }
`;

export const ActionFooter = styled.div`
  padding: ${dimensions.unitSpacing}px;
  bottom: ${dimensions.coreSpacing}px;
`;
