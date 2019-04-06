import { colors, dimensions } from 'modules/common/styles';
import { Attachment } from 'modules/inbox/styles';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

const AttachmentContainer = styled(Attachment)`
  padding: 5px 10px;
  border-radius: 2px;
  margin: 0 0 5px 5px;
  color: ${colors.colorWhite};

  i {
    cursor: pointer;
    opacity: 0.6;
    transition: opacity ease 0.3s;
    font-size: 12px;

    &:hover {
      opacity: 1;
    }
  }
`;

const Uploading = styled.div`
  position: relative;
  height: 33px;
  top: -4px;
  left: 25px;

  span {
    position: absolute;
    width: 100px;
    top: 6px;
    left: 25px;
  }
`;

const ControlWrapper = styled.div`
  display: flex;
  margin-bottom: ${dimensions.unitSpacing}px;

  span {
    border-bottom: 1px solid ${colors.colorShadowGray};
    padding: 6px 10px 0 0;
    font-weight: 500;
  }

  input {
    padding-left: 0;

    &:hover,
    &:focus {
      border-color: ${colors.colorShadowGray};
    }
  }
`;

const LeftSection = styled.div`
  border-bottom: 1px solid ${colors.colorShadowGray};
  padding: 5px 10px 0 0;
`;

const MailEditorWrapper = styled.div`
  position: relative;
  background: ${colors.colorWhite};
  margin: ${dimensions.coreSpacing}px 0;
`;

const Resipients = styledTS<{ isActive?: boolean }>(styled.a)`
  padding-left: 10px;
  font-weight: 500;
  display: ${props => props.isActive && 'none'};

  &:hover {
    cursor: pointer;
    text-decoration: underline;
  }
`;

const EditorFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;

  label {
    color: ${colors.colorCoreGray};
    margin-right: 10px;
    font-size: 14px;

    &:hover {
      cursor: pointer;
    }
  }

  input[type='file'] {
    display: none;
  }
`;

const Attachments = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  margin: -10px 0 ${dimensions.coreSpacing}px -5px;
`;

export {
  Attachments,
  MailEditorWrapper,
  ControlWrapper,
  LeftSection,
  Resipients,
  Uploading,
  AttachmentContainer,
  EditorFooter
};
