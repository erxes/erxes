import Card from 'antd/lib/card';
import styled from 'styled-components';

const ChartWraper = styled.div`
  margin: 20px;
`;

const FilterItem = styled.span`
  margin-bottom: 15px;

  .ant-btn-group {
    margin-right: 10px;

    &:last-child {
      margin-right: 0;
    }
  }
`;

const SelectType = styled.div`
  margin: 10px 0 20px 0;
`;

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  background: #fff;
  padding: 10px 20px 5px 20px;

  > button {
    margin: 0 0 5px 10px;
  }
`;

const ShadowedHeader = styled.div`
  box-shadow: 0px 3px 3px rgba(0, 0, 0, 0.02);
`;

const EmptyWrapper = styled.div`
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;

  .ant-empty-description {
    margin-top: 20px;
  }
`;

const Label = styled.label`
  margin-bottom: 10px;
  color: #a1a1b5;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  font-size: 11px;
  font-weight: bold;
  display: block;
`;

const TimesWrapper = styled.span`
  strong {
    margin: 0 10px;
    color: #555;
  }
`;

const StyledCard = styled(Card)`
  box-shadow: 0px 2px 4px rgba(141, 149, 166, 0.1);
  border-radius: 4px;
  height: 100%;
  width: 100%;

  .ant-card-head {
    position: relative;
    z-index: 2;
  }

  .ant-card-body {
    max-height: calc(100% - 57px);
    overflow-y: auto;

    .ant-table-pagination.ant-pagination {
      margin-bottom: 0;
    }
  }
`;

const StyledCardPdf = styled(Card)`
  box-shadow: 0px 2px 4px rgba(141, 149, 166, 0.1);
  border-radius: 4px;
  height: 100%;
  width: 100%;
  margin-bottom: 20px;

  .ant-card-head {
    position: relative;
    z-index: 2;
  }

  .ant-card-body {
    max-height: calc(100% - 57px);
    overflow-y: auto;

    .ant-table-pagination.ant-pagination {
      margin-bottom: 0;
    }
  }
`;

export {
  ChartWraper,
  FilterItem,
  SelectType,
  EmptyWrapper,
  Label,
  TimesWrapper,
  ShadowedHeader,
  Actions,
  StyledCard,
  StyledCardPdf
};
