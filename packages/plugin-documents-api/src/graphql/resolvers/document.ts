import { IDocumentDocument } from '../../models/Documents';

export default {
  async tags(document: IDocumentDocument) {
    return (document.tagIds || []).map(_id => ({
      __typename: 'Tag',
      _id
    }));
  }
};
