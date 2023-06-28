import { colors, dimensions } from '../styles';
import { darken, rgba } from './ecolor';

import styled from 'styled-components';
import styledTS from 'styled-components-ts';

const TicketRow = styled.div`
  margin-bottom: ${dimensions.unitSpacing}px;
  display: flex;
  flex-wrap: wrap;
`;

const TicketLabel = styled.div`
  font-weight: 600;
  flex: 0 0 20%;
  font-size: 12px;
  text-transform: uppercase;
  color: ${colors.colorCoreGray};

  > i {
    margin-right: 5px;
  }
`;

const CommentContainer = styled.div`
  flex: 1;
  font-size: 14px;

  .buttons {
    text-align: right;
    margin-top: ${dimensions.unitSpacing}px;
  }
`;

const Description = styled.div`
  font-size: 14px;

  > p {
    font-size: 14px;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  border-right: 1px solid ${colors.colorCoreLightGray};
  border-left: 1px solid ${colors.colorCoreLightGray};

  th {
    border: 1px solid ${colors.colorCoreLightGray};
    color: ${colors.colorPrimary};
  }

  td {
    border-bottom: 1px solid ${colors.colorCoreLightGray};
  }

  th,
  td {
    padding: 4px 8px;
  }
`;

const ListHead = styled.div`
  display: flex;
  margin-bottom: ${dimensions.unitSpacing}px;

  > div {
    display: inline-block;
    font-weight: 600;
    flex: 0 0 12%;
    text-transform: uppercase;
    font-size: 11px;
    padding: 0 ${dimensions.unitSpacing - 5}px;

    &:first-child {
      flex: 0 0 30%;
      text-align: left;
    }

    @media (max-width: 700px) {
      min-width: 60px;
    }
  }
`;

const ListRow = styled.div`
  display: flex;
  padding: ${dimensions.unitSpacing + 2}px 0;
  border-bottom: 1px solid ${colors.borderPrimary};
  cursor: pointer;
  transition: all ease 0.3s;

  > div {
    display: flex;
    align-items: center;
    flex: 0 0 12%;
    font-size: 14px;
    gap: 5px;
    flex-wrap: wrap;
    word-break: break-word;
    padding: 0 ${dimensions.unitSpacing - 5}px;

    &:first-child {
      flex: 0 0 30%;
      text-align: left;
      font-weight: 600;
      text-transform: capitalize;
    }

    @media (max-width: 700px) {
      min-width: 60px;
    }
  }

  &:hover {
    background: #f5f5f5;
  }

  &:last-child {
    border: 0;
  }
`;

const DetailHeader = styled.div`
  margin-bottom: ${dimensions.coreSpacing}px;

  span {
    font-size: 14px;
    cursor: pointer;
    transition: all ease .3s;
    color: ${colors.colorCoreGray};
    display: flex;
    align-items: center;

    &:hover {
      color: ${colors.textPrimary};
    }
  }
`;

const TicketDetailContent = styled.div`
  
`;

const DetailRow = styledTS<{ type?: string }>(styled.div)`
  margin-bottom: ${dimensions.unitSpacing + 5}px;
  display: ${props => props.type === "row" && 'flex'};
  align-items: ${props => props.type === "row" && 'center'};

  label {
    color: #999;
    font-weight: 500;
    text-transform: capitalize;
    font-size: 13px;
    margin: ${props => props.type === "row" ? 0 : '0 0 8px 0'};
    width: ${props => props.type === "row" && '120px'};
  }
  
  span {
    display: block;
    font-size: 14px;
    display: flex;
    align-items: center;
  }
`;

const TicketComment = styled.div`
  span {
    font-weight: bold;
    padding-right: 12px;
  }

  margin-bottom: ${dimensions.coreSpacing}px;
`;

const Label = styledTS<{ lblStyle: string; colorCode?: string }>(styled.div)`
    border-radius: 14px;
    padding: 3px 9px;
    text-transform: uppercase;
    font-size: 8px;
    display: inline-block;
    line-height: 1.32857143;
    font-weight: 600;
    background: ${({ lblStyle, colorCode }) =>
      lblStyle === 'danger'
        ? rgba(colors.colorCoreRed, 0.2)
        : lblStyle === 'custom'
        ? colorCode
        : rgba(colors.colorCoreGreen, 0.15)};
    color: ${({ lblStyle }) =>
      lblStyle === 'danger'
        ? darken(colors.colorCoreRed, 50)
        : lblStyle === 'custom'
        ? colors.colorWhite
        : darken(colors.colorCoreGreen, 50)};
`;

const CommentWrapper = styled.div`
  margin: ${dimensions.coreSpacing}px 0;
`;

const CommentContent = styled.div`
  background: rgb(239, 241, 243);
  border-radius: 5px;
  padding: 8px ${dimensions.unitSpacing}px;

  > h5 {
    font-size: 12px;
    color: rgb(58, 89, 153);
    font-weight: 600;
    margin: 0;
  }

  .comment {
    font-size: 12px;
    line-height: 16px;
    margin-top: 5px;
  }
`;

const CreatedUser = styled.div`
  display: flex;
  position: relative;

  > div {
    flex: 1;
  }

  > img {
    width: 34px;
    height: 34px;
    border-radius: 34px;
    border: 2px solid #eee;
    margin-right: ${dimensions.unitSpacing}px;
  }

  span {
    font-size: 11px;
    color: ${colors.colorCoreGray};
    font-weight: 500;
    padding-left: ${dimensions.unitSpacing}px;
  }

  .actions {
    position: absolute;
    right: 0;
    top: 3px;
    visibility: hidden;
    text-transform: uppercase;

    > span {
      cursor: pointer;
      font-weight: 600;
      padding-left: 0;
      transition: all ease 0.1s;

      &:hover {
        color: ${colors.colorCoreRed};

        &:first-child {
          color: ${colors.colorCoreBlue};
        }
      }
    }
  }

  &:hover {
    .actions {
      visibility: visible;
    }
  }
`;

const SelectInput = styled.div`
  margin-bottom: 5px;

  label {
    margin-right: 5px;
  }
`;

const Card = styledTS<{ fullHeight?: boolean }>(styled.div)`
  padding: ${dimensions.coreSpacing}px;
  margin-bottom: ${dimensions.coreSpacing}px;
  background: ${colors.colorWhite};
  box-shadow: 0 3px 3px rgba(56,65,74,0.1);
  border-radius: ${dimensions.unitSpacing}px;
  height: ${props => props.fullHeight && '100%'};
`;

const RightSidebar = styled(Card)`
  position: sticky;
  overflow: auto;
  height: 100%;
`;

const GroupList = styled.div`
  margin-bottom: ${dimensions.coreSpacing + dimensions.unitSpacing}px;
  border-radius: 12px;
  border: 1px solid ${colors.borderDarker};
  background: ${colors.colorWhite};

  .card-header {
    font-size: 14px;

    span {
      color: #888;
      margin-left: ${dimensions.unitSpacing - 5}px;
    }
  }
`;

const GroupWrapper = styled.div`
  padding: ${dimensions.unitSpacing}px ${dimensions.coreSpacing}px;

  @media (max-width: 700px) {
    overflow: auto;
  }
`;

const CardTab = styledTS<{baseColor?: string}>(styled.div)`
  margin-right: ${dimensions.coreSpacing}px;
  font-size: 13px;
  background: #f4f4f4;
  border: 1px solid ${colors.borderPrimary};
  border-radius: ${dimensions.unitSpacing - 2}px;
  color: ${colors.colorCoreGray};
  overflow: hidden;

  span {
    padding: 6px ${dimensions.unitSpacing}px;
    cursor: pointer;
    width: 120px;
    text-transform: capitalize;
    
    &.active {
      background: ${props => props.baseColor ? props.baseColor : colors.colorSecondary};
      color: ${colors.colorWhite};
    }
  }
`;

const Assignees = styled.div`
  margin-bottom: ${dimensions.unitSpacing - 2}px;
  display: flex;
  align-items: center;

  img {
    border-radius: 24px;
    border: 1px solid ${colors.borderPrimary};
    margin-right: ${dimensions.unitSpacing- 5}px;
  }
`;

const FlexRow = styled.div`
  display: flex;

  > div {
    margin-right: ${dimensions.coreSpacing + dimensions.coreSpacing}px;
  }
`;

const FilterGroup = styled.div`
  label {
    font-size: 14px;
    margin: 0 5px 0 0;
  }

  @media (max-width: 700px) {
    justify-content: space-between;
    margin-bottom: ${dimensions.unitSpacing}px;
   }
`;

export {
  TicketRow,
  TicketLabel,
  CommentContainer,
  Table,
  Label,
  DetailHeader,
  FilterGroup,
  ListHead,
  ListRow,
  Description,
  TicketComment,
  TicketDetailContent,
  CommentWrapper,
  CommentContent,
  CreatedUser,
  SelectInput,
  RightSidebar,
  DetailRow,
  GroupList,
  GroupWrapper,
  CardTab,
  Card,
  FlexRow,
  Assignees
};
