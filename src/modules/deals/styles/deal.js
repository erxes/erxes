import styled from 'styled-components';
import { colors } from 'modules/common/styles';
import { rgba } from 'modules/common/styles/color';
import { coreHeight } from './deminsions';

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

  h4 {
    margin-top: 0;
    font-size: 13px;
  }
`;

const SectionContainer = styled.div`
  padding: 10px 10px 0px 10px;
  border-top: 1px solid ${colors.borderPrimary};
`;

const Date = styled.span`
  font-size: 11px;
`;

const HeaderRow = styled.div`
  display: flex;
  margin-bottom: 40px;
`;

const HeaderContent = styled.div`
  flex: 1;
`;

const Amount = styled.div`
  margin-top: 10px;
  font-weight: bold;

  p {
    margin-bottom: 0;

    span {
      font-size: 10px;
      font-weight: bold;
    }
  }
`;

const HeaderContentSmall = styled.div`
  text-align: right;
  margin-left: 20px;
  min-width: 160px;
  flex-shrink: 0;

  p {
    font-size: 16px;
    margin-bottom: 5px;
    font-weight: bold;
  }

  label {
    margin-right: 0;
  }

  input.form-control {
    box-shadow: none;
    border-radius: 0;
    border: none;
    background: none;
    text-align: right;
    border: none !important;
    padding: 0 !important;
    height: 20px;
    width: 160px;

    &:focus {
      box-shadow: none;
    }
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

const FormFooter = styled.div`
  text-align: right;
  margin-top: 20px;
`;

const Footer = styled.div`
  position: relative;
`;

const FormBody = styled.div`
  display: flex;
`;

const Left = styled.div`
  margin-right: 20px;
  flex: 1;
`;

const Right = styled.div`
  width: 280px;

  button {
    width: 100%;
    margin-bottom: 5px;
    margin-left: 0;
    padding: 15px 20px;
    background: ${colors.colorWhite};
    color: ${colors.textPrimary};
    text-align: left;
    border-radius: 0;
    text-transform: none;
    font-weight: 500;
    font-size: 13px;
    box-shadow: 0 0 8px 1px rgba(221, 221, 221, 0.7);

    i {
      color: ${colors.colorPrimary};
      margin-right: 5px;
    }

    &:hover {
      color: ${colors.textPrimary};
    }
  }
`;

const MoveContainer = styled.div`
  display: flex;
  margin-bottom: 20px;
  align-items: center;
`;

const MoveFormContainer = styled.div`
  margin-right: 20px;
  position: relative;

  form {
    position: absolute;
    top: 30px;
    left: 0;
    width: 300px;
    padding: 20px;
    z-index: 100;
    box-shadow: 0 0 8px 1px rgba(221, 221, 221, 0.7);
    background: ${colors.colorWhite};
  }
`;

const PipelineName = styled.div`
  font-weight: bold;

  &:hover {
    cursor: pointer;
  }
`;

const Stages = styled.ul`
  flex: 1;
  list-style: none;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin: 0;
  padding: 0;
  overflow: hidden;
`;

const StageItem = styled.li`
  flex: 1;
  text-align: right;
  position: relative;

  &:first-child:before {
    display: none;
  }

  &:before {
    content: '';
    height: 2px;
    background: ${props =>
      props.isPass ? colors.colorSecondary : colors.colorShadowGray};
    width: 100%;
    top: 50%;
    margin-top: -2px;
    left: -0;
    position: absolute;
  }

  a {
    position: relative;
    z-index: 10;
    background: ${colors.bgLight};
  }

  i {
    font-size: 30px;
    color: ${props =>
      props.isPass ? colors.colorSecondary : colors.colorShadowGray};
  }
`;

export {
  AddNew,
  Container,
  SectionContainer,
  ContainerHover,
  Footer,
  Date,
  HeaderRow,
  HeaderContent,
  Amount,
  HeaderContentSmall,
  Button,
  MoveFormContainer,
  PipelineName,
  FormFooter,
  FormBody,
  Left,
  Right,
  MoveContainer,
  Stages,
  StageItem
};
