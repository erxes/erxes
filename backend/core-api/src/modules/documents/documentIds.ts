import { Types } from 'mongoose';

export const documentIdCandidates = (id: string): (string | Types.ObjectId)[] =>
  /^[0-9a-f]{24}$/i.test(id) ? [id, new Types.ObjectId(id)] : [id];
