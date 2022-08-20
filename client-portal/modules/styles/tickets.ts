import { dimensions, colors } from "../styles";
import styled from "styled-components";
import styledTS from "styled-components-ts";
import { rgba, darken } from "./ecolor";

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

const TicketContent = styled.div`
  flex: 0 0 80%;
  padding-left: ${dimensions.unitSpacing}px;
  font-size: 14px;

  .buttons {
    text-align: right;
    margin-top: ${dimensions.unitSpacing}px;
  }
`;

const Description = styled.div`
  background: #edeef0;
  font-size: 13px;
  padding: ${dimensions.unitSpacing}px ${dimensions.coreSpacing}px;
  border-radius: 5px;
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
  background-color: ${colors.bgLight};
  padding: ${dimensions.unitSpacing + 5}px ${dimensions.coreSpacing}px;
  border: 1px solid ${colors.borderPrimary};
  margin-bottom: ${dimensions.unitSpacing}px;
  border-radius: 5px;

  > div {
    display: inline-block;
    font-weight: 600;
    flex: 0 0 15%;
    color: ${colors.colorCoreGray};
    text-align: center;
    text-transform: uppercase;
    font-size: 12px;

    &:first-child {
      flex: 0 0 55%;
      text-align: left;
    }
  }
`;

const ListBody = styled.div``;

const ListRow = styled.div`
  display: flex;
  background: ${colors.colorWhite};
  margin-bottom: ${dimensions.unitSpacing}px;
  padding: ${dimensions.unitSpacing + 5}px ${dimensions.coreSpacing}px;
  border: 1px solid ${colors.borderPrimary};
  border-radius: 5px;
  cursor: pointer;
  transition: all ease 0.3s;

  > div {
    display: inline-block;
    flex: 0 0 15%;
    text-align: center;
    font-size: 14px;

    &:first-child {
      flex: 0 0 55%;
      text-align: left;
      font-weight: 600;
      text-transform: capitalize;
    }
  }

  &:hover {
    background: #f5f5f5;
  }
`;

const TicketDetailContent = styled.div`
  padding: 20px 40px;
`;

const TicketComment = styled.div`
  span {
    font-weight: bold;
    padding-right: 12px;
  }

  margin-bottom: ${dimensions.coreSpacing}px;
`;

const Label = styledTS<{ lblStyle: string }>(styled.div)`
    border-radius: 14px;
    padding: 3px 9px;
    text-transform: uppercase;
    font-size: 8px;
    display: inline-block;
    line-height: 1.32857143;
    font-weight: 600;
    background: ${(props) =>
      props.lblStyle === "danger"
        ? rgba(colors.colorCoreRed, 0.2)
        : rgba(colors.colorCoreGreen, 0.15)};
    color: ${(props) =>
      props.lblStyle === "danger"
        ? darken(colors.colorCoreRed, 50)
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

export {
  TicketRow,
  TicketLabel,
  TicketContent,
  Table,
  Label,
  ListHead,
  ListBody,
  ListRow,
  Description,
  TicketComment,
  TicketDetailContent,
  CommentWrapper,
  CommentContent,
  CreatedUser,
};
