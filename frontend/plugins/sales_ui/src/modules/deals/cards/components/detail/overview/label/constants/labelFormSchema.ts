import { z } from "zod";

export const labelFormSchema = z.object({
  name: z.string().default(""),
  colorCode: z.string().default("#000000"),
});

export type LabelFormType = z.infer<typeof labelFormSchema>;
