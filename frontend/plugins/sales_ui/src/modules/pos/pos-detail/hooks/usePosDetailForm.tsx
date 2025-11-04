import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { IPosDetail } from '../types/IPos';
import { 
  BasicInfoFormValues, 
  basicInfoSchema, 
  FinanceConfigFormValues, 
  financeConfigSchema, 
  PermissionFormValues, 
  permissionSchema, 
  UiConfigFormValues, 
  uiConfigSchema, 
  ProductFormValues, 
  productSchema, 
  PaymentFormValues, 
  paymentSchema, 
  DeliveryConfigFormValues, 
  deliveryConfigSchema 
} from '../../create-pos/components/formSchema';

const getDefaultValues = <T,>(schema: any): T => {
  try {
    return schema.parse({}) as T;
  } catch {
    return {} as T;
  }
};

export const usePosDetailForms = (posDetail?: IPosDetail) => {
  const basicInfoForm = useForm<BasicInfoFormValues>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: getDefaultValues<BasicInfoFormValues>(basicInfoSchema),
  });

  const permissionForm = useForm<PermissionFormValues>({
    resolver: zodResolver(permissionSchema),
    defaultValues: getDefaultValues<PermissionFormValues>(permissionSchema),
  });

  const financeForm = useForm<FinanceConfigFormValues>({
    resolver: zodResolver(financeConfigSchema),
    defaultValues: getDefaultValues<FinanceConfigFormValues>(financeConfigSchema),
  });

  const uiConfigForm = useForm<UiConfigFormValues>({
    resolver: zodResolver(uiConfigSchema),
    defaultValues: getDefaultValues<UiConfigFormValues>(uiConfigSchema),
  });

  const productForm = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: getDefaultValues<ProductFormValues>(productSchema),
  });

  const paymentForm = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: getDefaultValues<PaymentFormValues>(paymentSchema),
  });

  const deliveryConfigForm = useForm<DeliveryConfigFormValues>({
    resolver: zodResolver(deliveryConfigSchema),
    defaultValues: getDefaultValues<DeliveryConfigFormValues>(deliveryConfigSchema),
  });

  useEffect(() => {
    if (!posDetail) return;

    basicInfoForm.reset({
      name: posDetail.name || '',
      description: posDetail.description || '',
      allowTypes: (posDetail.allowTypes || []).filter(
        (type): type is 'eat' | 'take' | 'delivery' | 'loss' | 'spend' | 'reject' =>
          ['eat', 'take', 'delivery', 'loss', 'spend', 'reject'].includes(type),
      ),
      scopeBrandIds: posDetail.scopeBrandIds || [],
      branchId: posDetail.branchId || '',
      departmentId: posDetail.departmentId || '',
    });

    const adminId = posDetail.adminTeamMember || posDetail.adminIds?.[0] || '';
    const cashierId =
      posDetail.cashierTeamMember || posDetail.cashierIds?.[0] || '';

    permissionForm.reset({
      adminTeamMember: adminId,
      adminPrintTempBill: posDetail.adminPrintTempBill || false,
      adminDirectSales: posDetail.adminDirectSales || false,
      adminDirectDiscountLimit: posDetail.adminDirectDiscountLimit || '',
      cashierTeamMember: cashierId,
      cashierPrintTempBill: posDetail.cashierPrintTempBill || false,
      cashierDirectSales: posDetail.cashierDirectSales || false,
      cashierDirectDiscountLimit: posDetail.cashierDirectDiscountLimit || '',
      adminIds: adminId ? [adminId] : posDetail.adminIds || [],
      cashierIds: cashierId ? [cashierId] : posDetail.cashierIds || [],
      permissionConfig: posDetail.permissionConfig || {},
    });

    if (posDetail.erkhetConfig) {
      financeForm.reset({
        isSyncErkhet: posDetail.erkhetConfig.isSyncErkhet || false,
        checkErkhet: posDetail.erkhetConfig.checkErkhet || false,
        checkInventories: posDetail.erkhetConfig.checkInventories || false,
        userEmail: posDetail.erkhetConfig.userEmail || '',
        beginBillNumber: posDetail.erkhetConfig.beginBillNumber || '',
        defaultPay: posDetail.erkhetConfig.defaultPay || '',
        account: posDetail.erkhetConfig.account || '',
        location: posDetail.erkhetConfig.location || '',
        getRemainder: posDetail.erkhetConfig.getRemainder || false,
      });
    }

    uiConfigForm.reset({
      uiOptions: posDetail.uiOptions || {
        colors: {
          bodyColor: '#FFFFFF',
          headerColor: '#6569DF',
          footerColor: '#3CCC38',
        },
        logo: '',
        bgImage: '',
        favIcon: '',
        receiptIcon: '',
        kioskHeaderImage: '',
        mobileAppImage: '',
        qrCodeImage: '',
      },
      beginNumber: posDetail.beginNumber || '',
      maxSkipNumber: posDetail.maxSkipNumber || 5,
      checkRemainder: posDetail.checkRemainder || false,
    });

    productForm.reset({
      productDetails: posDetail.productDetails || [],
      catProdMappings: posDetail.catProdMappings || [],
      initialCategoryIds: posDetail.initialCategoryIds || [],
      kioskExcludeCategoryIds: posDetail.kioskExcludeCategoryIds || [],
      kioskExcludeProductIds: posDetail.kioskExcludeProductIds || [],
      checkExcludeCategoryIds: posDetail.checkExcludeCategoryIds || [],
    });

    paymentForm.reset({
      paymentIds: posDetail.paymentIds || [],
      paymentTypes: posDetail.paymentTypes || [],
    });

    deliveryConfigForm.reset({
      boardId: posDetail.deliveryConfig?.boardId || '',
      pipeline: posDetail.deliveryConfig?.pipeline || '',
      stage: posDetail.deliveryConfig?.stage || '',
      watchedUsers: posDetail.deliveryConfig?.watchedUsers || '',
      assignedUsers: posDetail.deliveryConfig?.assignedUsers || '',
      deliveryProduct: posDetail.deliveryConfig?.deliveryProduct || '',
      watchedUserIds: posDetail.deliveryConfig?.watchedUserIds || [],
      assignedUserIds: posDetail.deliveryConfig?.assignedUserIds || [],
    });

  }, [posDetail, basicInfoForm, permissionForm, financeForm, uiConfigForm, productForm, paymentForm, deliveryConfigForm]);

  return {
    basicInfoForm,
    permissionForm,
    financeForm,
    uiConfigForm,
    productForm,
    paymentForm,
    deliveryConfigForm,
  };
};