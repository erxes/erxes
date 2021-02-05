import colors from 'erxes-ui/lib/styles/colors';
import { FlexContent } from 'modules/layout/styles';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

export const Wrapper = styled.div`
  margin: 20px;
`;

export const Content = styledTS<{ width?: number }>(styled.div)`
  max-width: ${props => (props.width ? props.width : 500)}px;
`;

export const Domain = styled(FlexContent)`
  align-items: flex-end;

  span {
    font-size: 14px;
    font-weight: 500;
    flex: initial;
  }
`;

export const Circle = styledTS<{ active: boolean }>(styled.div)`
  display: inline-box;
  margin-right: 6px;
  background-color: ${props =>
    props.active ? colors.colorCoreGreen : 'white'};
  width: 14px;
  height: 14px;
  border-radius: 7px;
  border: 0.5px lightGray solid;
`;
