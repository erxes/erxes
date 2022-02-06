import { colors, dimensions } from 'modules/common/styles';
import { fadeIn } from 'modules/common/utils/animations';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

const SubContent = styled.div`
  padding: 0px;
  p {
    font-size: 12px;
    color: ${colors.textSecondary};
  }
  h5 {
    margin-top: 20px;
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

const Bot = styledTS<{ collapsed: boolean }>(styled.div)`
  position: fixed;
  bottom: 0px;
  width: ${props => (props.collapsed ? '160px' : '70px')};
  padding: 10px 0;
  text-align: center;
  z-index: 15;
  display: ${props => props.collapsed && 'flex'};
  align-items: center;

  &:hover {
    cursor: pointer;
  }
`;

const BotWrapper = styledTS<{ collapsed: boolean }>(styled.div)`
  background: ${props => props.collapsed && 'rgba(0,0,0,0.13)'};
  display: flex;
  align-items: center;
  justify-content: ${props => !props.collapsed && 'center'};
  padding: ${props => props.collapsed && ' 0px 10px 0px 0px'};
  color: ${colors.colorWhite};
  border-radius: ${dimensions.coreSpacing}px;
  margin: 0px 0px ${dimensions.unitSpacing}px ${props =>
  props.collapsed ? dimensions.unitSpacing + 5 : 0}px;

  > span {
    margin-right: ${props => props.collapsed && dimensions.unitSpacing - 2}px;
    padding: ${dimensions.unitSpacing - 6}px;
    background: ${colors.colorSecondary};
    border-radius: ${dimensions.coreSpacing}px ${dimensions.coreSpacing}px ${
  dimensions.coreSpacing
}px 2px;
    transition: all 0.3s ease-in 0s;

    img {
      width: 38px;
    }
  }
`;

const BotText = styled.h5`
  margin: ${dimensions.unitSpacing - 4}px 0 0 ${dimensions.unitSpacing - 5}px;
  text-transform: capitalize;
  font-weight: normal;
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
  bottom: 80px;
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

const Container = styled.div`
  width: 280px;
  p {
    margin-top: 20px;
  }
`;

const SetupList = styled.div`
  margin-bottom: 20px;
  div {
    border-radius: ${dimensions.unitSpacing}px;
    background-color: #fafafa;
    a {
      padding: 5px 10px;
      h4 {
        font-size: 12px;
        background-color: #fafafa;
        text-transform: uppercase;
      }
    }
    div {
      div {
        padding: 0px;
        background: ${colors.colorWhite};
        div {
          border-radius: 0px;
          padding: 10px;
        }
      }
    }
  }
`;

const Text = styled.div`
  font-weight: normal;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 1px solid #eee;
  border-top: none;

  &:hover {
    cursor: pointer;
    background-color: #fafafa;
    font-weight: 500;
  }

  h6 {
    margin: 0px;
    font-weight: 400;
    width: 70%;
  }

  p {
    margin: 0px;
    font-size: 11px;
    background-color: rgba(101, 105, 223, 0.8);
    color: white;
    padding: 2px 5px 2px;
    border-radius: ${dimensions.unitSpacing}px;
  }
`;

export {
  Bot,
  BotText,
  Greeting,
  SubContent,
  Title,
  NavButton,
  Content,
  ContentWrapper,
  SubHeader,
  BackDrop,
  BotWrapper,
  CompletedTaskWrapper,
  CompletedTaskName,
  ProgressText,
  RestartButton,
  Container,
  SetupList,
  Text
};
