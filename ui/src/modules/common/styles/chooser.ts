import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import { dimensions } from '.';
import colors from './colors';

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
    padding: 0 10px 0 0;
    margin: 20px 0 0 0;
    list-style-type: none;

    li {
      padding: 6px 40px 6px ${columnSizing};
      position: relative;
      margin-bottom: 6px;
      border: 1px solid ${colors.borderDarker};
      border-radius: ${borderRadius};
      transition: all 0.3s ease;
      text-overflow: ellipsis;
      overflow: hidden;

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

const Title = styledTS<{ full?: boolean }>(styled.h4)`
  margin: 0 0 ${columnSizing} 0;
  background: ${colors.bgActive};
  padding: 10px ${columnSizing};
  white-space: ${props => (props.full ? 'normal' : 'nowrap')};
  font-size: 12px;
  text-transform: uppercase;
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

    a,
    span {
      color: ${colors.linkPrimary};
      cursor: pointer;
    }
  }
`;

const Select = styled.div`
  line-height: 33px;
  border-bottom: 1px solid ${colors.colorShadowGray};
  min-width: 100px;
  display: flex;
  justify-content: space-between;

  > span {
    margin-left: ${dimensions.unitSpacing / 2}px;
  }

  i {
    margin-left: ${dimensions.unitSpacing / 2}px;

    &:hover {
      color: ${colors.colorPrimary};
      cursor: pointer;
    }
  }
`;

const ActionTop = styled.div`
  display: flex;

  > * {
    margin-left: ${dimensions.coreSpacing}px;

    &:first-child {
      margin-left: 0;
    }
  }
`;

export { Columns, Column, Title, Footer, Select, ActionTop };
