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
  margin: 20px 0;
`;

const ShadowedHeader = styled.div`
  box-shadow: 0px 3px 3px rgba(0,0,0,0.02);
  
`;

const EmptyWrapper = styled.div`
  margin-top: 60px;

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

export { ChartWraper, FilterItem, SelectType, EmptyWrapper, Label, TimesWrapper, ShadowedHeader }