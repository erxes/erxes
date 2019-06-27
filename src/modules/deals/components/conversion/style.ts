import { colors } from 'modules/common/styles';
import { MainContent } from 'modules/layout/styles';
import styled, { css } from 'styled-components';
import styledTS from 'styled-components-ts';

const Container = styled.div`
  position: relative;
  height: 100%;
  overflow: auto;
`;

const ContentBody = styled.div`
  height: 100%;
  padding: 0 4px;
  margin: 0 4px;
  overflow-y: auto;
`;

const DealContent = styled(MainContent)`
  margin: 0;
`;

const StageWrap = styled.div`
  overflow: hidden;
  padding-bottom: 6px;
`;

const StageContainer = styledTS<{ spacing?: number }>(styled.div)`
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
  text-align: right;
  padding: 6px 10px 0 10px;
  font-weight: 500;
  color: ${colors.colorCoreGreen};

  i {
    font-size: 8px;
  }
`;

const Lost = styled('span')`
  color: ${colors.colorCoreRed};
  margin-right: 10px;
`;

const Result = styled.div`
  text-align: right;
  font-weight: 500;
  font-size: 12px;
  padding: 5px 10px;
  color: ${colors.colorCoreGray};
`;

export {
  Container,
  ContentBody,
  DealContent,
  StageWrap,
  StageContainer,
  Content,
  Stayed,
  Name,
  Values,
  Lost,
  Result
};
