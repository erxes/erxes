import { colors } from 'modules/common/styles';
import styled from 'styled-components';

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
    height: 100% !important;
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
    height: 100% !important;
  }

  .timeLine-main-data-row > div {
    height: 35px !important;
    top: 5px !important;
    padding: 5px 10px !important;
    border-radius: 10px !important;
    &:hover {
      opacity: 0.8;
    }
  }

  .timeLine-side-task-row {
    font-weight: 400;
    color: ${colors.textPrimary} !important;
    padding: 10px 20px !important;
    line-height: initial !important;

    > div > div > div img {
      display: none;
    }
  }

  .timeLine-main-data-task-side {
    height: 35px !important;
  }

  .timeLine-main-data-viewPort {
    background-color: ${colors.colorWhite} !important;
  }

  .timeLine-side-task-viewPort {
    background-color: ${colors.colorWhite} !important;
  }
`;

export const AssingStyle = styled.div`
  float: left;
  margin-right: 5px;

  > div {
    display: flex;
  }

  > div img {
    width: 23px !important;
    height: 23px !important;
  }
`;

export const TextStyle = styled.div`
  padding-top: 3px;
  text-align: left !important;
`;
