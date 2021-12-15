import { colors, dimensions } from 'modules/common/styles';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

export const EmptyWrapper = styled.div`
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;

  .ant-empty-description {
    margin-top: 20px;
  }
`;

export const RowFill = styled.div`
  display: flex;
  padding: 5px 5px 5px 20px;
`;

export const FieldStyle = styled.div`
  margin: 2px 0 0 5px;
`;

export const ActivityList = styled.div`
  padding: ${dimensions.coreSpacing}px;
  position: relative;
  overflow: visible;
  margin: ${dimensions.coreSpacing}px;
  border-radius: 2px;
  height: auto;
  transition: height 0.3s ease-out 0s;
  background-color: rgb(255, 255, 255);
  box-shadow: rgb(0 0 0 / 8%) 0px 0px 6px 1px;
  word-break: break-word;
  font-weight: 500;
  font-size: 12px;
  display: flex;
`;

export const InfoSection = styled.div`
  align-self: center;
  display: flex;
  flex: 1 1 0%;
`;

export const DateType = styled.div`
  align-self: center;
  color: ${colors.colorCoreGray};
  font-size: 11px;
`;

export const GanttContainer = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  flex-direction: column;
  overflow: hidden;
  height: 100%;
`;

export const TimelineContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  width: 100%;
  height: 100%;

  .timeLine-side-main {
    min-width: 380px !important;
  }

  .verticalResizer {
    border-right: 1px solid ${colors.borderPrimary} !important;
    border-left: 1px solid ${colors.borderPrimary} !important;
  }

  .timeLine-side {
    border: none !important;
    height: 95% !important;
  }

  .timeLine {
    height: 100% !important;
    box-shadow: rgb(0 0 0 / 8%) 0px 0px 6px 1px;
    border: 1px solid ${colors.borderPrimary} !important;
    box-shadow: none;
  }

  .header-top > div {
    border-left: 1px solid #d9e2ec !important;
    border-bottom: 1px solid ${colors.borderPrimary} !important;
    font-weight: 500;
  }

  .header-middle > div {
    border-left: 1px solid #d9e2ec !important;
    border-bottom: 1px solid ${colors.borderPrimary} !important;
  }

  .header-bottom > div {
    border-left: 1px solid ${colors.borderDarker} !important;
    border-bottom: 1px solid ${colors.borderPrimary} !important;
  }

  .timeLine-main {
    height: 95% !important;
  }

  .timeLine-main-data-row > div {
    height: 30px !important;
    top: 7px !important;
    padding: 5px 10px !important;
    border-radius: 15px !important;
  }

  .timeLine-side-task-row {
    font-weight: 400;
    color: ${colors.textPrimary} !important;
    padding: 10px 20px !important;
    line-height: initial !important;
  }

  .timeLine-main-data-task-side {
    height: 30px !important;
  }

  .timeLine-main-data-viewPort {
    background-color: ${colors.colorWhite} !important;
  }

  .timeLine-side-task-viewPort {
    background-color: ${colors.colorWhite} !important;
  }
`;

export const NavContainer = styled.div`
  flex-direction: row;
  width: 100%;
  background-color: ${colors.colorWhite};
  color: grey;
`;

export const ModeContainer = styled.div`
  display: flex;
  justify-content: right;
  margin: 10px 20px;

  > div a {
    padding: 3px 20px;
  }
`;

export const ModeItem = styled.div`
  flex: 0 0 auto;
  width: 80px;
  padding: 5px;
  border: solid 1px silver;
  background-color: #333333;
  color: white;
  font-size: 12px;
  text-align: center;
  cursor: pointer;
`;

export const GanttContextMenu = styledTS<{ top: number; left: number }>(
  styled.ul
)`
  font-size: 14px;
  background-color: #fff;
  border-radius: 2px;
  padding: 5px 0 5px 0;
  width: 150px;
  height: auto;
  margin: 0;
  /* use absolute positioning  */
  position: absolute;
  list-style: none;
  box-shadow: 0 0 20px 0 #ccc;
  opacity: 1;
  transition: opacity 0.5s linear;
  top: ${props => `${props.top}px`}
  left: ${props => `${props.left}px`}

  li {
    padding-left: 10px;
  }
`;
