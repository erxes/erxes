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
    margin-right: 100px;
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
  margin-bottom: 10px;
`;

export const FeatureRowItem = styled.div`
  min-width: 150px;
  margin-right: 10px;
`;

export const FeatureLayout = styled.div``;

export const AppearanceLayout = styled.div`
  display: flex;
  flex-direction: column;
  padding: 20px;
  min-width: 700px;
  > div {
    background-color: rgba(0, 0, 0, 0.05);
    padding: 20px;
    border-radius: 10px;
    margin-bottom: 20px;
    > b {
      font-size: 14px;
      text-transform: uppercase;
      font-weight: 500;
    }
  }
`;

export const Logos = styled.div`
  > div {
    display: flex;
    margin-top: 15px;
    > div {
      margin-left: 30px;
      > div {
        margin-top: 5px;
        display: flex;
        justify-content: center;
        align-items: center;
        border: 1px solid #5629b6;
        background-color: white;
        color: #5629b6;
        font-size: 30px;
        width: 80px;
        height: 80px;
      }

      &:last-child {
        > div {
          width: 160px;
        }
      }
    }
  }
`;
export const Colors = styled.div`
  > div {
    margin-top: 15px;
    > div {
      display: flex;
      align-items: end;
      margin-bottom: 15px;
      > div {
        margin-left: 40px;
        > div {
          border: 1px solid #5629b6;
          width: 70px;
          height: 20px;
        }
      }
    }
  }
`;
export const WelcomeContent = styled.div``;
