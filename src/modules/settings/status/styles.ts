import { colors, dimensions } from 'modules/common/styles';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

const Box = styledTS<{ noTopPadding?: boolean }>(styled.div)`
  padding: ${dimensions.coreSpacing}px;
  padding-bottom: 0;
  padding-top: ${props => props.noTopPadding && '0'};
  background: ${colors.colorWhite};
  margin-bottom: ${dimensions.unitSpacing}px;

  &:last-of-type {
    margin: 0;
  }
`;

const Title = styled.h4`
  border-bottom: 1px solid ${colors.borderPrimary};
  padding-bottom: ${dimensions.unitSpacing}px;
  text-transform: uppercase;
  font-size: 16px;
  margin-top: 0;
  color: ${colors.colorPrimary};
`;

const Group = styled.div`
  display: block;
  padding-bottom: ${dimensions.coreSpacing}px;

  span {
    font-size: 15px;
    color: ${colors.textSecondary};
    padding-bottom: 5px;
    display: block;
  }
`;

export { Title, Group, Box };
