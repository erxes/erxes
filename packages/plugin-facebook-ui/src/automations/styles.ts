import colors from '@erxes/ui/src/styles/colors';
import typography from '@erxes/ui/src/styles/typography';
import styled from 'styled-components';
import { DrawerDetail } from '@erxes/ui-automations/src/styles';
import styledTS from 'styled-components-ts';
import Icon from '@erxes/ui/src/components/Icon';
import Popover from 'react-bootstrap/Popover';

export const Container = styled.div`
  padding: 10px 0;
`;

export const Padding = styled.div`
  padding: 10px;
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
  justify-content: space-between;
`;

export const BottomBarAction = styled.div`
  display: flex;
  flex-direction: row;
  border: ${colors.bgGray} solid 1px;
  border-radius: 5px;
  height: 35px;
  gap: 10px;
  font-weight: ${typography.fontWeightMedium};
  padding: 5px 15px;
  cursor: pointer;
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

export const ButtonRow = styledTS<{ twoElement?: boolean }>(styled.div)`
  display: grid;
  grid-template-columns: ${({ twoElement }) =>
    twoElement ? '90% 5%' : '70% 20% 5%'} ;
  grid-gap: 10px;
  padding: 10px 0;
  border-bottom: 1px solid ${colors.bgGray};
  > div,
  > a {
    border-right: 1px solid ${colors.bgGray};
  }

  > div:last-child {
    border-right: none;
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

  > p,
  > span {
    margin: 0 5px;
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
