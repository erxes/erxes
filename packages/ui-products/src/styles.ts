import { colors, dimensions, typography } from '@erxes/ui/src/styles';
import { lighten } from '@erxes/ui/src/styles/ecolor';
import styled from 'styled-components';

export const CategoryContainer = styled.div`
  flex: 1;
  flex-shrink: 0;
`;

export const BarcodeContainer = styled.div`
  margin: 6px 0px;
`;

export const BarcodeItem = styled.div`
  padding: 6px 6px;
  &:hover {
    cursor: pointer;
    color: ${lighten(colors.textPrimary, 40)};
    background: ${colors.bgActive};
    text-decoration: line-through;
  }
`;
