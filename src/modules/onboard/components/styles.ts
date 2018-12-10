import { colors, dimensions } from 'modules/common/styles';
import styled from 'styled-components';

const MainContainer = styled.div`
  display: flex;
  flex: 1;
  position: relative;
`;

const LeftContainer = styled.div`
  flex: 1;
  display: flex;
`;

const RightContent = styled.div`
  width: 500px;
  flex-shrink: 0;
  background: ${colors.colorPrimaryDark};
`;

const LeftContent = styled.div`
  margin: 100px -100px 100px 100px;
  z-index: 1;
  flex: 1;
  background: ${colors.colorWhite};
  box-shadow: 0px 0px 30px 3px rgba(0, 0, 0, 0.1);
`;

const Logo = styled.img`
  position: absolute;
  left: 100px;
  top: 30px;
  height: 40px;
`;

export { MainContainer, LeftContainer, RightContent, LeftContent, Logo };
