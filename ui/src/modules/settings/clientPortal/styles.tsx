import { FlexContent } from 'modules/layout/styles';
import styled from 'styled-components';

export const Wrapper = styled.div`
  margin: 20px;
`;

export const Content = styled.div`
  max-width: 500px;
`;

export const Domain = styled(FlexContent)`
  align-items: flex-end;

  span {
    font-size: 14px;
    font-weight: 500;
    flex: initial;
  }
`;
