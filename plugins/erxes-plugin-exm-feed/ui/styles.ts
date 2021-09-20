import styled from 'styled-components';

export const FeedLayout = styled.div`
  display: flex;
  justify-content: space-around;
`;

export const TabLayout = styled.div`
  overflow: hidden;
  width: 500px;
`;

export const HeaderTab = styled.div`
  position: fixed;
  width: 500px;
`;

export const FormContainer = styled.div`
  padding: 15px 20px 0px 20px;
  flex: 1;
`;

export const NewsFeedLayout = styled.div`
  ul {
    width: 500px;
    padding: 0px;

    li {
      list-style-type: none;
      margin-bottom: 20px;
      border-radius: 10px;
      padding: 10px;
      box-shadow: 0 0 5px 0 rgb(0 0 0 / 8%);
    }
  }
`;

export const HeaderFeed = styled.div`
  display: flex;
  justify-content: space-between;
`;

export const FirstSection = styled.div`
  display: flex;

  img {
    width: 36px;
    height: 36px;
    margin-top: 3px;
    border-radius: 50%;
  }
`;

export const TypeOfContent = styled.div`
  p {
    color: green; 
    marginBottom: 0px;
  }
`;

export const Hours = styled.div`

`;

export const BodyFeed = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 10px;

  b {
    margin-top: 5px;
    margin-bottom: 5px;
  }

  img {
    border-radius: 20px;
  }

`;