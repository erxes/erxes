import React from 'react';
import { AppContext } from 'appContext';
import {
  CategoryImage,
  CategoryItemWrapper,
  CategoryName,
  LeftCircle,
  Lines,
  ProductCategory
} from '../styles';
import { IProductCategory } from '../types';

type Props = {
  category: IProductCategory;
  activeCategoryId: string;
  orientation: string;
  mode: string;
  onClickCategory: (activeCategoryId: string) => void;
};

export default function CategoryItem(props: Props) {
  const { currentConfig } = React.useContext(AppContext);
  const {
    category,
    onClickCategory,
    activeCategoryId,
    orientation,
    mode
  } = props;
  const { name, attachment } = category;

  const attachmentUrl = attachment && attachment.url ? attachment.url : '';
  const isActive = category._id === activeCategoryId;
  const isKiosk = mode === 'kiosk';

  const color =
    currentConfig &&
    currentConfig.uiOptions &&
    currentConfig.uiOptions.colors &&
    currentConfig.uiOptions.colors.primary;

  return (
    <CategoryItemWrapper
      color={color}
      onClick={() => onClickCategory(category._id)}
    >
      <ProductCategory
        isActive={isActive}
        color={color}
        isKiosk={isKiosk}
        isPortrait={orientation === 'portrait'}
      >
        <CategoryName color={color} isKiosk={isKiosk}>
          <CategoryImage isKiosk={isKiosk}>
            <img
              src={attachmentUrl ? attachmentUrl : 'images/no-category.jpg'}
              alt={name}
            />
          </CategoryImage>
          <span>{name}</span>
        </CategoryName>
      </ProductCategory>
      {!isKiosk && (
        <>
          <LeftCircle isActive={isActive} color={color} />
          <Lines isActive={isActive} color={color} />
        </>
      )}
    </CategoryItemWrapper>
  );
}
