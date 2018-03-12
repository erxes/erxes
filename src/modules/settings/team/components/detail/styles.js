import styled from 'styled-components';
import { colors, dimensions, typography } from 'modules/common/styles';

const Channel = styled.div`
  border-top: 1px solid ${colors.borderPrimary};
  width: 100%;

  &:first-of-type {
    border-top: none;
  }

  span {
    display: block;
    color: ${colors.colorCoreLightGray};

    &:last-child {
      overflow: hidden;
    }
  }

  i {
    color: ${colors.colorCoreLightGray};
    position: absolute;
    right: ${dimensions.coreSpacing}px;

    &:hover {
      cursor: pointer;
    }
  }
`;

const Info = styled.span`
  white-space: pre;
  font-size: ${typography.fontSizeHeading8}px;
  text-align: right;
  color: ${colors.colorCoreGray};
  margin-top: 2px;
  position: absolute;
  right: ${dimensions.coreSpacing}px;
  max-width: 60%;
  overflow: hidden;
  text-overflow: ellipsis;
  background-color: #fff;
  box-shadow: -2px 0 10px 2px #fff;
  padding-left: 10px;

  a {
    padding: 0;
    color: ${colors.linkPrimary};
  }

  span {
    float: right;
    margin-left: 5px;
  }
`;

export { Channel, Info };
