import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import {
  BasicInfoFormValues,
  basicInfoSchema,
  DeliveryConfigFormValues,
  deliveryConfigSchema,
  FinanceConfigFormValues,
  financeConfigSchema,
  FormStepData,
  PaymentFormValues,
  paymentSchema,
  PermissionFormValues,
  permissionSchema,
  ProductFormValues,
  productSchema,
  UiConfigFormValues,
  uiConfigSchema,
  KitchenScreenConfigFormValues,
  kitchenScreenConfigSchema,
  WaitingScreenConfigFormValues,
  waitingScreenConfigSchema,
} from '../components/formSchema';

const getDefaultFormStepData = (): FormStepData => ({
  basicInfo: {
    name: '',
    description: '',
    allowTypes: [],
    scopeBrandIds: [],
    branchId: '',
    departmentId: '',
  },
  permission: {
    adminTeamMember: '',
    adminPrintTempBill: false,
    adminDirectSales: false,
    adminDirectDiscountLimit: '',
    cashierTeamMember: '',
    cashierPrintTempBill: false,
    cashierDirectSales: false,
    cashierDirectDiscountLimit: '',
    adminIds: [],
    cashierIds: [],
    permissionConfig: {},
  },
  product: {
    productDetails: [],
    catProdMappings: [],
    initialCategoryIds: [],
    kioskExcludeCategoryIds: [],
    kioskExcludeProductIds: [],
    checkExcludeCategoryIds: [],
  },
  payment: {
    paymentIds: [],
    paymentTypes: [],
  },
  uiConfig: {
    uiOptions: {
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
    beginNumber: '',
    maxSkipNumber: 5,
    checkRemainder: false,
  },
  financeConfig: {
    isSyncErkhet: false,
    checkErkhet: false,
    checkInventories: false,
    userEmail: '',
    beginBillNumber: '',
    defaultPay: '',
    account: '',
    location: '',
    getRemainder: false,
  },
  deliveryConfig: {
    boardId: '',
    pipeline: '',
    stage: '',
    watchedUsers: '',
    assignedUsers: '',
    deliveryProduct: '',
    watchedUserIds: [],
    assignedUserIds: [],
  },
  waitingScreen: {
    isActive: true,
    type: '',
    contentUrl: '',
    value: 0,
  },
  kitchenScreen: {
    isActive: true,
    isPrint: true,
    type: '',
    showType: '',
    value: 0,
  },
});

export const usePosCreateForm = () => {
  const [formStepData, setFormStepData] = useState<FormStepData>(
    getDefaultFormStepData(),
  );

  const basicInfoForm = useForm<BasicInfoFormValues>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: formStepData.basicInfo,
  });

  const permissionForm = useForm<PermissionFormValues>({
    resolver: zodResolver(permissionSchema),
    defaultValues: formStepData.permission,
  });

  const productForm = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: formStepData.product,
  });

  const paymentForm = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: formStepData.payment,
  });

  const uiConfigForm = useForm<UiConfigFormValues>({
    resolver: zodResolver(uiConfigSchema),
    defaultValues: formStepData.uiConfig,
  });

  const financeConfigForm = useForm<FinanceConfigFormValues>({
    resolver: zodResolver(financeConfigSchema),
    defaultValues: formStepData.financeConfig,
  });

  const deliveryConfigForm = useForm<DeliveryConfigFormValues>({
    resolver: zodResolver(deliveryConfigSchema),
    defaultValues: formStepData.deliveryConfig,
  });

  const kitchenScreenForm = useForm<KitchenScreenConfigFormValues>({
    resolver: zodResolver(kitchenScreenConfigSchema),
    defaultValues: formStepData.kitchenScreen,
  });

  const waitingScreenForm = useForm<WaitingScreenConfigFormValues>({
    resolver: zodResolver(waitingScreenConfigSchema),
    defaultValues: formStepData.waitingScreen,
  });

  const forms = {
    basicInfo: basicInfoForm,
    permission: permissionForm,
    product: productForm,
    payment: paymentForm,
    uiConfig: uiConfigForm,
    deliveryConfig: deliveryConfigForm,
    financeConfig: financeConfigForm,
    kitchenScreen: kitchenScreenForm,
    waitingScreen: waitingScreenForm,
  };

  const updateFormStepData = (step: keyof FormStepData, data: any) => {
    setFormStepData((prev) => ({
      ...prev,
      [step]: data,
    }));
  };

  const getAllFormValues = (): FormStepData => {
    return {
      basicInfo: basicInfoForm.getValues(),
      permission: permissionForm.getValues(),
      product: productForm.getValues(),
      payment: paymentForm.getValues(),
      uiConfig: uiConfigForm.getValues(),
      deliveryConfig: deliveryConfigForm.getValues(),
      financeConfig: financeConfigForm.getValues(),
      kitchenScreen: kitchenScreenForm.getValues(),
      waitingScreen: waitingScreenForm.getValues(),
    };
  };

  return {
    forms,
    formStepData,
    setFormStepData,
    updateFormStepData,
    getAllFormValues,
  };
};
