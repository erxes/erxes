import styled from 'styled-components';
import { colors } from '../common/styles';

const columnSizing = '20px';

const Columns = styled.div`
  display: flex;
  flex-direction: row;
  height: 100%;
`;

const Column = styled.div`
  flex: 1;

  &:last-of-type {
    margin-left: ${columnSizing};
    padding-left: ${columnSizing};
    border-left: 1px solid #ddd;
  }

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
      padding: 5px ${columnSizing};
      position: relative;
      margin-bottom: 5px;
      border: 1px solid ${colors.borderPrimary};
      border-radius: 2px;
      transition: all 0.3s ease;

      &:hover {
        cursor: pointer;
        background: ${colors.bgMain};

        i {
          transform: scale(1.15);
        }
      }

      &:last-child {
        margin: 0;
      }

      i {
        position: absolute;
        color: ${colors.colorCoreLightGray};
        right: ${columnSizing};
        transition: all 0.3s ease;
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

export { Columns, Column, Title, Footer, LoadMore };
