import { colors, dimensions } from '@erxes/ui/src/styles';
import styled, { css } from 'styled-components';

import Button from '@erxes/ui/src/components/Button';
import { Flex } from '@erxes/ui/src/styles/main';
import { FormContainer } from '../styles/common';
import { borderRadius } from './common';
import { rgba } from '@erxes/ui/src/styles/ecolor';
import styledTS from 'styled-components-ts';

const buttonColor = '#0a1e3c';

export const Content = styled.div`
  padding: 12px 22px;
  word-break: break-word;
  background: rgba(10, 30, 65, 0.05);
  margin-top: 10px;
  transition: background 0.3s ease;
  border-radius: 3px;
  min-height: 50px;
  p {
    color: ${colors.textPrimary};
    font-size: 13px;
  }
  img,
  table,
  * {
    max-width: 576px !important;
  }
  ul,
  ol {
    padding-left: 20px;
    margin: 0 0 10px;
  }
  &:hover {
    background: rgba(10, 30, 65, 0.08);
    cursor: pointer;
  }
`;

export const PriceContainer = styled.div`
  overflow: hidden;
  ul {
    float: left;
  }
`;

export const Left = styled.div`
  float: left;
`;

export const Right = styled.div`
  float: right;
`;

export const Footer = styled.div`
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

export const LastUpdate = styled.div`
  margin-top: -18px;
  font-size: ${dimensions.unitSpacing - 1}px;

  span {
    font-size: ${dimensions.unitSpacing - 1}px;
  }
`;

export const ColumnChild = styled.td`
  &:first-child {
    width: 500px;
  }

  &:last-child {
    text-align: left !important;
  }
`;

export const LabelColumn = styled.td`
  width: 300px;
`;

export const StageColumn = styled.td`
  width: 200px;
  span {
    font-weight: 500;
    color: ${colors.textSecondary};
  }
`;

export const HeaderRow = styled(Flex)`
  margin-bottom: 30px;
`;

export const HeaderContent = styled.div`
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

export const AddRow = styled(Flex)`
  margin-bottom: 10px;
`;

export const AddContent = styled.div`
  flex: 1;
  textarea {
    min-height: 60px;
    padding: 5px 0;
    &:focus {
      border-bottom: 1px solid ${colors.colorSecondary};
    }
  }

  input {
    border: none;
    width: 100%;
    height: 34px;
    padding: 5px 0;
    color: #444;
    border-bottom: 1px solid;
    border-color: ${colors.borderDarker};
    background: none;
    border-radius: 0;
    box-shadow: none;
    font-size: 13px;
    position: relative;
    margin-left: 20px;
  }

  .dateTime {
    margin-right: ${dimensions.coreSpacing}px;

    &:before {
      content: '\\e9a8';
      font-style: normal;
      font-family: 'erxes';
      font-size: 16px;
      position: absolute;
      color: #777;
      left: 0;
      top: 25px;
    }
  }

  .form-control:focus {
    border: none;
    border-bottom: 1px solid;
    border-color: #ddd;
    box-shadow: none;
  }
`;

export const TitleRow = styled.div`
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

export const ContentWrapper = styledTS<{ isEditing: boolean }>(styled.div)`
  ${props =>
    props.isEditing &&
    css`
      margin-bottom: ${dimensions.coreSpacing}px;
      background-color: ${colors.colorWhite};
      box-shadow: 0 0 6px 1px ${colors.shadowPrimary};
      ${TitleRow} {
        padding: ${dimensions.unitSpacing}px ${dimensions.coreSpacing}px;
      }
    `};
`;

export const MetaInfo = styled.div`
  display: flex;
  align-items: center;
  margin-top: 5px;
  > * {
    margin-right: 5px;
  }
`;

export const HeaderContentSmall = styled.div`
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

export const FormFooter = styled.div`
  text-align: right;
  margin-top: 20px;
`;

export const SpaceContent = styled(Flex)`
  position: relative;
  justify-content: space-between;
`;

export const LeftContainer = styled.div`
  margin-right: ${dimensions.coreSpacing}px;
  flex: 1;
  max-width: 620px;
  textarea {
    resize: none;
  }
`;

export const WatchIndicator = styled.span`
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

export const RightContent = styled.div`
  width: 280px;
  flex-shrink: 0;
  margin-bottom: ${dimensions.unitSpacing}px;
`;

export const RightButton = styled(Button)`
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

export const MoveContainer = styled(Flex)`
  margin-bottom: 20px;
  align-items: center;
  position: relative;
  will-change: contents;
`;

export const MoveContainerWidth = styled(Flex)`
  width: 600px;
`;

export const ActionContainer = styled(MoveContainer)`
  flex-wrap: wrap;
  > div {
    margin: 0 ${dimensions.unitSpacing / 2}px ${dimensions.unitSpacing / 2}px 0;
  }
`;

export const MoveFormContainer = styled.div`
  margin-right: 20px;
  position: relative;
  z-index: 100;
  will-change: transform;
`;

export const ItemsWrapper = styled.div`
  padding: 12px 12px 0 12px;
  > div {
    box-shadow: rgba(0, 0, 0, 0.2) 0px 0px 4px 0px;
    background: ${colors.bgLight};
  }
`;

export const PipelineName = styled.div`
  font-weight: bold;
  font-size: 15px;
  &:hover {
    cursor: pointer;
  }
`;

export const PipelinePopoverContent = styled.div`
  padding: 30px 10px 10px 30px;
  width: 300px;
`;

export const Stages = styled.ul`
  flex: 1;
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  margin: 0;
  padding: 0;
`;

export const StageItem = styledTS<{ isPass: boolean }>(styled.li)`
  text-align: right;
  position: relative;
  margin-left: 10px;
  line-height: 35px;
  height: 35px;
  flex: 1;

  &:first-child {
    flex: unset;
    &:before {
      display: none;
    }
    i {
      margin-left: 0;
    }
  }

  &:last-child i {
    margin-right: 0;
  }

  &:before {
    content: '';
    height: 2px;
    background: ${props =>
      props.isPass ? colors.colorSecondary : colors.colorShadowGray};
    width: 100%;
    top: 50%;
    margin-top: 0;
    left: 0;
    position: absolute;
    margin-left: -10px;
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
    margin: 0 -3px;
    color: ${props =>
      props.isPass ? colors.colorSecondary : colors.colorShadowGray};
  }
`;

export const SelectValue = styled.div`
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

export const SelectOption = styled.div`
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

export const Avatar = styled.img`
  width: 20px;
  height: 20px;
  border-radius: 10px;
  background: ${colors.bgActive};
  float: left;
  margin-right: 5px;
`;

export const Status = styled.div`
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

export const ArchiveStatus = styled.div`
  background-color: #fdfae5;
  background-image: linear-gradient(
    to bottom right,
    rgba(0, 0, 0, 0.05) 25%,
    transparent 0,
    transparent 50%,
    rgba(0, 0, 0, 0.05) 0,
    rgba(0, 0, 0, 0.05) 75%,
    transparent 0,
    transparent
  );
  background-size: 14px 14px;
  min-height: 30px;
  padding: 12px 12px 12px 40px;
  span {
    font-size: 16px;
    padding-left: 10px;
  }
  i {
    font-size: 16px;
  }
`;

export const BoardSelectWrapper = styled.div`
  ${FormContainer} {
    padding: 0;
  }
`;
