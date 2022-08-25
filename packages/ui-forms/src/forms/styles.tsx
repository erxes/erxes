import {
  DragHandler,
  SortItem,
  SortableWrapper
} from '@erxes/ui/src/styles/sort';
import { Formgroup, SelectWrapper } from '@erxes/ui/src/components/form/styles';
import { colors, dimensions } from '@erxes/ui/src/styles';
import styled, { css } from 'styled-components';

import { SidebarMainContent } from '@erxes/ui/src/layout/styles';
import { rgba } from '@erxes/ui/src/styles/ecolor';
import styledTS from 'styled-components-ts';

const FlexRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  > label {
    font-weight: 500;
  }
`;

const FieldWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  width: 48%;
  float: left;
  min-height: 110px;
  border: 1px solid ${colors.borderPrimary};
  border-radius: 4px;
  margin-bottom: 4%;
  padding: 20px;
  transition: all ease 0.3s;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);

  &:nth-of-type(even) {
    margin-left: 4%;
  }

  > i {
    margin-bottom: 10px;
  }

  &:hover {
    cursor: pointer;
    box-shadow: 0 10px 20px ${rgba(colors.colorCoreDarkGray, 0.12)};
  }
`;

const FieldsWrapper = styled.div`
  margin: 0 -10px;

  ${SortableWrapper} {
    overflow: visible;
    max-height: 100%;

    ${SortItem} {
      background: none;
      margin: 0;
      padding: 0;
      border: 0;

      > div {
        width: 100%;
        flex: 1;
      }

      ${DragHandler} {
        position: absolute;
        background: ${colors.colorWhite};
        top: 0;
        right: 0;
        margin-right: 0;
        z-index: 10;
        display: flex;
        justify-content: center;
        align-items: center;
        width: ${dimensions.headerSpacing - 20}px;
        height: ${dimensions.headerSpacing - 20}px;
        border-radius: 4px;
        opacity: 0;
        visibility: visible;
        border: 1px solid ${colors.borderPrimary};
        box-shadow: 0 0 4px ${colors.shadowPrimary};
        transition: all 0.3s ease;

        i {
          margin: 0;
          font-size: 16px;
        }
      }

      &:hover {
        ${DragHandler} {
          opacity: 1;
        }
      }
    }
  }
`;

const FormTop = styled.div`
  background: ${colors.bgLightPurple};
  margin: -25px -25px 20px -25px;
  padding: 25px 25px 5px 25px;
  border-bottom: 1px solid ${colors.borderPrimary};
`;

const FieldItem = styledTS<{
  selectType?: boolean;
  hasLogic?: boolean;
}>(styled.div)`

  padding: 10px 10px 0 10px;
  flex: 1;
  border-radius: 4px;

  ${props =>
    props.hasLogic &&
    css`
      border: 2px solid ${colors.colorCoreTeal};
      margin-bottom: 10px;
    `};

  input,
  textarea,
  select {
    box-sizing: border-box;
    transition: all 0.3s ease-in-out;
    background: #faf9fb;
    border: 1px solid ${colors.colorShadowGray};
    border-radius: 5px !important;
    box-shadow: inset 0 1px 3px 0 rgba(0, 0, 0, 0.07);
    color: #1a1a1a;
    display: block;
    font-size: 14px;
    height: 36px;
    line-height: 1.42857143;
    margin-top: ${props => !props.selectType && `${dimensions.unitSpacing}px`};
    outline: 0;
    padding: 6px 15px;
    width: 100%;

    &:focus {
      border-color: ${colors.colorShadowGray};
      background: ${colors.colorWhite};
    }

    &:after {
      top: 22px;
    }
  }

  textarea {
    overflow: auto;
    height: auto;
  }

  label {
    margin-right: 0;
  }

  .required {
    color: ${colors.colorCoreRed};
  }

  ${SelectWrapper} {
    margin-top: ${dimensions.unitSpacing}px;
    height: auto;
    border: none;
  }

  ${Formgroup} {
    margin-bottom: 10px;
  }
`;

const Options = styled.div`
  display: inline-block;
  width: 100%;
  margin-top: 10px;
`;

const LeftSection = styled.div`
  padding-right: ${dimensions.coreSpacing}px;
  width: 100%;
`;

const PreviewSection = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${dimensions.coreSpacing}px 0 ${dimensions.coreSpacing}px
    ${dimensions.coreSpacing}px;
`;

const Preview = styled.div`
  width: 85%;
`;

const ShowPreview = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: ${dimensions.coreSpacing}px;
  color: ${colors.colorCoreGray};
  font-size: 14px;

  > i {
    margin-right: ${dimensions.unitSpacing}px;
  }
`;

const Title = styled.h4`
  font-size: 16px;
  margin: 0 0 5px;
  font-weight: 500;
`;

const LogicItem = styled.div`
  background: ${colors.bgLight};
  border-radius: 4px;
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid ${colors.borderPrimary};
`;

const LogicRow = styled.div`
  display: flex;
  align-items: baseline;

  button {
    margin-left: ${dimensions.unitSpacing}px;
    padding: 3px 6px;
  }
`;

const RowSmall = styled.div`
  flex: 1;
  margin-right: ${dimensions.coreSpacing}px;
`;

const RowFill = styled.div`
  flex: 1;
`;

const DateWrapper = styled.div`
  input {
    border-radius: 0;
    border: 0;
    border-bottom: 1px solid ${colors.borderDarker};
    background: transparent;
    box-shadow: none !important;
  }
`;

const CustomRangeContainer = styled.div`
  margin-top: 10px;
  margin-bottom: 10px;
  display: flex;
  align-items: flex-end;
  > div {
    flex: 1;
    margin-right: 8px;
    input[type='text'] {
      border: none;
      width: 100%;
      height: 34px;
      padding: 5px 0;
      color: #444;
      border-bottom: 1px solid;
      border-color: #ddd;
      background: none;
      border-radius: 0;
      box-shadow: none;
      font-size: 13px;
    }
  }
`;

const FilterContainer = styled.div`
  padding: 10px 10px 10px 20px;
`;

const SidebarContainer = styled.div`
  ${SidebarMainContent} {
    overflow-x: unset;
    overflow-y: unset;
  }
`;

export {
  FieldWrapper,
  FieldItem,
  Options,
  Preview,
  ShowPreview,
  LeftSection,
  PreviewSection,
  FlexRow,
  Title,
  FieldsWrapper,
  FormTop,
  LogicItem,
  LogicRow,
  RowSmall,
  DateWrapper,
  RowFill,
  CustomRangeContainer,
  FilterContainer,
  SidebarContainer
};
