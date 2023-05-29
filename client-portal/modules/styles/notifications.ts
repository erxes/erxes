import { colors, dimensions } from '@erxes/ui/src/styles';
import styled from 'styled-components';

const NotificationWrapper = styled.div`
  position: relative;
  padding-bottom: 30px;
  border-top: 1px solid ${colors.borderPrimary};
`;

const NotificationSeeAll = styled.div`
  position: absolute;
  bottom: 0;
  width: 100%;
  border-top: 1px solid ${colors.borderPrimary};
  height: 30px;

  font-size: 13px !important;
  color: rgb(23, 133, 252) !important;

  a {
    padding: 5px ${dimensions.coreSpacing}px;
    display: block;
    text-align: left;
  }
`;

const MarkAllRead = styled.a`
  position: relative;
  cursor: pointer;

  font-size: 13px !important;
  color: rgb(23, 133, 252) !important;

  padding: 5px ${dimensions.coreSpacing}px;
  float: right;
`;

export { NotificationSeeAll, NotificationWrapper, MarkAllRead };
