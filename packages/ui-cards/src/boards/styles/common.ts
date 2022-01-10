import { colors } from '@erxes/ui/src/styles';
import { Contents, MainContent } from '@erxes/ui/src/layout/styles';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

export const BoardContainer = styled(Contents)`
  margin: 0;
  position: unset;
  > div {
    padding-left: 20px;
  }
`;

export const BoardContent = styledTS<{
  bgColor?: string;
  transparent?: boolean;
}>(styled(MainContent))`
  margin: 0;
  background-color: ${({ bgColor, transparent }) =>
    transparent ? 'transparent' : bgColor || colors.colorSecondary};
`;
