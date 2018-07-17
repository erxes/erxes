import styled from 'styled-components';
import { dimensions, colors, typography } from 'modules/common/styles';
import { rgba } from 'modules/common/styles/color';

const FullContent = styled.div`
  flex: 1;
  display: flex;
  min-height: 100%;
  justify-content: ${props => props.center && 'center'};
  align-items: center;
`;

const BoxRoot = styled.div`
  text-align: center;
  float: left;
  background: ${colors.colorLightBlue};
  box-shadow: 0 8px 5px ${rgba(colors.colorCoreGray, 0.08)};
  margin-right: ${dimensions.coreSpacing}px;
  margin-bottom: ${dimensions.coreSpacing}px;
  border-radius: ${dimensions.unitSpacing / 2}px;
  transition: all 0.25s ease;

  > a {
    display: block;
    padding: ${dimensions.coreSpacing}px;
    text-decoration: none;

    &:focus {
      text-decoration: none;
    }
  }

  img {
    width: 83px;
    transition: all 0.5s ease;
  }

  span {
    color: ${colors.colorCoreGray};
    display: block;
    margin-top: ${dimensions.unitSpacing}px;
  }

  &:hover {
    cursor: pointer;
    box-shadow: 0 10px 20px ${rgba(colors.colorCoreDarkGray, 0.12)};

    span {
      font-weight: 500;
    }

    img {
      transform: scale(1.1);
    }
  }

  @media (max-width: 780px) {
    width: 100%;
  }
`;

const InfoWrapper = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;

  .name {
    flex: 1;
    word-break: break-word;
  }

  i {
    transition: all 0.3s ease;
    color: ${colors.colorCoreLightGray};

    &:hover {
      cursor: pointer;
      color: ${colors.colorCoreGray};
    }
  }
`;

const Links = styled.div`
  margin-top: 5px;

  a {
    color: ${colors.colorCoreLightGray};
    margin-right: 10px;

    &:hover {
      color: ${colors.colorCoreGray};
    }

    i {
      font-size: 14px;
    }
  }
`;

const FormWrapper = styled.div`
  display: flex;

  img {
    display: block;
    width: 100px;
    height: 100px;
    border-radius: 50px;
  }
`;

const FormColumn = styled.div`
  flex: 1;
  padding-right: 40px;

  &:last-of-type {
    padding: 0;
  }
`;

const ColumnTitle = styled.h4`
  text-transform: uppercase;
  font-weight: ${typography.fontWeightMedium};
  border-bottom: 1px dotted ${colors.colorShadowGray};
  padding: ${dimensions.unitSpacing}px 0;
  font-size: 14px;
  margin: ${dimensions.unitSpacing}px 0 ${dimensions.coreSpacing}px 0;
`;

const ModalFooter = styled.div`
  text-align: right;
  margin-top: 40px;
`;

const CenterContent = styled.div`
  text-align: center;
  margin-top: 10px;
`;

const ActivityContent = styled.div`
  position: relative;
  height: ${props => props.isEmpty && '360px'};
`;

const Well = styled.div`
  min-height: ${dimensions.coreSpacing}px;
  padding: ${dimensions.unitSpacing}px ${dimensions.coreSpacing}px;
  margin-bottom: ${dimensions.coreSpacing}px;
  background-color: ${colors.bgActive};
  border-left: 2px solid ${colors.colorSecondary};
`;

const DropIcon = styled.span`
  &:after {
    cursor: pointer;
    content: '\\e827';
    font-family: 'erxes';
    float: right;
    transition: all ease 0.3s;
    margin-left: ${dimensions.unitSpacing}px;
    transform: ${props => props.isOpen && `rotate(180deg)`};
  }
`;

export {
  BoxRoot,
  FullContent,
  ModalFooter,
  InfoWrapper,
  Links,
  Well,
  FormWrapper,
  FormColumn,
  ColumnTitle,
  CenterContent,
  ActivityContent,
  DropIcon
};
