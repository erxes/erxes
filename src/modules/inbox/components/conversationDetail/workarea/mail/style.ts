import { colors, dimensions } from 'modules/common/styles';
import { rgba } from 'modules/common/styles/color';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

const Content = styled.div`
  padding: ${dimensions.unitSpacing}px ${dimensions.unitSpacing + 5}px;
  overflow: auto;
`;

const SmallContent = styledTS<{ toggle?: boolean }>(styled.div)`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 425px;  blockquote {
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
  padding: ${dimensions.unitSpacing}px 15px;
  display: flex;
  align-items: center;
  border-bottom: ${props =>
    props.toggle ? 0 : `1px solid ${colors.borderPrimary}`};
  
  strong {
    display: block;
  }
`;

const Details = styled.div`
  margin-left: 13px;
  flex: 1;

  span {
    color: ${colors.textSecondary};
    margin-right: 10px;
  }
`;

const Date = styled.div`
  margin: 0 10px;
  font-size: 12px;
  color: ${colors.colorCoreGray};
`;

const RightSide = styled.div`
  display: flex;
  align-items: center;
`;

const AttachmentsContainer = styled.div`
  margin: 5px 20px 10px 20px;
  overflow: hidden;
`;

const FileInfo = styled.div`
  position: absolute;
  padding: 5px 5px 5px 35px;
  top: 85px;
  left: 0;
  right: 0;
  word-break: break-all;
  background: ${colors.bgLight};
  height: 100%;
  transition: top 0.2s ease;
  span {
    display: block;
    color: ${colors.colorCoreGray};
    visibility: hidden;
    opacity: 0;
    font-size: 11px;
  }
  > i {
    position: absolute;
    left: 11px;
    color: ${colors.colorSecondary};
  }
`;

const FileName = styled.div`
  font-weight: bold;
  font-size: 12px;
  margin-top: 3px;
  line-height: 16px;
  max-height: 48px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

const AttachmentItem = styled.div`
  float: left;
  width: 180px;
  height: 120px;
  border: 1px solid ${colors.borderPrimary};
  position: relative;
  overflow: hidden;
  margin: 0 10px 10px 0;
  &:hover ${FileInfo} {
    top: 0;
    bottom: 0;
    span {
      visibility: visible;
      opacity: 1;
    }
    ${FileName} {
      white-space: normal;
      text-overflow: initial;
    }
  }
`;

const Download = styled.a`
  width: 30px;
  height: 24px;
  border-radius: 3px;
  background: ${colors.colorCoreGray};
  display: block;
  text-align: center;
  color: ${colors.colorWhite};
  line-height: 23px;
  position: absolute;
  bottom: 15px;
  &:hover {
    background: ${colors.colorCoreDarkGray};
    color: ${colors.colorWhite};
  }
`;

const FileIcon = styled.div`
  height: 85px;
  text-align: center;
  color: ${colors.colorCoreLightGray};
  line-height: 85px;
  border-bottom: 1px solid ${colors.borderPrimary};
  background: ${colors.colorWhite};
`;

const BoxItem = styledTS<{ toggle?: boolean }>(styled.div)`
  position: relative;
  background: ${colors.colorWhite};
  border-radius: ${dimensions.coreSpacing}px;
  border: 1px solid ${colors.borderPrimary};
  box-shadow: ${rgba(colors.colorCoreBlack, 0.08)} 0px 1px 6px;
  margin-top: ${dimensions.unitSpacing}px;
  opacity: ${props => props.toggle && '0.8'};
  transition: all ease 0.3s;

  &:hover {
    opacity: 1;
  }
`;

const Reply = styled.div`
  padding: 10px 15px 15px;
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
  FileIcon,
  FileInfo,
  FileName,
  Download
};
