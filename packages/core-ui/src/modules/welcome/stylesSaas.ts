import { colors, dimensions } from '@erxes/ui/src/styles';

import styled from 'styled-components';
import styledTS from 'styled-components-ts';

const WelcomeWrapper = styled.div`
  display: grid;
  grid-template-columns: 40% 60%;
  height: 100%;
`;

const LeftSideContent = styled.div`
  background: linear-gradient(119.44deg, #8D94FF 2.96%, #6335FF 51.52%, #8B73BD 100.08%);
  color: ${colors.colorWhite};
  padding: ${dimensions.headerSpacingWide}px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-content: center;

  h6 {
    margin-bottom: ${dimensions.unitSpacing}px;
  }

  h3 {
    margin: ${dimensions.unitSpacing}px 0 ${dimensions.unitSpacing + 5}px;
  }
`;

const RightSideContent = styled.div`
  padding: ${dimensions.coreSpacing}px;

  section {
    > h4 {
      color: #101828;
      font-weight: 700;
      margin: ${dimensions.coreSpacing}px 0 3px;
    }

    p {
      color: #667085;
      margin-bottom: ${dimensions.coreSpacing - 5}px;
    }
  }
`;

const Authors = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: ${dimensions.unitSpacing}px;

  img {
    margin: 0 ${dimensions.unitSpacing- 5}px;
    width: 22px;
  }
`;

const PlayVideo = styled.div`
  position: relative;
  margin-top: ${dimensions.unitSpacing}px;

  > img {
    width: 100%;
  }

  i {
    background: rgba(0, 0, 0, 0.4);
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    padding: ${dimensions.unitSpacing}px;
    border-radius: ${dimensions.unitSpacing}px;
    color: ${colors.colorWhite};
    cursor: pointer;
    width: 40px;
    height: 40px;
    text-align: center;
  }
`;

const SetupBoxes = styled.div`
  display: grid;
  justify-content: space-between;
  grid-template-columns: 32% 32% 32%;
  margin-bottom: 30px;
`;

const SetupBox = styledTS<{ comingSoon?: boolean }>(styled.div)`
  border: 1px solid ${colors.borderPrimary};
  border-radius: ${dimensions.unitSpacing}px;
  overflow: hidden;

  > div:first-child {
    background: linear-gradient(119.44deg, #8D94FF 2.96%, #6335FF 51.52%, #8B73BD 100.08%);
    display: flex;
    justify-content: center;
    align-items: center;
    height: 155px;

    img {
      padding: 0 ${dimensions.coreSpacing}px;
      max-width: 100%;
      max-height: 126px;
    }

    h4 {
      color: ${colors.colorWhite};
    }
  }

  h4 {
    padding: ${dimensions.coreSpacing}px ${dimensions.unitSpacing}px 5px;
    margin: 0;
    color: #101828;
    font-size: 14px;
    font-weight: 600;
  }

  p {
    color: #667085;
    padding: 0 ${dimensions.unitSpacing}px;
    line-height: 16px;
  }
`;

const SetupSteps = styledTS<{ disabled?: boolean }>(styled.div)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid ${colors.borderPrimary};
  padding: ${dimensions.unitSpacing}px;
  color: #667085;

  > div {
    flex: ${props => props.disabled && '1'};
  }

  button {
    border: 1px solid ${colors.borderPrimary};
    border-radius: 8px;
    font-weight: 700;
    font-size: 12px;
    padding: 5px;
    color: ${props => props.disabled ? colors.colorCoreGray: '#1D2939'} !important;
    cursor: ${props => props.disabled ? 'not-allowed': 'pointer'};
    background: ${props => props.disabled && colors.bgActive};
    width: ${props => props.disabled && '100%'};
    text-align: ${props => props.disabled && 'center'};
  }
`;

const SmallBox = styled.a`
  border: 1px solid ${colors.borderPrimary};
  border-radius: ${dimensions.unitSpacing}px;
  padding: ${dimensions.unitSpacing}px;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: all ease .3s;

  > img {
    max-height: 40px;
    width: 40px;
    padding: ${dimensions.unitSpacing}px;
    margin-right: ${dimensions.unitSpacing}px;
  }

  div {
    h4 {
      margin: 0;
      color: #101828;
      font-size: 15px;
      font-weight: 600;
    }

    p {
      margin: 5px 0 0 0;
      line-height: 15px;
    }
  }

  &:hover {
    background: ${colors.bgLight};
  }
`;

const DrawerContainer = styled.div`
  position: relative;
`;

const DrawerHeader = styled.div`
  padding: ${dimensions.unitSpacing}px;
  border-bottom: 1px solid ${colors.borderPrimary};
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 700;

  > i {
    width: 32px;
    height: 32px;
    background: #F2F4F7;
    color: #5D75C5;
    font-size: 10px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;

    &:before {
      font-weight: 700;
    }
  }
`;

const DrawerBody = styled.div`
  padding: ${dimensions.coreSpacing}px;
  overflow: auto;
  height: calc(100vh - 60px);
  
  .drawer-img {
    border-radius: 12px 12px 0 0;
    background: linear-gradient(119.44deg, #8D94FF 2.96%, #6335FF 51.52%, #8B73BD 100.08%);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: ${dimensions.unitSpacing}px;

    > img {
      max-width: 250px;
      max-height: 130px;
    }
  }

  > h4 {
    font-size: 16px;
    padding: ${dimensions.unitSpacing + 5}px 0 ${dimensions.unitSpacing - 5}px;
  }

  > p {
    padding: 0 !important;
  }
`;

const Tasks = styled.div`
  border-radius: 12px;
  border: 1px solid ${colors.borderPrimary};
`;

const TaskItem = styled.a`
  display: flex;
  align-items: center;
  border-bottom: 1px solid ${colors.borderPrimary};
  padding: ${dimensions.unitSpacing}px;
  cursor: pointer;
  transition: all ease .3s;

  > div {
    h4 {
      margin: 0;
      padding: 0;
      font-size: 14px;
      color: #101828;
    }

    span {
      color: #667085;
    }
  }

  &:hover {
    background: ${colors.bgActive};
  }
`;

const TaskItemIcon = styledTS<{ isDone?: boolean }>(styled.div)`
  background: ${props => props.isDone ? colors.colorCoreGreen : '#F2F4F7'};
  border: 1px solid ${colors.borderPrimary};
  border-radius: 50%;
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 45px;
  height: 45px;
  margin-right: ${dimensions.unitSpacing}px;

  > i {
    color: ${props => props.isDone ? colors.colorWhite : '#5D75C5'};
    font-size: 20px;
  }
`;

export {
  WelcomeWrapper,
  LeftSideContent,
  RightSideContent,
  Authors,
  PlayVideo,
  SetupBox,
  SetupSteps,
  SetupBoxes,
  SmallBox,
  DrawerContainer,
  DrawerHeader,
  DrawerBody,
  Tasks,
  TaskItem,
  TaskItemIcon
};
