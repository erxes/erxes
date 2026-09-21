import { useForm } from 'react-hook-form';
import { IStructureDetails, StructureDetailsFormT } from '../types/structure';
import { zodResolver } from '@hookform/resolvers/zod';
import { STRUCTURE_DETAILS_SCHEMA } from '../schemas/structureSchema';

export const useStructureDetailsForm = (
  structureDetail?: IStructureDetails | null,
) => {
  const methods = useForm<StructureDetailsFormT>({
    mode: 'onBlur',
    values: {
      title: structureDetail?.title ?? '',
      description: structureDetail?.description ?? '',
      code: structureDetail?.code ?? '',
      email: structureDetail?.email ?? '',
      phoneNumber: structureDetail?.phoneNumber ?? '',
      supervisorId: structureDetail?.supervisorId ?? '',
    },
    resolver: zodResolver(STRUCTURE_DETAILS_SCHEMA),
  });
  return {
    methods,
  };
};
