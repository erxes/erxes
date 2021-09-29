import styled from 'styled-components';

export const GeneralWrapper = styled.div`
  padding: 50px;
  min-width: max-content;
  > div {
    background-color: #fafafa;
    padding: 20px 20px 40px 20px;
    margin-bottom: 20px;
    border-radius: 10px;

    > p {
      font-size: 14px;
      text-transform: uppercase;
      font-weight: 500;
    }
  }
  > button {
    float: right;
  }
`;

export const TeamPortal = styled.div`
  > div {
    > div {
      margin-right: 80px;

      &:last-child {
        min-width: 450px;
      }
    }
  }
`;

export const FeatureRow = styled.div`
  display: flex;
  margin-bottom: 15px;
`;

export const FeatureRowItem = styled.div`
  min-width: 150px;
  margin-right: 20px;
`;

export const FeatureLayout = styled.div``;

export const WelcomeContent = styled.div``;
