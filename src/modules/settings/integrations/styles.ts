import { colors, dimensions } from 'modules/common/styles';
import { Attachment } from 'modules/inbox/styles';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

const FlexRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;

  .flex-item {
    flex: 1;
    margin-left: ${dimensions.coreSpacing}px;

    &:first-child {
      margin: 0;
    }

    input[type='checkbox'] {
      display: inline-block;
      height: auto;
      width: auto;
      margin-right: 5px;
    }
  }

  span {
    margin: 0 5px;

    .Select-value-label {
      color: ${colors.colorLightGray} !important;
    }
  }

  button {
    margin-left: ${dimensions.coreSpacing / 2}px;
  }

  & + div {
    margin-top: ${dimensions.coreSpacing / 2}px;
  }
`;

const Row = styled.div`
  display: flex;
  height: 100%;
`;

const MessengerPreview = styled.div`
  width: 40%;
`;

const IntegrationName = styled.span`
  margin-right: ${dimensions.unitSpacing}px;
`;

const BrandName = styled.div`
  font-size: 11px;
  color: ${colors.colorCoreGray};
`;

const AttachmentContainer = styled(Attachment)`
  i {
    cursor: pointer;
    transition: all ease 0.3s;

    &:hover {
      color: ${colors.colorPrimaryDark};
    }
  }
`;

const AttachmentFile = styled.span`
  min-width: 200px;
  height: 25px;
  display: block;
  font-size: 12px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
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
  padding: ${dimensions.unitSpacing}px ${dimensions.coreSpacing}px;
`;

const Preview = styled.div`
  max-width: 220px;
  padding: 5px;
  background: ${colors.colorSecondary};
  opacity: 0.8;
  display: flex;
  box-shadow: 0 1px 5px 0 ${colors.darkShadow};
  position: relative;
  color: ${colors.colorWhite};
  margin: 0 20px 10px;

  > div {
    position: absolute;
    left: 50%;
    top: 50%;
  }

  img {
    max-width: 100%;
    opacity: 0.7;
  }
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

export {
  FlexRow,
  Row,
  MessengerPreview,
  IntegrationName,
  BrandName,
  MailEditorWrapper,
  ControlWrapper,
  LeftSection,
  Resipients,
  AttachmentContainer,
  Preview,
  AttachmentFile
};
