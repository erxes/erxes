import {
  IconCategory,
  IconCertificate,
  IconCube,
  IconFilter,
  IconListCheck,
  IconRulerMeasure,
  IconSettings,
  IconStack2,
} from '@tabler/icons-react';
import type { ComponentType } from 'react';
import { ProductsPath } from '@/types/paths/ProductsPath';

export const PRODUCT_NAVIGATION_ICONS: Record<
  ProductsPath,
  ComponentType<{ className?: string }>
> = {
  [ProductsPath.Index]: IconCube,
  [ProductsPath.Products]: IconCube,
  [ProductsPath.Categories]: IconCategory,
  [ProductsPath.Uoms]: IconRulerMeasure,
  [ProductsPath.GeneralConfig]: IconSettings,
  [ProductsPath.SimilarityGroup]: IconStack2,
  [ProductsPath.BundleCondition]: IconFilter,
  [ProductsPath.BundleRule]: IconListCheck,
  [ProductsPath.ProductRule]: IconCertificate,
};
