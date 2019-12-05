import { colors, dimensions } from 'modules/common/styles';
import { rgba } from 'modules/common/styles/color';
import styled, { css } from 'styled-components';
import styledTS from 'styled-components-ts';
import { MailBox } from '../../sidebar/styles';

const Content = styled.div`
  padding: ${dimensions.unitSpacing}px ${dimensions.coreSpacing}px;
  overflow: auto;
`;

const SmallContent = styledTS<{ toggle?: boolean }>(styled.div)`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 425px;  
  
  blockquote {
    font-size: 13px;
  }
  
  table {
    border-collapse: initial;
    background-color: unset;
  }
`;

const Subject = styled.h2`
  font-size: ${dimensions.coreSpacing}px;
  color: ${colors.colorCoreDarkGray};
  font-weight: 500;
  margin: 0 0 ${dimensions.coreSpacing}px;
`;

const Meta = styledTS<{ toggle?: boolean }>(styled.div)`
  padding: ${dimensions.unitSpacing - 2}px ${dimensions.coreSpacing}px;
  display: flex;
  align-items: baseline;
  border-bottom: ${props =>
    props.toggle ? 0 : `1px solid ${colors.borderPrimary}`};


  &:hover {
    cursor: pointer;
  }
`;

const Details = styledTS<{ clickable?: boolean }>(styled.div)`
  margin-left: 7px;
  padding: 2px 7px;
  border-radius: 4px;
  align-self: center;

  &:hover {
    background: ${props => props.clickable && colors.bgActive};
  }
`;

const Date = styled.div`
  margin-left: ${dimensions.unitSpacing}px;
  font-size: 11px;
  font-weight: 500;
  color: ${colors.colorCoreLightGray};
  cursor: default;
  line-height: 30px;
`;

const RightSide = styled.div`
  display: flex;
  align-items: center;
  align-self: baseline;
  padding: 7px 0;
  margin-left: auto;
  flex-shrink: 0;

  > i {
    color: ${colors.colorCoreGray};
    padding-left: 5px;
    margin-left: 10px;
  }
`;

const AttachmentsContainer = styled.div`
  margin: 0 20px 10px 20px;
  overflow: hidden;
  display: flex;
  flex-wrap: wrap;
`;

const FileName = styled.div`
  font-weight: bold;
  font-size: 12px;
  flex: 1;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

const FileInfo = styled.div`
  display: flex;
  align-items: center;

  span {
    font-size: 10px;
    margin-right: 5px;
  }
`;

const Download = styled.a`
  width: 18px;
  height: 18px;
  border-radius: 9px;
  background: ${colors.colorCoreGray};
  display: block;
  text-align: center;
  color: ${colors.colorWhite};
  line-height: 18px;
  display: none;

  &:hover {
    background: ${colors.colorPrimary};
    color: ${colors.colorWhite};
  }
`;

const AttachmentItem = styled.div`
  width: 200px;
  flex-shrink: 0;
  height: 30px;
  display: flex;
  border-radius: 4px;
  background: ${colors.bgActive};
  margin: 0 8px 5px 0;
  align-items: center;
  padding: 0 8px;

  > i {
    margin-right: 5px;
    color: ${colors.colorPrimary};
  }

  &:hover {
    ${Download} {
      display: block;
    }
  }
`;

const BoxItem = styledTS<{ toggle?: boolean }>(styled(MailBox))`
  position: relative;
  box-shadow: ${rgba(colors.colorCoreBlack, 0.08)} 0px 1px 6px;
  margin-top: ${dimensions.unitSpacing}px;
  opacity: ${props => props.toggle && '0.8'};
  border-radius: ${dimensions.coreSpacing - 5}px;
  border: 1px solid ${colors.borderPrimary};
  
  &:hover {
    opacity: 1;
  }
`;

const Reply = styled.div`
  padding: 10px ${dimensions.coreSpacing}px ${dimensions.coreSpacing - 5}px;
`;

const ActionButton = styled.div`
  color: ${colors.colorCoreGray};
  padding: 5px;
  font-size: 16px;
  border-radius: 15px;
  line-height: ${dimensions.coreSpacing}px;
  width: 30px;
  text-align: center;
  margin-left: ${dimensions.unitSpacing}px;
  margin-right: -7px;

  &:hover {
    cursor: pointer;
    background: ${colors.bgActive};
  }
`;

const From = styled.span`
  font-size: 95%;
`;

const AddressItem = styled.div`
  display: flex;
`;

const AddressContainer = styledTS<{ isExpanded?: boolean }>(styled.div)`
  ${props =>
    !props.isExpanded &&
    css`
      ${AddressItem} {
        margin-right: 5px;
      }

      max-height: 20px;
      overflow: hidden;

      div {
        display: inline;
      }
    `};
`;

const Title = styled.div`
  margin-right: 5px;
`;

const Addresses = styled.div`
  color: ${colors.textSecondary};
  word-break: break-word;
`;

export {
  Subject,
  Meta,
  Date,
  Details,
  SmallContent,
  Content,
  BoxItem,
  Reply,
  RightSide,
  AttachmentItem,
  AttachmentsContainer,
  FileName,
  FileInfo,
  Download,
  ActionButton,
  From,
  AddressContainer,
  AddressItem,
  Title,
  Addresses
};
