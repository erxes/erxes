import {
  ActivityContent,
  BoxRoot,
  ButtonRelated,
  CenterContent,
  CloseModal,
  Count,
  DateContainer,
  DateWrapper,
  DropIcon,
  FormColumn,
  FormWrapper,
  FullContent,
  HomeContainer,
  InfoWrapper,
  Limited,
  Links,
  MiddleContent,
  ModalFooter,
  ScrollWrapper,
  SimpleButton,
  TabContent,
  Title,
  TopHeader
} from 'erxes-ui/lib/styles/main';
import styled from 'styled-components';

const Pin = styled.div`
  width: 30px;
  height: 30px;
  border-radius: 50% 50% 50% 0;
  position: absolute;
  transform: rotate(-45deg);
  left: 50%;
  top: 50%;
  margin: -20px 0 0 -20px;
  animation-name: bounce;
  animation-fill-mode: both;
  animation-duration: 1s;
  &::after {
    content: '';
    width: 14px;
    height: 14px;
    margin: 8px 0 0 8px;
    background: #ffffff;
    position: absolute;
    border-radius: 50%;
  }

  @keyframes bounce {
    0% {
      opacity: 0;
      transform: translateY(-2000px) rotate(-45deg);
    }
    60% {
      opacity: 1;
      transform: translateY(30px) rotate(-45deg);
    }
    80% {
      transform: translateY(-10px) rotate(-45deg);
    }
    100% {
      transform: translateY(0) rotate(-45deg);
    }
  }
`;

const MapContainer = styled.div`
  width: 100%;
  height: 250px;
`;

export {
  BoxRoot,
  FullContent,
  ModalFooter,
  InfoWrapper,
  Links,
  FormWrapper,
  FormColumn,
  CenterContent,
  ActivityContent,
  DropIcon,
  MiddleContent,
  HomeContainer,
  DateWrapper,
  CloseModal,
  ScrollWrapper,
  DateContainer,
  TabContent,
  ButtonRelated,
  SimpleButton,
  TopHeader,
  Title,
  Count,
  Limited,
  Pin,
  MapContainer
};
