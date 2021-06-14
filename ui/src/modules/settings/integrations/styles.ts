import { colors, dimensions } from 'modules/common/styles';
import styled from 'styled-components';

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

const Content = styled.div`
  display: flex;
  height: 100%;
  overflow: hidden;

  > form {
    display: flex;
    flex-direction: column;
    flex: 1;
  }
`;

const Row = styled.div`
  display: flex;

  .Select {
    flex: 1;
  }

  button {
    flex-shrink: 0;
    margin-left: 10px;
    align-self: baseline;
  }
`;

const MessengerPreview = styled.div`
  width: 40%;
`;

const LeftContent = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const IntegrationName = styled.div`
  display: flex;
  align-items: center;

  > div {
    margin-left: ${dimensions.unitSpacing / 2}px;
  }
`;

const BrandName = styled.div`
  font-size: 11px;
  color: ${colors.colorCoreGray};
`;

const Script = styled.div`
  padding-top: ${dimensions.coreSpacing}px;

  ol {
    padding-left: ${dimensions.coreSpacing}px;
  }
`;

const Options = styled.div`
  font-weight: 500;

  i {
    color: ${colors.colorCoreGray};
    margin-left: ${dimensions.unitSpacing}px;
    font-weight: normal;
  }
`;

const Description = styled.p`
  text-transform: initial;
`;

const RefreshPermission = styled.div`
  padding-top: ${dimensions.unitSpacing}px;
  text-transform: uppercase;
  cursor: pointer;
  color: ${colors.colorSecondary};
  font-weight: 500;
  opacity: 0.8;
  transition: all ease 0.3s;

  &:hover {
    opacity: 1;
  }
`;

const GoogleButton = styled.a`
  height: 36px;
  width: 150px;
  padding: 3px;
  background: url('/images/googleButton/btn_normal.png') left center no-repeat;
  background-size: contain;
  background-position: 100%;
  margin-left: 10px;
  transition: background 0.3s ease;
  display: block;
  margin: auto;

  &:hover,
  &:focus {
    background-image: url('/images/googleButton/btn_focus.png');
  }

  &:active {
    background-image: url('/images/googleButton/btn_active.png');
  }
`;

const FacebookButton = styled.button`
  background-color: rgb(66, 103, 178);
  border-color: rgb(66, 103, 178);
  color: ${colors.colorWhite};
  line-height: 16px;
  font-size: 14px;
  padding: 11px 24px;
  font-weight: 500;
  border-radius: 3px;
  border-style: solid;
  border-width: 1px;
  text-align: center;
  transition: all 0.15s ease-out;
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  vertical-align: middle;
  white-space: nowrap;

  i {
    margin-right: 5px;
  }

  &:hover {
    cursor: pointer;
    background-color: rgb(54, 88, 153);
    border-color: rgb(54, 88, 153);
  }
`;

const AccountBox = styled.div`
  border: 1px solid ${colors.borderPrimary};
  margin-bottom: ${dimensions.coreSpacing}px;
`;

const AccountTitle = styled.h3`
  text-transform: uppercase;
  margin: 0;
  padding: 15px 20px;
  border-bottom: 1px solid ${colors.borderPrimary};
  font-size: 13px;
  font-weight: 600;
  background: ${colors.bgLight};
`;

const AccountItem = styled.div`
  padding: 15px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid ${colors.borderPrimary};
  margin-top: -1px;
  font-size: 15px;
  font-weight: 500;
  white-space: nowrap;

  > span {
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }
`;

const ImageWrapper = styled.div`
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: 20px;
`;

const TextWrapper = styled.div`
  max-width: 400px;
  h1 {
    font-weight: 400;
    font-size: 24px;
  }

  p {
    font-size: 14px;
    margin-bottom: 20px;
  }

  img {
    max-width: 100%;
    max-width: calc(100% + 40px);
    box-shadow: 0 0 20px 5px rgba(0, 0, 0, 0.15);
    border-radius: 4px;
    margin-left: -20px;
  }
`;

export {
  FlexRow,
  Row,
  MessengerPreview,
  IntegrationName,
  BrandName,
  Options,
  Description,
  Script,
  RefreshPermission,
  GoogleButton,
  LeftContent,
  Content,
  AccountBox,
  AccountTitle,
  AccountItem,
  FacebookButton,
  ImageWrapper,
  TextWrapper
};
