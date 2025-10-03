import { z } from 'zod';
import { STRUCTURE_DETAILS_SCHEMA } from '../schemas/structureSchema';

export interface IStructureDetails {
  _id: string;
  title: string;
  description: string;
  code: string;
  coordinate: {
    latitude: string;
    longitude: string;
  };
  email: string;
  image: {
    name: string;
    url: string;
    type: string;
  };
  phoneNumber: string;
  supervisor: {
    email: string;
    details: {
      firstName: string;
      lastName: string;
      fullName: string;
      operatorPhone: string;
      position: string;
      shortName: string;
      avatar: string;
      description: string;
    };
  };
  supervisorId: string;
}

export type StructureDetailsFormT = z.infer<typeof STRUCTURE_DETAILS_SCHEMA>;
