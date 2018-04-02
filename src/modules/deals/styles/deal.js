import styled from 'styled-components';
import { colors, typography } from 'modules/common/styles';
import { rgba } from 'modules/common/styles/color';
import { coreHeight, stageWidth } from './deminsions';

const AddNew = styled.a`
  display: block;
  height: ${coreHeight}px;
  line-height: ${coreHeight - 2}px;
  text-align: center;
  border: 1px dashed ${colors.colorShadowGray};
  border-radius: 5px;
  color: ${rgba(colors.colorCoreDarkGray, 0.9)};
  font-size: 14px;
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    background: ${colors.bgLight};
  }

  i {
    margin-right: 8px;
  }
`;

const ContainerHover = styled.div`
  position: absolute;
  opacity: 0;
  z-index: 1;
  top: 0;
  right: 0;
  width: 40px;
  height: 40px;
  transition: all 0.3s ease;
  cursor: pointer;

  > div {
    position: absolute;
    top: 10px;
    right: 20px;
    font-size: 15px;
  }
`;

const Container = styled.div`
  position: relative;
  overflow: hidden;
  margin-bottom: 10px;
  padding: 15px;
  border-radius: 5px;
  border: 1px solid ${colors.borderPrimary};
  background-color: ${colors.bgLight};
  position: relative;
  transition: box-shadow 0.3s ease-in-out;
  box-shadow: ${props =>
    props.isDragging
      ? `0 0 20px 2px rgba(0, 0, 0, 0.15)`
      : '0 1px 5px 0 rgba(45, 60, 80, 0.1)'};

  &:hover {
    box-shadow: 0 0 20px 2px rgba(0, 0, 0, 0.15);
  }

  &:hover ${ContainerHover} {
    opacity: 1;
  }
`;

const SectionContainer = styled.div`
  padding: 10px 10px 0px 10px;
  border-top: 1px solid ${colors.borderPrimary};
`;

const Date = styled.span`
  font-size: 11px;
  background: ${rgba(colors.colorCoreRed, 0.8)};
  color: #fff;
  padding: 1px 5px;
  border-radius: 2px;
`;

const Amount = styled.div`
  margin-top: 10px;
  p {
    margin-om: 0;

    span {
      font-size: 10px;
      font-weight: bold;
    }
  }
`;

const FormAmount = styled.div`
  margin-top: 10px;
  p {
    margin-bottom: 0;
    font-weight: bold;
  }
`;

const FormContainer = styled.form`
  padding: 20px;
  border-radius: 5px;
  border: 1px dashed ${colors.colorShadowGray};
  background-color: #f6f6f6;

  .form-control {
    box-shadow: none;
    border-radius: 0;
    border: none;
    background: none;
    border-bottom: 1px solid ${colors.colorShadowGray};
    padding: 17px 14px;
    font-size: ${typography.fontSizeBody}px;

    &:focus {
      box-shadow: none;
      border-color: ${colors.colorSecondary};
    }
  }

  textarea {
    height: 62px;
  }
`;

const Button = styled.div`
  padding: 7px 10px;
  margin-bottom: 15px;
  background: ${colors.colorWhite};
  border-radius: 5px;
  cursor: pointer;
  border: 1px solid ${colors.borderPrimary};
  transition: all 0.3s ease;

  &:hover {
    background: ${colors.bgLight};
  }

  i {
    float: right;
  }
`;

const EditContainer = styled.div`
  position: fixed;
  top: 0;
  left: 70px;
  z-index: 2;
  width: 100%;
  height: 100%;
  background: ${rgba(colors.colorCoreDarkGray, 0.5)};

  > div {
    position: absolute;
    top: ${props => props.top && `${props.top}px`};
    bottom: 10px;
    left: ${props => `${props.left - 70}px`};

    ${FormContainer} {
      float: left;
      width: ${stageWidth - 30}px;
      overflow: auto;
      max-height: 100%;
    }
  }
`;

const MoveFormContainer = styled.div`
  position: absolute;
  top: 32px;
  left: ${stageWidth - 20}px;
  background: ${colors.colorWhite};
  width: 240px;
  padding: 20px;
`;

const RightControls = styled.div`
  float: left;
  margin-left: 10px;

  button {
    display: block;
    background: ${rgba(colors.colorCoreDarkGray, 0.9)};
    margin: 0 0 10px 0;
    color: ${colors.colorWhite};
    text-transform: none;
  }
`;

const FormFooter = styled.div`
  text-align: right;
  margin-top: 20px;
`;

const Footer = styled.div`
  tion: relative;
  ing-right: 40px;
`;

const FormBody = styled.div`
  display: flex;
`;

const Left = styled.div`
  display: flex;
`;

const Right = styled.div`
  display: flex;
  width: 300px;
`;

export {
  AddNew,
  Container,
  SectionContainer,
  ContainerHover,
  Footer,
  Date,
  Amount,
  FormAmount,
  Button,
  FormContainer,
  MoveFormContainer,
  FormFooter,
  EditContainer,
  RightControls,
  FormBody,
  Left,
  Right
};
