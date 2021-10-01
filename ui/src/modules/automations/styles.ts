import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import { RightMenuContainer } from 'modules/boards/styles/rightMenu';
import { Contents } from 'modules/layout/styles';
import { rgba } from 'modules/common/styles/color';
import { DateWrapper } from 'modules/forms/styles';
import { HeaderContent } from 'modules/boards/styles/item';
import { dimensions, colors } from 'modules/common/styles';

export const Container = styled.div`
  padding: ${dimensions.coreSpacing}px;
  height: 100%;
  background-image: radial-gradient(
    ${colors.bgActive} 20%,
    ${colors.colorWhite} 20%
  );
  background-size: ${dimensions.unitSpacing}px ${dimensions.unitSpacing}px;

  #canvas {
    position: relative;
    height: 100%;

    .note-badge {
      position: absolute;
      right: -${dimensions.unitSpacing}px;
      bottom: -${dimensions.unitSpacing}px;
      width: 35px;
      height: 35px;
      line-height: 35px;
      text-align: center;
      border-radius: 35px;
      border: 1px solid ${colors.borderDarker};
      background: ${colors.colorWhite};
      transition: all ease 0.3s;

      > i {
        color: ${colors.colorCoreGray};
        font-size: 16px;
      }

      &:hover {
        box-shadow: 0 0 2px 0 rgba(0, 0, 0, 0.4);
      }
    }

    .show-action-menu .custom-menu {
      visibility: visible;
      top: -28px;
    }

    .custom-menu {
      position: absolute;
      right: 0;
      margin: 0;
      top: ${dimensions.unitSpacing}px;
      visibility: hidden;
      transition: all 0.2s linear;

      i {
        background: #e3deee;
        margin-left: ${dimensions.unitSpacing - 5}px;
        padding: ${dimensions.unitSpacing - 5}px;
        border-radius: 50%;
        color: ${colors.colorSecondary};
        cursor: pointer;
        border: 1px solid ${colors.colorSecondary};
        transition: transform 0.5s;
        transform: scale(1.5);

        &.note {
          background: ${rgba(colors.colorSecondary, 0.12)};
          color: ${colors.colorSecondary};
          border: 1px solid ${colors.colorSecondary};
        }

        &.delete-control {
          background: #ffe4e7;
          color: ${colors.colorCoreRed};
          border: 1px solid ${colors.colorCoreRed};
        }

        &:hover {
          box-shadow: 0 0 2px 0 rgba(0, 0, 0, 0.4);
        }
      }
    }

    path,
    .jtk-endpoint {
      cursor: pointer;
    }
  }

  .jtk-connector {
    z-index: 4;
  }

  .jtk-endpoint {
    z-index: 5;
  }

  .jtk-overlay {
    z-index: 6;
  }

  .trigger,
  .action {
    max-width: 300px;
    position: absolute;
    padding: 3px;
    background: #f5f5f5;
    border: 1px solid ${colors.borderPrimary};
    border-radius: 8px;
    cursor: pointer;
    z-index: 8;

    .trigger-header {
      background: ${rgba(colors.colorPrimary, 0.12)};
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-radius: 4px;
      font-weight: 500;
      font-size: 14px;
      padding: ${dimensions.unitSpacing}px;

      > div {
        display: flex;
        align-items: center;
        margin-right: ${dimensions.coreSpacing}px;

        > i {
          width: 40px;
          height: 40px;
          border-radius: 4px;
          font-size: 24px;
          line-height: 40px;
          text-align: center;
          flex-shrink: 0;
          margin-right: ${dimensions.unitSpacing}px;
          background: ${colors.colorWhite};
          color: ${colors.colorSecondary};
        }
      }
    }

    > p {
      font-size: 13px;
      text-align: center;
      margin: 0;
      padding: ${dimensions.unitSpacing + 5}px ${dimensions.unitSpacing}px;
      color: ${colors.colorCoreGray};
    }

    &.scratch {
      top: 40%;
      display: flex;
      align-items: center;
      flex-direction: column;
      padding: 20px 10px 10px;
      transition: all ease 0.3s;

      > i {
        width: 40px;
        height: 40px;
        line-height: 40px;
        background: ${rgba(colors.colorSecondary, 0.12)};
        border-radius: 40px;
        color: ${colors.colorSecondary};
        text-align: center;
      }

      &:hover {
        border-color: ${colors.colorSecondary};
      }
    }
  }

  .action {
    .trigger-header {
      background: ${rgba(colors.colorCoreOrange, 0.12)};

      > div > i {
        color: ${colors.colorCoreOrange} !important;
      }
    }
  }
`;

export const TriggerBox = styledTS<{ selected?: boolean }>(styled.div)`
  background: ${colors.colorWhite};
  border-radius: 2px;
  border: ${props =>
    props.selected
      ? `2px solid ${colors.colorPrimary}`
      : `1px solid ${colors.borderPrimary}`};
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-right: ${dimensions.coreSpacing}px;
  padding: ${dimensions.unitSpacing}px;
  cursor: pointer;
  text-transform: capitalize;
  color: ${colors.colorCoreGray};
  transition: all ease 0.3s;

  > i {
    color: ${colors.colorSecondary};
  }

  &:hover {
    box-shadow: 0 6px 10px 1px rgba(136, 136, 136, 0.12);
  }
`;

export const ConditionContaier = styled.div`
  padding: ${dimensions.coreSpacing}px;
  transition: all ease 0.5s;
  background: ${colors.bgGray};
  border-radius: 8px;
  .dropdown {
    display: none;
  }
`;

export const CenterFlexRow = styled.div`
  display: flex;
  align-items: center;
`;

export const Title = styled(CenterFlexRow)`
  transition: all ease 0.3s;
  padding: 0 ${dimensions.unitSpacing}px;
  border-radius: 4px;

  input {
    border: 0;
    font-size: 16px;
  }

  i {
    visibility: hidden;
  }

  &:hover {
    background: ${colors.bgActive};

    i {
      visibility: visible;
    }
  }
`;

export const BackButton = styled.div`
  width: 35px;
  height: 35px;
  border-radius: 35px;
  line-height: 35px;
  background: rgba(0, 0, 0, 0.12);
  text-align: center;
  margin-right: ${dimensions.unitSpacing}px;
  color: ${colors.textPrimary};
  transition: all ease 0.3s;

  &:hover {
    background: rgba(0, 0, 0, 0.18);
  }
`;

export const BackIcon = styled.div`
  cursor: pointer;
  display: flex;
  align-items: center;
  margin: ${dimensions.unitSpacing}px 0;
  font-weight: 500;

  > i {
    width: 24px;
    height: 24px;
    border-radius: 24px;
    line-height: 24px;
    text-align: center;
    margin-right: ${dimensions.unitSpacing - 5}px;
    background: #f5f5f5;
    color: ${colors.colorPrimary};
    transition: all ease 0.3s;
  }

  &:hover {
    i {
      box-shadow: 0 0 2px 0 rgba(101, 105, 223, 0.4);
    }
  }
`;

export const TypeBoxContainer = styled.div`
  position: relative;

  .ctrl {
    position: absolute;
    top: 4px;
    right: 15px;

    i {
      padding: 0 5px;
    }

    &:hover {
      cursor: pointer;
    }
  }
`;

export const TypeBox = styled(CenterFlexRow)`
  border: 1px solid ${colors.borderPrimary};
  border-radius: ${dimensions.unitSpacing - 5}px;
  padding: ${dimensions.unitSpacing - 4}px ${dimensions.coreSpacing}px;
  margin-top: ${dimensions.unitSpacing}px;
  transition: all ease 0.3s;
  cursor: pointer;
  display: flex;
  justify-content: space-between;

  label {
    cursor: pointer;
  }

  > img {
    width: 60px;
    margin-right: ${dimensions.unitSpacing}px;
  }

  > div {
    margin: 0;
  }

  &:hover {
    border-color: ${colors.colorSecondary};
    box-shadow: 0px 8px 20px rgba(79, 51, 175, 0.24),
      0px 2px 6px rgba(79, 51, 175, 0.16), 0px 0px 1px rgba(79, 51, 175, 0.08);
  }
`;

export const RightDrawerContainer = styled(RightMenuContainer)`
  background: ${colors.colorWhite};
  width: 500px;
  padding: ${dimensions.unitSpacing}px;
  z-index: 10;
`;

export const CenterBar = styled.div`
  position: absolute;
  left: 40%;

  > div {
    height: 30px;
    border: 1px solid ${colors.borderDarker};
    border-radius: ${dimensions.coreSpacing + dimensions.unitSpacing}px;

    span {
      font-weight: 500;
      padding: 4px ${dimensions.coreSpacing}px;
      border-radius: ${dimensions.coreSpacing + dimensions.unitSpacing}px;

      &.active {
        background: ${colors.colorSecondary};
        color: ${colors.colorWhite};

        &:before {
          content: none;
        }
      }
    }
  }

  @media (max-width: 1600px) {
    left: 30%;
  }
`;

export const AutomationFormContainer = styled(Contents)`
  margin: 0;

  > section {
    margin: 0;
  }
`;

export const ScrolledContent = styled.div`
  flex: 1;
  overflow: auto;
`;

export const Notes = styled.div`
  max-height: 600px;
  overflow: auto;
  margin-bottom: ${dimensions.coreSpacing}px;
  padding-right: ${dimensions.coreSpacing}px;

  .column {
    border-bottom: 1px solid ${colors.borderDarker};
    margin-bottom: ${dimensions.coreSpacing}px;

    > div {
      display: flex;
      justify-content: space-between;
      align-items: center;

      > div > div {
        flex-direction: column;
        align-items: flex-start;
        padding-left: ${dimensions.unitSpacing}px;

        time {
          padding: 0;
        }
      }

      i {
        font-size: 13px;
      }
    }

    > p {
      color: ${colors.textPrimary};
      margin-top: ${dimensions.unitSpacing}px;
    }
  }
`;

export const TriggerTabs = styled.div`
  .hxZkUW {
    border: 1px solid ${colors.borderPrimary};
    border-radius: 5px;
    padding: 2px;

    > span {
      flex: 1;
      flex-shrink: 0;
      text-align: center;
      font-weight: 500;
      padding: ${dimensions.unitSpacing - 4}px ${dimensions.coreSpacing}px
      border-radius: ${dimensions.unitSpacing - 5}px;

      &.active {
        background: ${colors.colorSecondary};
        color: ${colors.colorWhite};

        &:before {
          display: none;
        }
      }
    }
  }
`;

export const Description = styled.div`
  margin: ${dimensions.coreSpacing}px ${dimensions.unitSpacing}px
    ${dimensions.unitSpacing}px;

  h4 {
    margin: 0;
    font-size: 16px;
  }

  > p {
    margin: ${dimensions.unitSpacing - 5}px 0 0 0;
    color: ${colors.colorCoreGray};
  }
`;

export const ActionBarButtonsWrapper = styled.div`
  @media (max-width: 1450px) {
    max-width: 350px;
    white-space: normal;
    text-align: right;
    margin-bottom: ${dimensions.unitSpacing}px;

    > button {
      margin-top: ${dimensions.unitSpacing - 5}px;
    }
  }
`;

export const ToggleWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-right: ${dimensions.coreSpacing}px;

  > div {
    margin: 0 ${dimensions.unitSpacing}px;
  }

  > span {
    font-weight: 500;

    &.active {
      color: ${colors.colorCoreGray};
    }
  }
`;

export const EmptyContent = styled.div`
  display: flex;
  height: 100%;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  > img {
    width: 300px;
  }

  p {
    text-align: center;
    max-width: 400px;

    b {
      margin: ${dimensions.unitSpacing}px 0;
      display: block;
    }
  }
`;

export const EnrollmentWrapper = styledTS<{ noMargin?: boolean }>(styled.div)`
  border: 1px solid ${colors.borderPrimary};
  padding: ${dimensions.unitSpacing}px;
  margin: ${props => (props.noMargin ? '0 0 10px' : '10px 0 0')};
  border-radius: 5px;

  > div {
    display: flex;
    align-items: center;
    justify-content: space-between;

    p {
      color: ${colors.colorCoreGray};
      margin: 0 ${dimensions.headerSpacing}px 0 0;
    }
  }
`;

export const StyledToggle = styled.div`
  display: block;
  justify-content: center !important;
  background: ${rgba(colors.colorPrimary, 0.12)};
  padding: ${dimensions.coreSpacing}px;
  border-radius: 5px;

  .react-toggle-track {
    background-color: #bcbeed;
  }

  .react-toggle-thumb {
    border-color: #bcbeed;
  }

  .react-toggle--checked .react-toggle-track,
  .react-toggle:hover:not(.react-toggle--disabled) .react-toggle-track {
    background-color: ${colors.colorCoreGreen} !important;
  }

  .react-toggle--checked .react-toggle-thumb {
    border-color: ${colors.colorCoreGreen} !important;
  }
`;

export const Checkbox = styled.div`
  flex-direction: column;
  align-items: flex-start !important;

  > label {
    margin-bottom: 5px;
    display: block;
  }
`;

export const LeftSidebar = styled.ul`
  list-style: none;
  margin: 0;
  width: 300px;

  > li {
    font-weight: 500;
    cursor: pointer;
    font-size: 14px;
    margin-bottom: ${dimensions.unitSpacing}px;

    &.active {
      color: ${colors.colorSecondary};
    }
  }
`;

export const SettingsLayout = styled.div`
  padding: ${dimensions.headerSpacing}px 0 ${dimensions.coreSpacing}px;
  display: flex;
  font-size: 14px;
`;

export const SettingsContent = styled.div`
  padding: 0 ${dimensions.coreSpacing}px;
  flex: 1;

  h3 {
    text-transform: capitalize;
    margin: 0 0 ${dimensions.coreSpacing}px 0;
    font-size: ${dimensions.coreSpacing}px;
  }

  label {
    display: block;
    margin-bottom: ${dimensions.unitSpacing}px;
  }

  p {
    color: ${colors.colorCoreGray};
    font-weight: 500;
    margin-top: ${dimensions.unitSpacing}px;
  }
`;

export const SpecificTimeContainer = styled.div`
  .row {
    display: flex;
    margin: 0;

    > span,
    button {
      padding: 0 ${dimensions.coreSpacing}px ${dimensions.coreSpacing}px;
      color: ${colors.colorCoreGray};
      display: flex;
      align-items: center;
    }
  }

  label {
    display: none;
  }

  .Select {
    width: 200px;
    flex: initial !important;

    span .Select-value-label {
      color: ${colors.textPrimary} !important;
    }
  }

  .hATdPU span {
    color: ${colors.colorCoreGray};
  }
`;

export const DateControlWrapper = styled(DateWrapper)`
  .date-row {
    display: flex;
    align-items: center;
    margin-bottom: ${dimensions.coreSpacing}px;

    > span,
    label {
      flex: inherit;
      margin: 0 ${dimensions.coreSpacing}px 0 0;
    }
  }
`;

export const UnEnroll = styled.div`
  > div {
    margin-bottom: ${dimensions.unitSpacing}px;
  }
`;

export const DrawerDetail = styled.div`
  padding: ${dimensions.coreSpacing}px;
  border: 1px solid ${colors.borderPrimary};
  border-radius: 5px;
`;

export const ZoomActions = styled.div`
  position: absolute;
  font-size: 11px;
  z-index: ${dimensions.unitSpacing};

  > .icon-wrapper {
    display: table;
    border: 1px solid ${colors.borderDarker};
    border-radius: ${dimensions.unitSpacing - 6}px;
    margin-bottom: ${dimensions.unitSpacing - 5}px;
  }
`;

export const ZoomIcon = styledTS<{ disabled: boolean }>(styled.div)`
  width: ${dimensions.coreSpacing}px;
  height: ${dimensions.coreSpacing}px;
  line-height: ${dimensions.coreSpacing}px;
  text-align: center;
  background: ${props =>
    props.disabled ? colors.bgActive : colors.colorWhite};
  cursor: ${props => (props.disabled ? 'not-allowed' : 'pointer')};
  margin: 0;
  transition: all ease .3s;

  > i {
    font-weight: 500;
    font-size: 11px;

    &:before {
      font-weight: 700;
    }
  }

  &:first-child {
    border-bottom: 1px solid ${colors.borderDarker};
    padding-bottom: 3px;
  }

  &:hover {
    background: ${colors.bgLight};
    opacity: .8;
  }
`;

export const BoardHeader = styled(HeaderContent)`
  .header-row {
    display: flex;
    justify-content: space-between;

    > div > span {
      color: ${colors.colorSecondary};
      font-weight: 500;
      cursor: pointer;
      margin-left: ${dimensions.unitSpacing}px;
    }
  }
`;
