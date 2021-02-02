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
