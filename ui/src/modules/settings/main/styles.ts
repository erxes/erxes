import { colors, dimensions, typography } from 'modules/common/styles';
import { darken } from 'modules/common/styles/color';
import { BoxRoot } from 'modules/common/styles/main';
import styled from 'styled-components';

const columnTitleSize = 250;
const boxSize = 150;

const MenusContainer = styled.div`
  padding: ${dimensions.coreSpacing}px ${dimensions.headerSpacing}px;
`;

const Column = styled.div`
  display: flex;
  flex-direction: column;
  padding-top: ${dimensions.coreSpacing}px;

  @media (max-width: 1170px) {
    flex-direction: column;
    padding-left: ${dimensions.coreSpacing}px;
  }
`;

const ColumnTitle = styled.h3`
  font-size: ${typography.fontSizeHeading8 + 2}px;
  font-weight: ${typography.fontWeightMedium};
  text-transform: uppercase;
  margin: 0 0 ${dimensions.coreSpacing}px;
  color: ${colors.colorCoreDarkGray};
  flex-shrink: 0;

  > span {
    text-transform: initial;
    padding-left: 5px;
    color: #888;
    font-weight: normal;
  }
`;

const Box = styled(BoxRoot)`
  width: ${boxSize + 10}px;
  height: ${boxSize}px;
  border-color: transparent;

  img {
    height: 83px;
  }

  > a {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    height: 100%;

    &:focus {
      text-decoration: none;
    }
  }
`;

const Divider = styled.div`
  border-bottom: 1px dotted ${darken(colors.borderDarker, 5)};
  padding-bottom: ${dimensions.coreSpacing}px;
  margin: 0 ${dimensions.coreSpacing}px ${dimensions.coreSpacing}px
    ${columnTitleSize}px;

  @media (max-width: 1170px) {
    margin-left: ${dimensions.coreSpacing}px;
  }
`;

const BoxName = styled.span`
  font-size: ${typography.fontSizeUppercase}px;
  margin: 0 !important;
`;

export { Column, ColumnTitle, Box, Divider, BoxName, MenusContainer };
