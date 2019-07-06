import { SelectContainer } from 'modules/boards/styles/common';
import { colors } from 'modules/common/styles';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import { borderRadius } from './common';

const FlexContent = styled.div`
  display: flex;
`;

const PriceContainer = styled.div`
  overflow: auto;
  margin-top: 5px;

  ul {
    float: left;
  }
`;

const Right = styled.div`
  float: right;
`;

const Footer = styled.div`
  padding-top: 8px;
  margin-top: 8px;
  border-top: 1px dotted ${colors.borderPrimary};
  font-size: 11px;

  ul {
    float: left;
  }
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

const RightContent = styled.div`
  width: 280px;
  flex-shrink: 0;

  > button {
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
      box-shadow: 0 0 12px 1px rgba(190, 190, 190, 0.7);
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

  &:first-child {
    flex: unset;

    &:before {
      display: none;
    }
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

  span {
    position: relative;
    z-index: 10;
    cursor: pointer;
    background: ${colors.bgLight};
    display: inline-block;
  }

  i {
    font-size: 30px;
    color: ${props =>
      props.isPass ? colors.colorSecondary : colors.colorShadowGray};
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

const Status = styled.div`
  margin-bottom: 4px;
  overflow: hidden;

  > span {
    border-radius: ${borderRadius};
    padding: 1px 4px;
    font-size: 10px;
    color: #fff;
    float: left;
  }
`;

const UserCounterContainer = styled.ul`
  margin: 0;
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
  SpaceContent,
  FooterContent,
  HeaderRow,
  HeaderContent,
  HeaderContentSmall,
  Button,
  MoveFormContainer,
  PipelineName,
  FormFooter,
  FlexContent,
  Left,
  RightContent,
  MoveContainer,
  Stages,
  StageItem,
  SelectOption,
  SelectValue,
  Avatar,
  AddContainer,
  Status,
  UserCounterContainer,
  PriceContainer,
  Right,
  Footer
};
