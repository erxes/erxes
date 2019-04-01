import { colors } from 'modules/common/styles';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import { borderRadius } from './deminsions';

const FlexContent = styled.div`
  display: flex;
`;

const Container = styledTS<{ isDragging?: boolean }>(styled.div)`
  overflow: hidden;
  margin-bottom: 8px;
  padding: 8px;
  outline: 0;
  border-radius: ${borderRadius};
  background-color: ${colors.colorWhite};
  transition: box-shadow 0.3s ease-in-out;
  box-shadow: ${props =>
    props.isDragging
      ? `10px 15px 35px 4px rgba(0, 0, 0, 0.2)`
      : '0 1px 2px 0 rgba(0, 0, 0, 0.2)'};

  h4 {
    margin-top: 0;
    font-weight: normal;
    font-size: 14px;
    margin-bottom: 5px;
    flex: 1;
    line-height: 1.4;
  }
`;

const DealDate = styled.span`
  font-size: 11px;
  color: ${colors.colorCoreGray};
  z-index: 10;
  cursor: help;
  margin-left: 5px;
  flex-shrink: 0;
`;

const HeaderRow = styled(FlexContent)`
  margin-bottom: 40px;
`;

const HeaderContent = styled.div`
  flex: 1;
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
  background: ${colors.colorWhite};
  cursor: pointer;
  border-bottom: 1px solid ${colors.borderDarker};
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

const SpaceContent = styled(FlexContent)`
  position: relative;
  justify-content: space-between;
`;

const FooterContent = styled.div`
  flex: 1;
`;

const Left = styled.div`
  margin-right: 20px;
  flex: 1;

  textarea {
    resize: none;
  }
`;

const Right = styled.div`
  width: 280px;
  flex-shrink: 0;

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

const MoveContainer = styled(FlexContent)`
  display: flex;
  margin-bottom: 20px;
  align-items: center;
`;

const MoveFormContainer = styled.div`
  margin-right: 20px;
  position: relative;
`;

const SelectContainer = styled.div`
  position: absolute;
  top: 30px;
  left: 0;
  width: 300px;
  padding: 20px;
  z-index: 100;
  box-shadow: 0 0 8px 1px rgba(221, 221, 221, 0.7);
  background: ${colors.colorWhite};
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

const StageItem = styledTS<{ isPass: boolean }>(styled.li)`
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
    cursor: pointer;
    background: ${colors.bgLight};
  }

  i {
    font-size: 30px;
    color: ${props =>
      props.isPass ? colors.colorSecondary : colors.colorShadowGray};
  }
`;

const ItemList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0 0 0 12px !important;
  display: block;
  overflow: hidden;
  position: relative;

  > li {
    float: left;
    line-height: 18px;

    &:after {
      content: ', ';
      margin-right: 5px;
    }

    &:last-child:after {
      display: none;
    }
  }
`;

const PortableItem = styledTS<{ uppercase: boolean }>(styled.li)`
  text-transform: ${props => (props.uppercase ? 'uppercase' : 'normal')};
  font-size: ${props => (props.uppercase ? '10px' : '12px')};
  align-items: center;
  vertical-align: bottom;

  &:first-child:before {
    content: '';
    width: 8px;
    height: 8px;
    float: left;
    border-radius: 1px;
    background: ${props =>
      props.color ? `${props.color}` : `${colors.colorShadowGray}`};
    position: absolute;
    top: 4px;
    left: 0;
  }
`;

const SelectValue = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-left: -7px;
  padding-left: 25px;

  img {
    position: absolute;
    left: 0;
  }
`;

const SelectOption = styled.div`
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

const Avatar = styled.img`
  width: 20px;
  height: 20px;
  border-radius: 10px;
  background: ${colors.bgActive};
  float: left;
  margin-right: 5px;
`;

const AddContainer = styled.form`
  ${SelectContainer} {
    position: relative;
    top: 0;
    width: 100%;
    padding: 0;
    background: none;
    box-shadow: none;
  }
`;

const ActionInfo = styled(SpaceContent)`
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px dashed ${colors.colorShadowGray};

  span {
    font-size: 10px;
  }
`;

const DealFooter = styled.div`
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px dashed ${colors.colorShadowGray};

  span {
    font-size: 10px;
  }
`;

const Status = styled.div`
  margin-bottom: 4px;
  overflow: hidden;

  > span {
    border-radius: 2px;
    padding: 1px 4px;
    font-size: 10px;
    color: #fff;
    float: left;
  }
`;

const UserCounterContainer = styled.ul`
  margin-bottom: 0;
  list-style: none;
  padding: 0;
  flex-shrink: 0;
  align-self: flex-end;

  li {
    float: left;
    border: 2px solid ${colors.colorWhite};
    width: 28px;
    height: 28px;
    line-height: 26px;
    border-radius: 14px;
    background: ${colors.colorCoreLightGray};
    text-align: center;
    color: ${colors.colorWhite};
    overflow: hidden;
    margin-left: -12px;
    font-size: 10px;

    img {
      width: 100%;
      vertical-align: top;
    }
  }
`;

export {
  Container,
  SpaceContent,
  FooterContent,
  DealDate,
  HeaderRow,
  HeaderContent,
  HeaderContentSmall,
  Button,
  MoveFormContainer,
  SelectContainer,
  PipelineName,
  FormFooter,
  FlexContent,
  Left,
  Right,
  MoveContainer,
  Stages,
  ItemList,
  PortableItem,
  StageItem,
  SelectOption,
  SelectValue,
  Avatar,
  AddContainer,
  ActionInfo,
  Status,
  UserCounterContainer,
  DealFooter
};
