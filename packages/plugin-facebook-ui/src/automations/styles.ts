import { DrawerDetail } from '@erxes/ui-automations/src/styles';
import Icon from '@erxes/ui/src/components/Icon';
import colors from '@erxes/ui/src/styles/colors';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import typography from '@erxes/ui/src/styles/typography';

export const Container = styled.div`
  padding: 10px 0;

  .dropdown-item {
    > a {
      color: ${colors.colorCoreGray};
    }
  }

  .dropdown-item:active {
    background-color: ${colors.colorShadowGray};
    color: ${colors.colorLightGray};
  }
`;

export const Padding = styled.div`
  padding: 10px;
`;

export const Row = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  button {
    flex-shrink: 0;
  }
`;

export const Wrapper = styled(DrawerDetail)`
  display: flex;
  flex-direction: column;
  min-height: 85%;
`;

export const MainContent = styled.main`
  flex: 1;
  overflow: auto;
  padding-bottom: 10px;
`;

export const BottomBarContainer = styled.footer`
  display: flex;
  padding: 10px;
  margin-top: auto;
  flex-direction: column;

  > div {
    display: flex;
  }
`;

export const BottomBarActionsContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
`;

export const BottomBarAction = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  border: ${colors.bgGray} solid 1px;
  border-radius: 5px;
  height: 35px;
  gap: 10px;
  font-weight: ${typography.fontWeightMedium};
  padding: 5px 15px;
  cursor: pointer;
  margin-left: 5px;
  margin-bottom: 5px;
  > div {
    display: flex;
    flex-direction: row;
    gap: 4px;
  }
`;

export const ContentWrapper = styled.div`
  width: 100%;
  display: grid;

  opacity: 1;
  transition: opacity 0.3s ease;

  &:hover {
    opacity: 1;
  }

  > i {
    opacity: 0;
    transition: opacity 0.3s ease;
    position: absolute;
    right: -20px;
  }

  &:hover > i {
    opacity: 1;
    cursor: pointer;
  }
`;

const btnRowColumns = {
  // 1:"70% 20% 5%",
  2: '90% 10%',
  3: '10% 80% 10%',
};

export const ButtonRow = styledTS<{ columns?: '2' | '3' }>(styled.div)`
  display: grid;
  grid-template-columns: ${({ columns }) => (columns ? btnRowColumns[columns] : '70% 20% 10%')} ;
  padding: 10px 0;
  border-bottom: 1px solid ${colors.bgGray};
  align-items: anchor-center;
  
  > a {
    border-right: 1px solid ${colors.bgGray};
    cursor: text;
  }
  > div {
    border-right: 1px solid ${colors.bgGray};
    cursor: pointer;

  > div:last-child {
    border-right: none;
  }
`;

export const QuickReplyImgUploader = styledTS<{}>(styled.div)`
  width: 30px;
  height: 30px;
  position: relative;
  cursor: pointer;


  > img {
    width: 100%;
    height: 100%;
    objectFit: cover;
    borderRadius: 4px;
  }

  > div {
    width: 100%;
    height:100%;
    place-content: center;
    text-align: center;
   }
`;

export const RemoveBtn = styled(Icon)`
  color: ${colors.colorCoreRed};
  text-align: end;

  &:hover {
    cursor: pointer;
  }
`;

export const ImagePreview = styled.div`
  height: 150px;
  display: flex;
  position: relative;
  align-items: center;
  overflow: hidden;
  border-radius: 5px;

  label {
    color: ${colors.colorWhite};
    transition: background 0.3s ease;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 2;

    div {
      visibility: hidden;
      opacity: 0;
      transition: all 0.3s ease;
      text-align: center;
    }

    &:hover {
      cursor: pointer;
      background-color: rgba(0, 0, 0, 0.4);

      div {
        visibility: visible;
        opacity: 1;
      }
    }
  }

  input[type='file'] {
    display: none;
  }

  img {
    display: block;
    width: 100%;
  }

  > div {
    display: flex;
    flex-direction: column;
    width: 100%;
    align-items: center;
    > i {
      display: flex;
      width: 100%;
      place-content: center;
    }
  }
`;

export const UploadWrapper = styled.div`
  height: 150px;
  display: flex;
  position: relative;
  align-items: center;
  place-content: center;
  color: ${colors.colorCoreGray};

  div {
    text-align: center;
    cursor: pointer;
  }

  input[type='file'] {
    display: none;
  }
`;

export const EmulatorWrapper = styled.div`
  padding: 40px 10px;
`;

export const CarouselContainer = styled.div`
  display: flex;
  flex-direction: row;
  overflow: hidden;
  position: relative;
`;

const CarouselButton = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: #555;
  color: #fff;
  font-size: 16px;
  cursor: pointer;
  border: none;
  outline: none;
`;

export const CarouselButtonLeft = styled(CarouselButton)`
  left: 10px;
`;

export const CarouselButtonRight = styled(CarouselButton)`
  right: 10px;
`;

export const CarouselContent = styled.div`
  display: flex;
  z-index: -1;
  transition: transform 0.5s ease;
`;

export const QuickReply = styled.div`
  background-color: #2d3645;
  border-radius: 15px;
  margin: 10px;
  padding: 5px 10px;
  cursor: pointer;
  white-space: nowrap;
  color: #80c2ff;
`;

export const QuickReplies = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  flex-wrap: wrap;

  &::-webkit-scrollbar {
    width: 0;
  }
`;

export const Card = styled.div`
  background-color: #f5f5f5;
  border: 1px solid #eee;
  border-radius: 5px;
  padding: 10px;
  margin: 5px 0;

  .extraContent {
    overflow-wrap: anywhere;
  }

  > p,
  > span {
    overflow-wrap: break-word;
    margin: 0 5px;
    font-weight: ${typography.fontWeightMedium};
  }

  > span {
    color: ${colors.colorLightGray};
  }

  img {
    height: 100px;
    width: 100%;
    object-fit: cover;
    border-radius: 5px 5px 0 0;
  }
`;

export const TriggersList = styled.div`
  padding: 10px 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;

  i > {
    font-size: 32px;
    color: ${colors.colorLightBlue};
  }
`;

const checkHover = (isActive, withoutHover) => {
  const header = isActive ? '' : '&:hover';
  const style = withoutHover
    ? ''
    : `{
    border: 1px solid #316ff6;
    box-shadow: 0 6px 10px 1px rgba(136, 136, 136, 0.12);
  }`;

  return `${header}${style}`;
};

export const TriggerItem = styledTS<{
  isActive?: boolean;
  small?: boolean;
  withoutHover?: boolean;
}>(styled.div)`
  display: flex;
  gap: ${({ small }) => (small ? '5px' : '25px')};;
  background-color:${colors.colorWhite};
  border: 1px solid ${colors.bgGray};
  padding: ${({ small }) => (small ? '0' : '10px')} 20px;
  border-radius: 10px;
  align-items: center;
  cursor: pointer;
  transition: all ease 0.3s;
  ${({ small }) => (small ? 'margin-bottom:5px' : '')};

  ${({ isActive, withoutHover }) => checkHover(isActive, withoutHover)} 

  > i {
    width: ${({ small }) => (small ? '30px' : '40px')};
    height: ${({ small }) => (small ? '30px' : '40px')};
    border-radius: 50%;
    background-color: #316ff6;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: ${({ small }) => (small ? '14px' : '20px')};
    color: white;
  }

  > div {
    > label {
      font-weight: ${typography.fontWeightMedium};
      font-size: 12px;
      margin: 0;
    }

    > p {
      font-weight: ${typography.fontWeightMedium};
      font-size: 12px;
      color: ${colors.colorCoreGray};
    }
  }
`;

export const ConditionsContainer = styled.div`
  margin: 10px 0;
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

export const Features = styledTS<{ isToggled: boolean }>(styled.span)`
  transition: all ease .3s;
  filter: ${props => !props.isToggled && `blur(4px)`};
  pointer-events: ${props => !props.isToggled && `none`};
`;

export const ListItem = styled.div`
    border: 1px solid #EEE;
    border-radius: 10px;
    padding: 10px 20px;
    display: flex;
    flex-direction: row;
    gap: 20px;
    font-weight: ${typography.fontWeightMedium};
    margin-bottom:10px;
}
`;

export const PreviewButton = styled.div`
  flex-shrink: 0;
  margin-right: 30px;
`;

export const FieldInfo = styledTS<{ error?: boolean }>(styled.div)`
  width: 100%;
  display:flex;
  justify-content: end;
  color:${({ error }) => (error ? colors.colorCoreRed : colors.colorCoreGray)}
`;
