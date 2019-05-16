import { colors } from 'modules/common/styles';
import styled from 'styled-components';
import { coreHeight } from './common';

const Container = styled.div`
  background-color: ${colors.colorWhite};
  box-shadow: 0 0 8px 0 ${colors.shadowPrimary};

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
  display: flex;
  justify-content: space-between;
  align-items: center;

  h2 {
    margin: 0;
    padding: 0;
    line-height: ${coreHeight - 2}px;
    font-weight: bold;
    font-size: 14px;
    color: ${colors.colorCoreDarkGray};

    i {
      color: ${colors.colorPrimaryDark};
      margin-right: 5px;
    }
  }
`;

const Body = styled.div`
  overflow-x: auto;

  > div:not([class]) {
    display: inline-flex;
  }
`;

export { Container, Header, Body };
