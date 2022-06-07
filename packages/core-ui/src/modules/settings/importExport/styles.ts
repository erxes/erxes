import { colors, dimensions, typography } from 'modules/common/styles';
import { BoxRoot } from 'modules/common/styles/main';
import styled, { css } from 'styled-components';
import styledTS from 'styled-components-ts';
import { rgba } from '@erxes/ui/src/styles/ecolor';

const tableHoverColor = '#f5f5f5';

const ImportColumnRow = styled.tr`
  i {
    font-size: 15px;
  }
`;

const Box = styled(BoxRoot)`
  height: 180px;
  width: 165px;
  padding: 40px;
  background: transparent;
  border-radius: ${dimensions.unitSpacing}px;
  i {
    font-size: 38px;
    color: ${colors.colorSecondary};
  }

  span {
    font-weight: 500;
    text-transform: capitalize;
  }

  p {
    margin: 10px 0 0;
    font-size: 12px;
    color: ${colors.colorCoreLightGray};
    min-height: 36px;
  }
`;

const ImportTitle = styled.div`
  h6 {
    margin-bottom: 5px;
    font-weight: 600;
  }
  p {
    font-size: 12px;
  }
`;

const ImportHistoryActions = styled.div`
  button {
    margin-left: 0.5rem;
  }
`;

const FullContent = styledTS<{ center: boolean; align?: boolean }>(styled.div)`
  flex: 1;
  display: flex;
  justify-content: ${props => props.center && 'center'};
  align-items: ${props => (props.align ? 'flex-start' : 'center')};
`;

const TypeContent = styledTS<{ center: boolean; align?: boolean }>(styled.div)`
  flex: 1;
  display: flex !important;
  margin-bottom: 30px;
  margin-left: 20px;
  justify-content: ${props => props.center && 'center'};
  align-items: ${props => (props.align ? 'flex-start' : 'center')};
  flex-wrap: wrap;

  @media (max-width: 1440px) {
    display: block;
  }
`;

const FlexRow = styled.div`
  display: flex;
  align-items: center;

  > button {
    margin: 0 10px;
  }

  .Select {
    flex: 1;
  }
`;

const UploadText = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  p {
    margin: 0;
    font-weight: bold;
    font-size: 12px;
  }

  span {
    cursor: pointer;
    color: #1785fc;
    margin-left: 10px;
  }
`;

const ColumnTable = styledTS<{
  whiteSpace?: string;
  alignTop?: boolean;
  hover?: boolean;
  bordered?: boolean;
  striped?: boolean;
}>(styled.table)`
  ${props => css`
    width: 100%;
    max-width: 100%;
    border-spacing: 0;
    border-collapse: collapse;
    white-space: ${props.whiteSpace || ''};

    th,
    td {
      border-top: 1px solid ${colors.borderPrimary};
      color: ${colors.textPrimary};
      padding: ${dimensions.unitSpacing - 2}px;
      display: table-cell;
      vertical-align: ${props.alignTop && 'top'};
      max-width: 250px;
    }

    thead {
      th,
      td {
        text-transform: uppercase;
        color: ${colors.colorCoreGray};
        font-size: ${typography.fontSizeUppercase}px;
      }

      th {
        background-color: ${colors.colorWhite};
        position: sticky;
        z-index: 1;
        top: 0;
      }
    }

    ${props.bordered
      ? `th, td { border-bottom: 1px solid ${colors.borderPrimary}; }`
      : null} ${props.striped
      ? `tr:nth-of-type(odd) td { background-color: ${colors.bgLightPurple}; }`
      : null} th {
      border-top: none;
    }

    tr:hover td {
      background-color: ${tableHoverColor};
    }

    th:first-child,
    td:first-child {
      width: 50px;
      text-align: center;
      border-left: none;
    }

    th:last-child,
    td:last-child {
      border-right: none;
    }
  `};
`;

const ImportHeader = styledTS<{ fontSize?: string }>(styled.div)`
  color: ${colors.textSecondary};
  justify-content: center;
  font-size: ${props =>
    props.fontSize === 'small'
      ? `${typography.fontSizeHeading8}px`
      : props.fontSize === 'large'
      ? `${typography.fontSizeHeading6}px`
      : `${typography.fontSizeHeading7}px`};
  display: flex;
  margin-bottom: ${dimensions.coreSpacing}px;
`;

const FileUploadBox = styled.div`
  margin-top: ${dimensions.coreSpacing}px;
  padding: ${dimensions.unitSpacing}px;
  border: 1px dashed ${rgba(colors.colorPrimary, 0.2)};
  border-radius: ${dimensions.unitSpacing}px;
`;

const Width = styled.div`
  width: ${(dimensions.unitSpacing - 2) * 10}px;
`;

export {
  ImportColumnRow,
  ColumnTable,
  FlexRow,
  ImportTitle,
  ImportHistoryActions,
  Box,
  FullContent,
  UploadText,
  TypeContent,
  ImportHeader,
  FileUploadBox,
  Width
};
