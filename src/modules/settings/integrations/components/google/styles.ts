import { colors, dimensions } from 'modules/common/styles';
import { rotate } from 'modules/common/utils/animations';
import { Attachment } from 'modules/inbox/styles';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

const AttachmentContainer = Attachment.extend`
  padding: 5px 10px;
  max-width: 240px;
  border-radius: 2px;
  margin-bottom: ${dimensions.coreSpacing}px;

  i {
    color: ${colors.colorWhite};
    cursor: pointer;
    opacity: 0.6;
    transition: opacity ease 0.3s;

    &:hover {
      opacity: 1;
    }
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
  justify-content: space-between;

  label {
    color: ${colors.colorCoreGray};
    margin-right: 10px;

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
  margin-left: -5px;
`;

export {
  Attachments,
  MailEditorWrapper,
  ControlWrapper,
  LeftSection,
  Resipients,
  AttachmentContainer,
  EditorFooter
};
