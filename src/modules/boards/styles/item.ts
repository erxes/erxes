import Button from 'modules/common/components/Button';
import { colors, dimensions } from 'modules/common/styles';
import { rgba } from 'modules/common/styles/color';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import { borderRadius } from './common';

const buttonColor = '#0a1e3c';

const FlexContent = styled.div`
  display: flex;
`;

const PriceContainer = styled.div`
  ul {
    float: left;
  }
`;

const Left = styled.div`
  float: left;
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

  > i {
    padding: 3px;
  }
`;

const HeaderRow = styled(FlexContent)`
  margin-bottom: 30px;
`;

const HeaderContent = styled.div`
  flex: 1;

  textarea {
    border-bottom: none;
    min-height: auto;
    padding: 5px 0;

    &:focus {
      border-bottom: 1px solid ${colors.colorSecondary};
    }
  }
`;

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  font-size: 16px;

  i {
    margin-right: 8px;
  }

  label {
    font-size: 13px;
    text-transform: initial;
  }

  input {
    font-weight: bold;
  }

  textarea {
    font-weight: bold;
    border-bottom: none;
    min-height: auto;
    padding: 5px 0;

    &:focus {
      border-bottom: 1px solid ${colors.colorSecondary};
    }
  }
`;

const MetaInfo = styled.div`
  display: flex;
  align-items: center;
  margin-top: 5px;

  > * {
    margin-right: 5px;
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

const LeftContainer = styled.div`
  margin-right: ${dimensions.coreSpacing}px;
  flex: 1;

  textarea {
    resize: none;
  }
`;

const WatchIndicator = styled.span`
  position: absolute;
  background: ${colors.colorCoreGreen};
  right: 5px;
  top: 5px;
  bottom: 5px;
  display: flex;
  align-items: center;
  border-radius: ${borderRadius};
  padding: 3px;

  > i {
    color: ${colors.colorWhite};
    margin: 0 5px;
    font-size: 10px;
  }
`;

const RightContent = styled.div`
  width: 280px;
  flex-shrink: 0;
`;

const RightButton = styled(Button)`
  width: 100%;
  margin-bottom: 5px;
  margin-left: 0 !important;
  padding: 8px 40px 8px 20px;
  background: ${rgba(buttonColor, 0.04)};
  color: ${colors.textPrimary};
  text-align: left;
  border-radius: ${borderRadius};
  text-transform: none;
  font-size: 13px;
  box-shadow: none;
  position: relative;

  > i {
    color: ${colors.textPrimary};
    margin-right: 5px;
    font-size: 14px;
  }

  &:hover {
    color: ${colors.colorCoreDarkGray};
    background: ${rgba(buttonColor, 0.08)};
    box-shadow: none;
  }
`;

const MoveContainer = styled(FlexContent)`
  margin-bottom: 20px;
  align-items: center;
  position: relative;
`;

const ActionContainer = styled(MoveContainer)`
  flex-wrap: wrap;

  > div {
    margin: 0 ${dimensions.unitSpacing / 2}px ${dimensions.unitSpacing / 2}px 0;
  }
`;

const MoveFormContainer = styled.div`
  margin-right: 20px;
  position: relative;
`;

const PipelineName = styled.div`
  font-weight: bold;
  font-size: 15px;

  &:hover {
    cursor: pointer;
  }
`;

const PipelinePopoverContent = styled.div`
  padding: 30px 10px 10px 30px;
  width: 300px;
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

const Status = styled.div`
  margin-bottom: 4px;
  overflow: hidden;

  > span {
    border-radius: ${borderRadius};
    padding: 1px 4px;
    font-size: 10px;
    color: ${colors.colorWhite};
    float: left;
  }
`;

export {
  SpaceContent,
  FooterContent,
  HeaderRow,
  TitleRow,
  MetaInfo,
  HeaderContent,
  HeaderContentSmall,
  RightButton,
  MoveFormContainer,
  PipelineName,
  FormFooter,
  FlexContent,
  LeftContainer,
  RightContent,
  MoveContainer,
  Stages,
  StageItem,
  SelectOption,
  SelectValue,
  Avatar,
  Status,
  PriceContainer,
  Right,
  Left,
  Footer,
  WatchIndicator,
  ActionContainer,
  PipelinePopoverContent
};
