import { dimensions, colors } from '@erxes/ui/src/styles';
import styled from 'styled-components';

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

const TicketComment = styled.div`
  span {
    font-weight: bold;
    padding-right: 12px;
  }

  margin-bottom: ${dimensions.coreSpacing}px;
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
  TicketLabel,
  TicketContent,
  TicketComment,
  CommentWrapper,
  CommentContent,
  CreatedUser
};
