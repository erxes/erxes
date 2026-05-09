import { ILayoutsDocument } from '@/layouts/@types/layouts';

export const Layouts = {
  async config(layout: ILayoutsDocument) {
    return layout.config ?? {};
  },
};
