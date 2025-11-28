import { CurrencyCode } from 'erxes-ui';
import { UseFormReturn } from 'react-hook-form';
import { ApolloError } from '@apollo/client';

export interface ProductAttachment {
  url: string;
  name?: string;
  type?: string;
  size?: number;
}

export interface UomType {
  _id: string;
  name: string;
  code?: string;
}

export interface ProductDetail {
  _id?: string;
  name?: string;
  barcodeDescription?: string;
  description?: string;
  categoryId?: string;
  type?: string;
  code?: string;
  status?: string;
  attachment?: ProductAttachment;
  barcodes?: string;
  shortName?: string;
  unitPrice?: number;
  uom?: string;
  vendorId?: string;
  scopeBrandIds?: string[];
}

export interface ProductFormValues {
  _id?: string;
  name?: string;
  barcodeDescription?: string;
  description?: string;
  categoryId?: string;
  type?: string;
  code?: string;
  status?: string;
  attachment?: ProductAttachment;
  barcodes?: string;
  shortName?: string;
  unitPrice?: number;
  uom?: string;
  vendor?: string;
  scopeBrandIds?: string[];
  vendorId?: string;
}

export interface ProductGeneralProps {
  form: UseFormReturn<ProductFormValues>;
}

export interface ProductTypeOption {
  value: string;
  label: string;
}

export interface CurrencyValue {
  currencyCode: CurrencyCode;
  amountMicros: number;
}

export interface UseProductDetailReturn {
  productDetail: ProductDetail | null;
  loading: boolean;
  error?: ApolloError;
}

export interface UseProductsEditReturn {
  productsEdit: (options: { variables: any }) => Promise<any>;
  loading?: boolean;
  error?: any;
}

export interface UseUomReturn {
  uoms: UomType[];
  loading?: boolean;
  error?: ApolloError;
}

export interface BrandFieldProps {
  values: string[];
  onChange: (values: string[]) => void;
}

export interface VendorFieldProps {
  value?: string;
  onChange: (value: string) => void;
}

export interface SelectCategoryProps {
  selected?: string;
  onSelect: (value: string) => void;
  className?: string;
  size?: string;
}
