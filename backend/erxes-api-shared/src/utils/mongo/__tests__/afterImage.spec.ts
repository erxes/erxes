/**
 * OUTCOME-BASED tests for the in-memory after-image.
 *
 * The oracle is a REAL ephemeral MongoDB (mongodb-memory-server): every assertion
 * compares our computed after-image against the document MongoDB *actually*
 * produced for a real update — never against the implementation. If our model of
 * Mongo/Mongoose semantics is wrong, these fail. Expected values are whatever the
 * database did, so the tests cannot "mirror" the code they verify.
 */
import mongoose, { Schema } from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { applyUpdateOperators, isComplexUpdate } from '../afterImage';
import { getDiffObjects } from '../../utils';

// Canonicalize for order/type-insensitive structural equality.
const norm = (v: any): any => {
  if (v === null || v === undefined) return v;
  if (Array.isArray(v)) return v.map(norm);
  if (v instanceof Date) return { __date: v.getTime() };
  if (typeof v === 'object') {
    if (v._bsontype || v?.constructor?.name === 'ObjectId') return { __oid: String(v) };
    const o: Record<string, any> = {};
    for (const k of Object.keys(v).sort()) o[k] = norm(v[k]);
    return o;
  }
  return v;
};
const J = (x: any) => JSON.stringify(norm(x));

describe('afterImage: in-memory after-image equals REAL MongoDB', () => {
  let server: MongoMemoryServer;
  let Model: mongoose.Model<any>;
  // The CAST update operators, captured exactly as the post-hook reads them.
  let captured: any;

  beforeAll(async () => {
    server = await MongoMemoryServer.create();
    await mongoose.connect(server.getUri());
    const schema = new Schema(
      {
        name: String,
        nick: String,
        age: Number,
        tags: [String],
        address: { city: String, zip: String },
        n: Number,
        when: Date,
        ref: Schema.Types.ObjectId,
      },
      { timestamps: true },
    );
    // Mongoose casts the update in place during exec, so by the POST hook
    // getUpdate() carries schema-typed values — the same source the real capture
    // hook computes its after-image from.
    function capPost(this: any) {
      captured = this.getUpdate();
    }
    schema.post('updateOne', capPost);
    schema.post('findOneAndUpdate', capPost);
    Model = mongoose.model('AfterImageOracle', schema);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await server.stop();
  });

  beforeEach(async () => {
    await Model.deleteMany({});
    captured = undefined;
  });

  const run = async (seed: any, doUpdate: (id: any) => Promise<any>) => {
    const created = await Model.create(seed);
    const before = await Model.findById(created._id).lean();
    await doUpdate(created._id);
    const real = await Model.findById(created._id).lean();
    return { before, real };
  };

  // Simple updates: the after-image MUST equal the document Mongo stored, AND the
  // journaled diff MUST equal what a real post re-read would have produced.
  test.each<[string, any, (id: any) => Promise<any>]>([
    ['$set scalar', { name: 'Old', age: 3 }, (id) => Model.updateOne({ _id: id }, { $set: { name: 'New' } })],
    ['$set nested path', { address: { city: 'NYC', zip: '1' } }, (id) => Model.updateOne({ _id: id }, { $set: { 'address.city': 'LA' } })],
    ['$unset field', { name: 'X', nick: 'Y' }, (id) => Model.updateOne({ _id: id }, { $unset: { nick: 1 } })],
    ['$set + $unset', { name: 'X', nick: 'Y', age: 2 }, (id) => Model.updateOne({ _id: id }, { $set: { age: 9 }, $unset: { nick: 1 } })],
    ['$set whole array', { tags: ['a', 'b'] }, (id) => Model.updateOne({ _id: id }, { $set: { tags: ['a'] } })],
    ['shorthand field', { name: 'Old' }, (id) => Model.updateOne({ _id: id }, { name: 'New2' })],
    ['cast string -> Number', { age: 1 }, (id) => Model.updateOne({ _id: id }, { $set: { age: '42' } })],
    ['cast string -> Date', { when: new Date('2020-01-01') }, (id) => Model.updateOne({ _id: id }, { $set: { when: '2023-05-05' } })],
    ['findOneAndUpdate $set', { name: 'Old' }, (id) => Model.findOneAndUpdate({ _id: id }, { $set: { name: 'FNA' } })],
  ])('%s -> after-image == REAL stored doc', async (_label, seed, doUpdate) => {
    const { before, real } = await run(seed, doUpdate);
    const mine = applyUpdateOperators(before as any, captured, false);
    expect(mine).not.toBeNull();
    expect(J(mine)).toBe(J(real));
    expect(J(getDiffObjects(before as any, mine as any))).toBe(
      J(getDiffObjects(before as any, real as any)),
    );
  });

  // Complex operators depend on server-side prior state — we must NOT guess; the
  // classifier returns null so the caller falls back to a real re-read.
  test.each<[string, any, (id: any) => Promise<any>]>([
    ['$inc', { n: 5 }, (id) => Model.updateOne({ _id: id }, { $inc: { n: 2 } })],
    ['$push', { tags: ['a'] }, (id) => Model.updateOne({ _id: id }, { $push: { tags: 'b' } })],
  ])('%s -> classified complex (null), and it really changed the doc', async (_label, seed, doUpdate) => {
    const { before, real } = await run(seed, doUpdate);
    expect(applyUpdateOperators(before as any, captured, false)).toBeNull();
    expect(J(before)).not.toBe(J(real));
  });

  test('timestamps:true injects $setOnInsert pre-cast, yet the update stays simple', async () => {
    let preCast: any;
    const probe = new Schema({ a: Number }, { timestamps: true });
    probe.pre('updateOne', function (this: any) {
      preCast = this.getUpdate();
    });
    const M = mongoose.model('TsInjectionProbe', probe);
    const d = await M.create({ a: 1 });
    await M.updateOne({ _id: d._id }, { $set: { a: 2 } });
    // Real Mongoose behaviour: $setOnInsert(createdAt) is injected before our hook.
    expect(preCast.$setOnInsert).toBeDefined();
    // ...and our classifier still treats the update as in-memory-replayable.
    expect(isComplexUpdate(preCast, false)).toBe(false);
  });
});
