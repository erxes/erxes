import type { ChangeEvent, RefObject } from 'react';

export interface DirectMailInsertToolsState {
  fileInput: RefObject<HTMLInputElement>;
  attachmentInput: RefObject<HTMLInputElement>;
  uploadAttachment: (event: ChangeEvent<HTMLInputElement>) => Promise<void>;
  uploadImage: (event: ChangeEvent<HTMLInputElement>) => Promise<void>;
}
