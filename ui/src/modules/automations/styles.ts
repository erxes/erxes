import styled from 'styled-components';
import colors from 'modules/common/styles/colors';
import { dimensions } from 'erxes-ui/lib/styles/eindex';
import styledTS from 'styled-components-ts';
import { RightMenuContainer } from 'modules/boards/styles/rightMenu';
import { Contents } from 'modules/layout/styles';
import { rgba } from 'modules/common/styles/color';
import { DateWrapper } from 'modules/forms/styles';
import { HeaderContent } from 'modules/boards/styles/item';

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

    .show-action-menu .custom-menu {
      visibility: visible;
    }

    .custom-menu {
      z-index: 1000;
      position: absolute;
      right: 0;
      margin: 0;
      top: -35px;
      visibility: hidden;

      i {
        background: #e3deee;
        margin-left: ${dimensions.unitSpacing - 5}px;
        padding: ${dimensions.unitSpacing - 5}px;
        border-radius: 50%;
        color: ${colors.colorSecondary};
        cursor: pointer;
        border: 1px solid ${colors.colorSecondary};
        transition: all ease 0.3s;

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

      i {
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

export const ActionBox = styledTS<{
  isFavourite: boolean;
  isAvailable: boolean;
}>(styled(TriggerBox))`
  flex-direction: row;
  margin-top: ${dimensions.unitSpacing}px;
  margin-right: 0;
  position: relative;
  pointer-events: ${props => !props.isAvailable && 'none'};

  > i {
    margin-right: ${dimensions.unitSpacing}px;
    background: ${rgba(colors.colorPrimary, 0.12)};
    border-radius: 4px;
    width: 45px;
    height: 45px;
    line-height: 45px;
    text-align: center;
    font-size: 22px;
    flex-shrink: 0;
    color: ${colors.textPrimary};
  }

  > div {
    b {
      color: ${colors.textPrimary};
    }
    p {
      margin: 0;
      max-width: 350px;
    }
    span {
      padding-left: ${dimensions.unitSpacing}px;
      color: ${colors.colorCoreOrange};
      font-weight: 500;
    }
  }

  .favourite-action {
    position: absolute;
    width: 30px;
    text-align: right;
    right: ${dimensions.coreSpacing}px;

    > i {
      color: ${props => props.isFavourite && colors.colorCoreOrange}
    }
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

  .ctrl i {
    padding: 0 5px;
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

export const Status = styledTS<{ isActive: boolean }>(styled.div)`
  color: ${props =>
    props.isActive ? colors.colorCoreGreen : colors.colorCoreGray};
  display: flex;
  align-items: center;
  text-transform: capitalize;

  &:before {
    content: '';
    width: 10px;
    height: 10px;
    border-radius: 10px;
    margin-right: 5px;
    background: ${props =>
      props.isActive ? colors.colorCoreGreen : colors.colorCoreGray};
  }
`;

export const EnrollmentWrapper = styled.div`
  border: 1px solid ${colors.borderPrimary};
  padding: ${dimensions.unitSpacing}px;
  margin-top: ${dimensions.unitSpacing}px;
  border-radius: 5px;

  > div {
    margin-top: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;

    > span {
      margin-right: ${dimensions.headerSpacing}px;

      b {
        text-transform: uppercase;
        display: block;
        margin-bottom: ${dimensions.unitSpacing}px;
      }

      p {
        color: ${colors.colorCoreGray};
      }
    }
  }

  > p {
    margin-top: ${dimensions.unitSpacing}px;
    font-weight: 500;
  }
`;

export const StyledToggle = styled.div`
  display: block;
  justify-content: center !important;
  background: ${rgba(colors.colorPrimary, 0.12)};
  padding: ${dimensions.coreSpacing}px;
  border-radius: 5px;

  .react-toggle-track {
    background-color: #aeb0eb;
  }

  .react-toggle-thumb {
    border-color: #aeb0eb;
  }

  .react-toggle--checked .react-toggle-track,
  .react-toggle:hover:not(.react-toggle--disabled) .react-toggle-track {
    background-color: ${colors.colorSecondary} !important;
  }

  .react-toggle--checked .react-toggle-thumb {
    border-color: ${colors.colorSecondary} !important;
  }
`;

export const Checkbox = styled.div`
  flex-direction: column;
  align-items: flex-start !important;

  > label {
    margin-bottom: 5px;
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

export const ActionFooter = styled.div`
  position: absolute;
  bottom: ${dimensions.coreSpacing}px;
`;

export const NoteContainer = styled.div``;

export const ZoomActions = styled.div`
  display: flex;
  flex-direction: column;
  position: absolute;
  align-items: center;
  font-size: 11px;
  z-index: 999;

  > .icon-wrapper {
    border: 1px solid ${colors.borderDarker};
    border-radius: 4px;
    padding: 3px;
    margin-bottom: 5px;

    > i {
      display: block;
      font-weight: 500;
      font-size: 11px;
      padding: 0 3px;
      cursor: pointer;
      background: ${colors.colorWhite};

      &:before {
        font-weight: 700;
      }

      &:first-child {
        border-bottom: 1px solid ${colors.borderDarker};
        padding-bottom: 3px;
      }
    }
  }
`;

export const BoarHeader = styled(HeaderContent)`
  .header-row {
    display: flex;
    justify-content: space-between;

    > span {
      color: ${colors.colorSecondary};
      font-weight: 500;
      cursor: pointer;
    }
  }
`;

export const Attributes = styled.ul`
  list-style: none;
  margin: 0;
  right: 20px;
  height: 250px;
  overflow: auto;
  padding: ${dimensions.unitSpacing}px;
  border-radius: ${dimensions.unitSpacing - 5}px;

  b {
    margin-bottom: ${dimensions.unitSpacing - 5}px;
  }

  li {
    color: ${colors.colorCoreGray};
    padding-bottom: ${dimensions.unitSpacing - 5}px;
    cursor: pointer;
    transition: all ease 0.3s;

    &:hover {
      color: ${colors.textPrimary};
    }
  }
`;
