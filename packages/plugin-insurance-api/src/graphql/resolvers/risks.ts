import { IRiskDocument } from '../../models/definitions/risks';

const Risk = {
  async lastModifiedBy(risk: IRiskDocument, _params) {
    return (
      risk.lastModifiedBy && {
        __typename: 'User',
        _id: risk.lastModifiedBy
      }
    );
  }
};

export { Risk };
