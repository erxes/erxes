import styled from 'styled-components';
import { colors } from 'modules/common/styles';
import { coreHeight } from './deminsions';

const Container = styled.div`
  background-color: ${colors.colorWhite};
  box-shadow: 0 0 8px 0px ${colors.colorShadowGray};

  &:not(:first-child) {
    margin-top: 20px;
  }
`;

const Header = styled.div`
  width: 100%;
  height: ${coreHeight}px;
  padding: 0 20px;
  background: ${colors.bgLight};
  border-bottom: 1px solid ${colors.colorShadowGray};

  h2 {
    margin: 0;
    padding: 0;
    line-height: ${coreHeight - 2}px;
    font-weight: normal;
    font-size: 13px;
    color: ${colors.colorCoreDarkGray};
  }
`;

const Body = styled.div`
  overflow-x: auto;

  > div:not([class]) {
    display: inline-flex;
  }
`;

export { Container, Header, Body };
