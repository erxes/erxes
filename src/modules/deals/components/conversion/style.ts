import { colors } from 'modules/common/styles';
import { MainContent } from 'modules/layout/styles';
import styled, { css } from 'styled-components';
import styledTS from 'styled-components-ts';

const StageWrap = styledTS<{ spacing?: number }>(styled.div)`
  overflow: hidden;
`;

const StageContainer = styledTS<{ spacing?: number }>(styled.div)`
  margin-bottom: 8px;
  min-width: ${props => (props.spacing ? props.spacing : '100')}%;
  font-size: 12px;
  justify-content: space-between;
  float: right;
`;

const Content = styled('div')`
  background-color: rgb(255, 255, 255);
  box-shadow: rgba(0, 0, 0, 0.2) 0px 1px 2px 0px;
  border-radius: 3px;
  display: flex;
  justify-content: space-between;
  overflow: hidden;
  align-items: center;
`;

const Stayed = styled('div')`
  border-left: 1px solid #ddd;
  padding: 8px 20px;
  font-weight: 600;
  font-size: 20px;
  background: ${colors.bgLight};
  color: ${colors.colorCoreGray};
  flex-shrink: 0;

  span {
    color: ${colors.textSecondary};
  }
`;

const Name = styled('div')`
  flex: 1;
  padding: 8px 20px;
  font-size: 15px;
  flex-shrink: 0;
`;

const Values = styled('div')`
  margin-top: 8px;
  text-align: right;
  padding: 0 5px;
`;

const DealContent = styled(MainContent)`
  margin: 0;
`;

export {
  DealContent,
  StageWrap,
  StageContainer,
  Content,
  Stayed,
  Name,
  Values
};
