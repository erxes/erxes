import styled from 'styled-components';
import { colors } from 'modules/common/styles';

const columnSizing = '20px';
const borderRadius = '2px';
const borderDarker = '#e6e6e6';

const Columns = styled.div`
  display: flex;
  flex-direction: row;
  height: 100%;
`;

const Column = styled.div`
  flex: 4;
  position: relative;
  overflow: hidden;

  > input {
    margin-bottom: ${columnSizing};
  }

  ul {
    height: 40vh;
    overflow: auto;
    padding: 0;
    margin: 0;
    list-style-type: none;

    li {
      padding: 6px 40px 6px ${columnSizing};
      position: relative;
      margin-bottom: 6px;
      border: 1px solid ${borderDarker};
      border-radius: ${borderRadius};
      transition: all 0.3s ease;

      > i {
        position: absolute;
        right: -1px;
        top: -1px;
        bottom: -1px;
        width: 0;
        overflow: hidden;
        align-items: center;
        justify-content: center;
        display: flex;
        background: ${colors.colorCoreGreen};
        border-radius: ${borderRadius};
        color: ${colors.colorWhite};
        transition: all 0.3s ease;
      }

      &:hover {
        cursor: pointer;
        background: ${colors.bgActive};

        > i {
          width: 34px;
        }
      }
    }
  }

  &:last-of-type {
    flex: 3;
    margin-left: ${columnSizing};
    padding-left: ${columnSizing};
    border-left: 1px solid ${colors.borderDarker};

    li {
      font-weight: bold;

      > i {
        background: ${colors.colorCoreRed};
      }
    }
  }

  &.multiple:first-child {
    margin-right: ${columnSizing};
  }
`;

const Title = styled.h4`
  margin: 0 0 ${columnSizing} 0;
  background: ${colors.bgActive};
  padding: 10px ${columnSizing};
  font-size: 12px;
  text-transform: uppercase;
  white-space: ${props => (props.full ? 'normal' : 'nowrap')};
  overflow: hidden;
  text-overflow: ellipsis;

  span {
    opacity: 0.7;
    margin-left: 10px;
  }
`;

const Footer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  p {
    margin: 0;
    display: block;
    text-align: left;

    a {
      cursor: pointer;
    }
  }
`;

const LoadMore = styled.div`
  text-align: center;
  margin-top: 10px;
`;

const SubContent = styled.div`
  flex: 1;
`;

const Info = styled.div`
  margin-top: 5px;

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
  display: inline-block;
  font-size: 12px;
  font-weight: normal;
  color: ${colors.colorCoreGray};
`;

export {
  Columns,
  Column,
  Title,
  Footer,
  LoadMore,
  SubContent,
  InfoTitle,
  InfoDetail,
  Info
};
