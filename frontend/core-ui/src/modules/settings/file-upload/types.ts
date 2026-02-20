import { z } from "zod";

import { FILES_VALIDATION_SCHEMA } from "@/settings/file-upload/schema";

type UploadConfigFormT = z.infer<typeof FILES_VALIDATION_SCHEMA>;
type DynamicFieldsT = Omit<UploadConfigFormT, 'UPLOAD_FILE_TYPES' | 'WIDGETS_UPLOAD_FILE_TYPES' | 'FILE_SYSTEM_PUBLIC'>

type serviceTypeT = {
  name: string,
  fields?: {
    label: string;
    name: string;
    type: string;
  },
  form?: any;
}

interface fileMimeTypes {
  value: string;
  label: string;
  extension: string;
}

interface TConfig {
  _id: string,
  code: keyof UploadConfigFormT;
  value: any;
}

export {
  DynamicFieldsT,
  fileMimeTypes,
  serviceTypeT,
  UploadConfigFormT,
  TConfig
}
