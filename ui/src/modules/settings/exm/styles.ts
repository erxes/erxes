import styled from 'styled-components';

export const GeneralWrapper = styled.div`
  padding: 40px;
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

export const AppearanceWrapper = styled.div`
  display: flex;
  justify-content: center;
  > div:last-child {
    margin: 40px 40px;
  }
`;

export const AppSettings = styled.div`
  width: 900px;
  margin-right: 50px;
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
`;

export const Logos = styled.div`
  > div {
    margin-bottom: 0;
  }
  > div:last-child {
    border: 1px solid #673fbd;
    width: max-content;
    > div {
      margin-bottom: 0;
    }
    > label {
      display: flex;
      align-items: center;
      background-color: white;
      border-radius: 0;
      min-height: 80px;

      &: hover {
        color: #673fbd;
      }
    }
  }
`;

export const Colors = styled.div`
  > div {
    display: flex;
    align-items: center;
    margin-bottom: 20px;

    label {
      width: 200px;
    }
  }
`;

export const WelcomeContent = styled.div`
  > div {
    margin-top: 20px;
    input {
      margin-top: 50px;
    }
    textarea {
      width: 600px;
    }
  }
`;

export const UploadItems = styled.div`
  display: flex;
  height: 34px;
  justify-content: center;
  align-items: center;
  padding-left: 10px;
`;
