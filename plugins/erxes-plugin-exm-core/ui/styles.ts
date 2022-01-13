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
    > h4 {
      color: #673FBD;
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
  justify-content: flex-start;
`;

export const FeatureRowItem = styled.div`
  min-width: 200px;
  margin-right: 20px;
`;

export const FeatureRowFlex = styled.div `
  display: flex;
  flex: 1;
`;

export const FeatureLayout = styled.div`
`;

export const DeleteButton = styled.div `
  margin: auto;
  float: right; 
  background: transparent;
  border: none;
  
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
  margin: 0 auto;

  > div:first-child {
    padding: 50px 0 40px 0;
    width: 70%; 
  }
  > div:last-child {
    padding: 0;
  }
  > button {
    float: right;
    margin-bottom:20px;
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
    border-bottom: 1px dashed #EEE;
  > div {
    display: flex;
    justify-content: flex-start;
    > div{
      margin-right: 50px;
    }
  }
  > img {
  margin: 10px;
}
`;

export const GrayLabel = styled.div`
  color: #888;
  margin-bottom: 20px;
`;

export const Colors = styled.div`
 > div {
   display: flex;
   align-items: center;
 }
`;

export const WelcomeContent = styled.div`
  > div {
    margin-top: 20px;
    :first-child {
      display: flex;
      height: 35px;
      justify-content: space-between;
      margin-bottom: 20px;
    }
  }
`;

export const PageContainer = styled.div`
  display: flex;
  align-items: center;
  margin: 20px 0 20px 0;

  > div {
  :first-child {
    margin-right: 0;
  }
    margin-right: 40px;    
  }

  > span {
    margin-right: 40px;    
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
  max-width: max-content;
  border: 1px solid ${colors.borderDarker};
  cursor: pointer;
`;

export const ColorPicker = styled.div`
  width: 80px;
  height: 27px;
  border-radius: 2px;
`;
