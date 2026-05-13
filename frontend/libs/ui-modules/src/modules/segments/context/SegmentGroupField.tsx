import { createContext, useContext } from 'react';
import { IField } from 'ui-modules/modules/properties';
import {
  ConditionFieldKey,
  IFormFieldName,
  IOperator,
  TSegmentCondition,
} from '../types';

interface TSegmentFormGroupFieldContext {
  index: number;
  condition: TSegmentCondition;
  conditionFieldName: IFormFieldName;
  fields: IField[];
  selectedField: IField;
  operators?: IOperator[];
  loading: boolean;
  onBeforeFieldChange: (triggerField: ConditionFieldKey) => void;
  propertyTypes: { value: string; description: string }[];
}

const SegmentFormGroupFieldContext =
  createContext<TSegmentFormGroupFieldContext | null>(null);

export const SegmentGroupFieldProvider = ({
  children,
  index,
  condition,
  conditionFieldName,
  fields,
  selectedField,
  operators,
  loading,
  onBeforeFieldChange,
  propertyTypes,
}: {
  children: React.ReactNode;
  index: number;
  condition: TSegmentCondition;
  conditionFieldName: IFormFieldName;
  fields: IField[];
  selectedField: IField;
  operators?: IOperator[];
  loading: boolean;
  onBeforeFieldChange: (triggerField: ConditionFieldKey) => void;
  propertyTypes: { value: string; description: string }[];
}) => {
  return (
    <SegmentFormGroupFieldContext.Provider
      value={{
        index,
        condition,
        conditionFieldName,
        fields,
        selectedField,
        operators,
        loading,
        propertyTypes,
        onBeforeFieldChange,
      }}
    >
      {children}
    </SegmentFormGroupFieldContext.Provider>
  );
};

export const useSegmentGroupField = () => {
  const ctx = useContext(SegmentFormGroupFieldContext);
  if (!ctx)
    throw new Error('useSegmentGroupField must be used within SegmentProvider');
  return ctx;
};
