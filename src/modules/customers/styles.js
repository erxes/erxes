import styled from 'styled-components';
import { colors } from '../common/styles';

const columnSizing = '20px';
const borderRadius = '2px';

const Columns = styled.div`
  display: flex;
  flex-direction: row;
  height: 100%;
`;

const Column = styled.div`
  flex: 4;
  position: relative;

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
      border: 1px solid #e6e6e6;
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

      &:last-child {
        margin: 0;
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
`;

const Title = styled.h4`
  margin: 0 0 ${columnSizing} 0;
  background: ${colors.bgActive};
  padding: 10px ${columnSizing};
  font-size: 13px;
  text-transform: uppercase;

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

const DetailContent = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const SubContent = styled.div`
  flex: 1;
`;

export { Columns, Column, Title, Footer, LoadMore, DetailContent, SubContent };
