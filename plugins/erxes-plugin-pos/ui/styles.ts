import { dimensions, colors, ContentHeader } from 'erxes-ui'
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

export const LoyaltyAmount = styled.div`
  font-weight: 800;
  line-height: 20px;
  padding-left: 15px;
  display: flex;
  position: relative;
  flex-direction: row;
  transition: all ease 0.3s;
`;

export const SettingsContent = styled.div`
  padding: 30px;
`;


export const ContentBox = styled.div`
  padding: ${dimensions.coreSpacing}px;
  max-width: 640px;
  margin: 0 auto;
`;

export const Description = styled.div`
  color: ${colors.colorCoreGray};
  font-size: 12px;
`;


export const LinkButton = styled.a`
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;

export const ActionButtons = styled.div`
  display: flex;
  overflow: hidden;
  align-items: center;
  transition: all 0.3s ease;
  float: right;

  * {
    padding: 0;
    margin-left: ${dimensions.unitSpacing}px;

    &:first-child {
      margin-left: 0;
    }
  }
`;

export const Actions = styled.div`
  float: right
`;

export const RowTitle = styled.div`
  > a {
    color: ${colors.textPrimary};
  }

  &:hover {
    text-decoration: underline;
    color: ${colors.colorBlack};
    cursor: pointer;
  }
`;

export const Content = styled.div`
  display: flex;
  height: 100%;
  overflow: hidden;

  > form {
    display: flex;
    flex-direction: column;
    flex: 1;
  }
`;

export const LeftContent = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const TabletPreview = styled.div`
  background: url('/images/previews/tablet.png') no-repeat center center;
  width: 768px;
  height: 1024px;
  margin: 0 auto;
  padding: 80px ${dimensions.coreSpacing}px;
  margin-top: ${dimensions.coreSpacing}px;
`;


const PreviewContainer = styled.div`
  position: relative;
  height: 100%;
  padding: 20px;
`;

export const PreviewWrapper = styled.div`
  width: 40%;
  background: ${colors.colorWhite};
  margin-left: 5px;

  ${TabletPreview} {
    background-size: contain;
    width: 85%;
    height: 100%;

    ${PreviewContainer} {
      max-height: 600px;
    }

    @media (max-width: 1400px) {
      padding: 40px 10px;
    }
  }
`;

export const SidebarListItem = styledTS<{ isActive: boolean }>(styled.li)`
  position: relative;
  border-bottom: 1px solid ${colors.borderPrimary};
  background: ${props => props.isActive && colors.bgActive};
  overflow: hidden;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-right: 20px;

  a {
    white-space: normal;
    flex: 1;
    padding: 10px 0 10px 20px;
    font-weight: 500;

    &:hover {
      background: none;
    }

    &:focus {
      color: inherit;
      text-decoration: none;
    }

    > span {
      color: #666;
      font-weight: normal;
    }
  }

  &:last-child {
    border: none;
  }

  &:hover {
    cursor: pointer;
    background: ${props => !props.isActive && colors.bgLight};

    ${ActionButtons} {
      width: 35px;
    }
  }
`;

export const FlexColumn = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;

  ${ContentHeader} {
    border-bottom: none;
    border-top: 1px solid ${colors.borderPrimary};
  }
`;



export const FlexItem = styled.div`
  display: flex;
  height: 100%;
`;


export const Row = styled.div`
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

export const DomainRow = styled.div`
  background: ${colors.bgLight};
  border-radius: 4px;
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid ${colors.borderPrimary};
`;

export const ClickableRow = styled.div`
  cursor: pointer;

  &:hover {
    color: ${colors.textSecondary};
  }
`;
