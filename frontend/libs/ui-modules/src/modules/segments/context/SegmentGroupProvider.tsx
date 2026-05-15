import { createContext, useContext } from 'react';
import {
  FieldArrayWithId,
  UseFieldArrayAppend,
  UseFieldArrayRemove,
} from 'react-hook-form';
import { TConditionFieldPath, TSegmentForm } from '../types';

type TSegmentConditionFieldName =
  | 'conditions'
  | `conditionSegments.${number}.conditions`;

type TSegmentConditionField = FieldArrayWithId<
  TSegmentForm,
  TSegmentConditionFieldName,
  'id'
>[];
type TSegmentConditionFieldAppend = UseFieldArrayAppend<
  TSegmentForm,
  TSegmentConditionFieldName
>;
interface TSegmentFormGroupContext {
  fieldPath: TConditionFieldPath;
  conditionFields: TSegmentConditionField;
  appendField: TSegmentConditionFieldAppend;
  removeField: UseFieldArrayRemove;
  totalFields: number;
  withoutAssociationTypes?: boolean;
}

const SegmentFormGroupContext = createContext<TSegmentFormGroupContext | null>(
  null,
);

export const SegmentGroupProvider = ({
  children,
  fieldPath,
  conditionFields,
  append,
  remove,
  withoutAssociationTypes,
}: {
  children: React.ReactNode;
  fieldPath: TConditionFieldPath;
  conditionFields: TSegmentConditionField;
  append: TSegmentConditionFieldAppend;
  remove: UseFieldArrayRemove;
  withoutAssociationTypes?: boolean;
}) => {
  return (
    <SegmentFormGroupContext.Provider
      value={{
        fieldPath,
        conditionFields,
        appendField: append,
        removeField: remove,
        totalFields: conditionFields.length,
        withoutAssociationTypes,
      }}
    >
      {children}
    </SegmentFormGroupContext.Provider>
  );
};

export const useSegmentGroup = () => {
  const ctx = useContext(SegmentFormGroupContext);
  if (!ctx)
    throw new Error('useSegmentGroup must be used within SegmentProvider');
  return ctx;
};
