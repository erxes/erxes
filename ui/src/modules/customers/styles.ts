import { colors, dimensions, typography } from 'modules/common/styles';
import { SidebarList } from 'modules/layout/styles';
import styled, { css } from 'styled-components';
import styledTS from 'styled-components-ts';

const Info = styled.div`
  margin-top: 5px;
  white-space: normal;

  > span {
    font-weight: normal;
  }
`;

const InfoTitle = styled.span`
  font-weight: 500;
  margin-bottom: 5px;
  margin-right: 10px;
`;

const InfoDetail = styled.p`
  margin: 0;
  display: block;
  font-size: 12px;
  font-weight: normal;
  color: ${colors.colorCoreGray};
`;

const Actions = styledTS<{ isSmall?: boolean }>(styled.div)`
  display: flex;
  justify-content: space-between;
  padding: 0 ${dimensions.coreSpacing}px ${dimensions.unitSpacing}px;

  > a,
  button {
    flex: 1;
  }

  > div {
    margin-left: 10px;
  }

  .dropdown {
    display: ${props => props.isSmall ? 'inline-block' : 'black'} ;
  }
`;

const Action = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: ${dimensions.unitSpacing}px;
`;

const States = styled.div`
  display: flex;
  margin-bottom: ${dimensions.unitSpacing}px;

  > div {
    width: 100%;

    b {
      font-size: 16px;
      line-height: 22px;
    }
  }
`;

const List = styled(SidebarList)`
  li {
    border-bottom: 1px solid ${colors.borderPrimary};
    color: ${colors.textPrimary};
    white-space: normal;
    padding: 10px 20px;

    span {
      color: ${colors.colorCoreLightGray};
      margin: 0;
    }

    &:last-child {
      border: none;
    }
  }
`;

const InfoAvatar = styled.img`
  width: 40px;
  border-radius: 40px;
`;

const Contact = styled.div`
  display: flex;
  align-items: center;
  border-top: 1px solid ${colors.borderPrimary};
  padding: 10px 20px;
  position: relative;

  span {
    margin-right: ${dimensions.unitSpacing}px;
  }

  i {
    color: ${colors.colorCoreLightGray};
    cursor: pointer;
    position: absolute;
    right: ${dimensions.coreSpacing}px;
    top: 15px;
  }
`;

const NameContainer = styled.div`
  flex: 1;
  word-break: break-word;

  p {
    color: ${colors.colorCoreLightGray};
    margin: 0;
    font-size: 12px;
  }
`;

const Name = styledTS<{ fontSize?: number }>(styled.div)`
  font-size: ${props => props.fontSize && `${props.fontSize}px`};
  font-weight: 500;

  i {
    margin-left: 10px;
    transition: all 0.3s ease;
    color: ${colors.colorCoreLightGray};

    &:hover {
      cursor: pointer;
      color: ${colors.colorCoreGray};
    }
  }
`;

const CustomerState = styled.div`
  text-transform: capitalize;
  text-align: center;
  font-size: ${typography.fontSizeUppercase}px;
  line-height: 20px;
  font-weight: 500;
  color: ${colors.colorCoreGray};
`;

const TabContent = styled.div`
  padding: ${dimensions.coreSpacing}px;
`;

const ClickableRow = styled.span`
  cursor: pointer;

  &:hover {
    color: ${colors.textSecondary};
  }
`;

const BooleanStatus = styledTS<{ isTrue?: boolean }>(styled.div)`
  i {
    font-size: 16px;
    color: ${props =>
      props.isTrue ? colors.colorCoreGreen : colors.colorCoreRed};
  }
`;

const UserHeader = styled.div`
  margin: 0 -10px;
  padding: 10px 0;
`;

const MailBox = styled.div`
  background: ${colors.colorWhite};
  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;
  transition: all ease 0.3s;
`;

export const LeadStateWrapper = styled.div`
  display: flex;
  padding: 0 ${dimensions.coreSpacing}px;
  margin-bottom: ${dimensions.unitSpacing}px;
  align-items: center;

  @media (max-width: 768px) {
   flex-wrap: wrap;
  }

  > button {
    margin-left: 10px;
  }
`;

export const StateItem = styledTS<{ active?: boolean; past?: boolean }>(
  styled.div
)`
	flex: 1;
	padding: 5px ${dimensions.coreSpacing}px;
	line-height: ${dimensions.coreSpacing}px;
	position: relative;
	color: ${props => (props.active ? colors.colorWhite : colors.textSecondary)};
	background: ${props => (props.active ? colors.colorCoreBlue : colors.bgGray)};
	border-right: none;
	margin-right: ${dimensions.unitSpacing}px;
	margin-left: 5px;
	font-weight: 500;
	height: 32px;
	transition: opacity 0.3s ease;

	&:hover {
		opacity: 0.85;
		cursor: pointer;
	}

	&:first-child {
		border-top-left-radius: 17px;
		border-bottom-left-radius: 17px;
		margin-left: 0;

		&:after, &:before {
			left: ${dimensions.coreSpacing}px;
		}
	}

	&:last-child {
		border-top-right-radius: 17px;
		border-bottom-right-radius: 17px;
		margin-right: 0;

		&:after, &:before {
			right: ${dimensions.coreSpacing}px;
		}
	}

	&:after, &:before {
		content: '';
		position: absolute;
		height: 50%;
		left: 0;
		right: -5px;
		left: -5px;
	}
	
	&:after {
		background: ${colors.bgGray};
		transform: skew(-30deg) translate3d(0, 0, 0);
		bottom: 0;
	}

	&:before {
		background: ${colors.bgGray};
		transform: skew(28deg) translate3d(0, 0, 0);
		top: 0;
	}

	${props =>
    props.active &&
    css`
      color: ${colors.colorWhite};
      background: ${colors.colorCoreBlue};

      &:after {
        background: ${colors.colorCoreBlue};
      }

      &:before {
        background: ${colors.colorCoreBlue};
      }
    `};

	${props =>
    props.past &&
    css`
      color: ${colors.colorWhite};
      background: ${colors.colorCoreGreen};

      &:after {
        background: ${colors.colorCoreGreen};
      }

      &:before {
        background: ${colors.colorCoreGreen};
      }
    `};

	> div {
		z-index: 2;
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;

		i {
			margin-right: 5px;
		}
	}

	span {
		opacity: 0.8;
		font-weight: normal;
		font-size: 90%;
		margin-left: 5px;
  }
  
  @media (max-width: 768px) {
    margin-bottom: 5px;
  }
`;

export {
  InfoTitle,
  InfoDetail,
  Info,
  Actions,
  Action,
  List,
  InfoAvatar,
  Contact,
  NameContainer,
  Name,
  TabContent,
  ClickableRow,
  BooleanStatus,
  CustomerState,
  UserHeader,
  MailBox,
  States
};
