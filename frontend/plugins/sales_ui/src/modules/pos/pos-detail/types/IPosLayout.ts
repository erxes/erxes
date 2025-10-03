import { UseFormReturn } from 'react-hook-form';
import {
  BasicInfoFormValues,
  PermissionFormValues,
} from '@/pos/create-pos/components/formSchema';

export type StepConfig = {
  value: string;
  title: string;
};

export type StepType = StepConfig & {
  id: number;
  totalSteps?: number;
};

export interface StepperItemProps {
  step: StepType;
  currentStep: number;
  isClickable: boolean;
}

export interface VerticalStepperProps {
  steps: StepType[];
  currentStepId: number;
  hasCategorySelected: boolean;
  searchParams: URLSearchParams;
  setSearchParams: (params: URLSearchParams) => void;
}

export interface ValidationAlertProps {
  message: string;
}

export interface NavigationFooterProps {
  prevStep: string | null;
  nextStep: string | null;
  handlePrevStep: () => void;
  handleNextStep: () => void;
  isLastStep: boolean;
  isLoading?: boolean;
  validationError?: string | null;
  isSubmitting?: boolean;
}

export interface PosTabContentProps {
  children: React.ReactNode;
  value: string;
}

export interface PosCreateStepperProps {
  children: React.ReactNode;
}

export interface PosLayoutProps {
  children: React.ReactNode;
  actions?: React.ReactNode;
  form?: UseFormReturn<BasicInfoFormValues, PermissionFormValues>;
  onFormSubmit?: (data: BasicInfoFormValues) => void;
  onFinalSubmit?: () => void;
  isSubmitting?: boolean;
  loading: boolean;
  error: any;
  onSaveSlots?: () => Promise<void>;
  posDetail?: any;
}
