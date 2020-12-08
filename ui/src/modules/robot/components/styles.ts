import { colors, dimensions } from 'modules/common/styles';
import { fadeIn } from 'modules/common/utils/animations';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

const SubContent = styled.div`
  padding: 0 16px;

  p {
    font-size: 12px;
    color: ${colors.textSecondary};
  }
`;

const Greeting = styled(SubContent)`
  margin-bottom: 16px;
  font-size: 18px;
  line-height: 27px;
  letter-spacing: -0.2px;

  span {
    margin-left: 5px;
  }

  p {
    margin-top: ${dimensions.unitSpacing}px;
    color: ${colors.colorCoreGray};
    font-size: 18px;
  }
`;

const Bot = styled.div`
  position: fixed;
  bottom: 0px;
  width: 70px;
  padding: 10px 0;
  text-align: center;
  z-index: 15;

  &:hover {
    cursor: pointer;
  }

  img {
    width: 42px;
  }
`;

const Title = styled.h2`
  margin: 0 0 16px;
  font-size: 16px;
  text-transform: capitalize;
`;

const NavButton = styledTS<{ right?: boolean }>(styled.div)`
  margin-bottom: 10px;
  border-radius: 20px;
  display: inline-block;
  text-align: center;
  width: 28px;
  height: 28px;
  margin-left: ${props => !props.right && '-7px'};;
  float: ${props => props.right && 'right'};
  background: ${props => props.right && colors.bgActive};
  position: sticky;
  top: -5px;

  &:hover {
    background: ${props =>
      props.right ? colors.borderDarker : colors.bgActive};
    cursor: pointer;
  }

  i {
    line-height: 28px;
  }
`;

const Content = styled.div`
  position: fixed;
  padding: ${dimensions.coreSpacing}px;
  border-radius: 10px;
  background: ${colors.colorWhite};
  min-width: 320px;
  box-shadow: 0 5px 15px 1px rgba(0, 0, 0, 0.15);
  bottom: 65px;
  left: 15px;
  max-height: calc(100% - 75px);
  overflow: auto;
  flex-direction: column;
  z-index: 15;
`;

const ContentWrapper = styled.div`
  width: 280px;
`;

const SubHeader = styled.a`
  font-weight: 600;
  color: rgb(119, 120, 122);
  display: flex;
  justify-content: space-between;

  &:hover {
    cursor: pointer;
  }
`;

const CompletedTaskWrapper = styled.div`
  padding: 0 16px;
  margin-top: 16px;
`;

const CompletedTaskName = styled.div`
  font-size: 14px;
  margin-top: 5px;
  color: #9b9c9e;
  text-decoration-line: line-through;

  &:hover {
    cursor: pointer;
    color: ${colors.textSecondary};
  }
`;

const RestartButton = styled.a`
  &:hover {
    text-decoration: underline;
    cursor: pointer;
  }
`;

const BackDrop = styled.div`
  position: fixed;
  top: 0;
  width: 100%;
  height: 100%;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(48, 67, 92, 0.8);
  z-index: 13;
  transition: opacity 0.3s;
  animation-name: ${fadeIn};
  animation-duration: 0.8s;
  animation-timing-function: linear;
`;

const ProgressText = styled.div`
  color: ${colors.colorCoreGray};
  font-size: 12px;
`;

export {
  Bot,
  Greeting,
  SubContent,
  Title,
  NavButton,
  Content,
  ContentWrapper,
  SubHeader,
  BackDrop,
  CompletedTaskWrapper,
  CompletedTaskName,
  ProgressText,
  RestartButton
};
