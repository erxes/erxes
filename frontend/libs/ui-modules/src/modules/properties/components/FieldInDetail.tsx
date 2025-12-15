import { IField } from '../types/fieldsTypes';

export const FieldInDetail = ({ field }: { field: IField }) => {
  return <div>{field.name}</div>;
};
