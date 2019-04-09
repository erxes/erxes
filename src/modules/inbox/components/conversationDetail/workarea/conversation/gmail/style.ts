import { colors, dimensions } from 'modules/common/styles';
import styled from 'styled-components';

const dateColor = '#666';
const subjectColor = '#202124';

const EmailItem = styled.div`
  padding: ${dimensions.coreSpacing}px;
  border-bottom: 1px solid ${colors.borderPrimary};

  &:last-of-type {
    border: none;
  }
`;

const Content = styled.div`
  font-size: 13px;
  padding: 0 45px;

  blockquote {
    font-size: 13px;
  }

  table {
    border-collapse: initial;
    background-color: unset;
  }
`;

const Subject = styled.h2`
  font-size: 26px;
  color: ${subjectColor};
  font-weight: 400;
  margin: 0 0 ${dimensions.coreSpacing}px;
  padding-left: 45px;
`;

const Meta = styled.div`
  margin-bottom: ${dimensions.coreSpacing}px;
  display: flex;
  flex-direction: row;
  align-items: center;

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
  color: ${dateColor};
`;

const RightSide = styled.div`
  display: flex;
  align-items: center;
`;

const AttachmentsContainer = styled.div`
  padding-left: 45px;
  margin-top: 20px;
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

export {
  EmailItem,
  Subject,
  Meta,
  Date,
  Details,
  Content,
  RightSide,
  AttachmentItem,
  AttachmentsContainer,
  FileIcon,
  FileInfo,
  FileName,
  Download
};
