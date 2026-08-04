import { IPosUserDocument } from '~/modules/posclient/@types/posUsers';

export function assertPosUser(
  posUser: IPosUserDocument | undefined,
): asserts posUser is IPosUserDocument {
  if (!posUser) {
    throw new Error('Login required');
  }
}
