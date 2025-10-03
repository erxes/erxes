import { z } from 'zod';

export const STRUCTURE_DETAILS_SCHEMA = z.object({
  _id: z.string().optional(),
  title: z.string(),
  description: z.string(),
  code: z.string(),
  // coordinate: z
  //   .object({
  //     latitude: z.string(),
  //     longitude: z.string(),
  //   })
  //   .optional(),
  email: z.string().email(),
  image: z
    .object({
      name: z.string(),
      url: z.string().url(),
      type: z.string(),
    })
    .optional()
    .nullable(),
  phoneNumber: z.string().optional(),
  supervisorId: z.string(),
});
