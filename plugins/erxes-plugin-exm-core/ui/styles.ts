import styled from 'styled-components';
import colors from 'erxes-ui/lib/styles/colors';

export const GeneralWrapper = styled.div`
  padding-top: 40px;
  margin: auto;
  width: 50%;
  min-width: max-content;
  > div {
    background-color: #fafafa;
    padding: 20px 20px 40px 20px;
    margin-bottom: 20px;
    margin-top: 20px;
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
      min-width: 500px;
    }
  }
`;

export const FeatureRow = styled.div`
  display: flex;
  margin-bottom: 15px;
  justify-content: space-between;
`;

export const FeatureRowItem = styled.div`
  min-width: 200px;
  margin-right: 20px;
`;

export const FeatureRowFlex = styled.div `
  display: flex;
`;

export const FeatureLayout = styled.div`
`;

export const XButton = styled.div `
   margin: auto;
  :hover{
    color: red;
    cursor: pointer;
  }
`;

export const AppearanceWrapper = styled.div`
  display: flex;
  flex-direction: row-reverse;
  justify-content: center;
  min-width: max-content;
  padding: 40px;
  > div:first-child {
    padding: 0 0 0 40px;
      width: 690px; 
  }
  > div:last-child {
    padding: 0;
  }
`;

export const AppSettings = styled.div`
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
  > img {
  margin: 10px;
}
}
`;

export const Colors = styled.div`
>div{
  display: flex;
  justify-content: space-around;
  > div {
    display: flex;
    align-items: center;
    margin-top: 20px;
    margin-right: 20px;
    label {
      width: 100px;
    }
  }
}
`;

export const WelcomeContent = styled.div`
  > div {
    margin-top: 20px;
    input {
      margin-top: 50px;
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

export const ColorPick = styled.div`
  border-radius: 4px;
  display: inline-block;
  padding: 3px;
  border: 1px solid ${colors.borderDarker};
  cursor: pointer;
`;

export const ColorPicker = styled.div`
  width: 80px;
  height: 27px;
  border-radius: 2px;
`;
