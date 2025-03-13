import { Schema, Document } from 'mongoose';

export type IOrignalCallCdr = {
  conversationId: string;
  AcctId: string;
  src: string;
  dst: string;
  dcontext: string;
  clid: string;
  channel: string;
  dstchannel: string;
  lastapp: string;
  lastdata: string;
  start: string;
  answer: string;
  end: string;
  duration: string;
  billsec: string;
  disposition: string;
  amaflags: string;
  uniqueid: string;
  userfield: string;
  channel_ext: string;
  dstchannel_ext: string;
  service: string;
  caller_name: string;
  recordfiles: string;
  dstanswer: string;
  session: string;
  action_owner: string;
  action_type: string;
  src_trunk_name: string;
  dst_trunk_name: string;
  nat_call: string;
  nat_call_peer: string;
  video_call: string;
  gdms_unique_code: string;
  gds_call: string;
  gsc_call: string;
  wave_src_seqid: string;
  wave_dst_seqid: string;
  device_info: string;
  device_info_peer: string;
  recordfiles_desc: string;
  anonymous_call: string;
  reason: string;
  wave_src_hide: string;
  wave_dst_hide: string;
  new_src: string;
  sn: string;
};
export interface ICallCdr {
  inboxIntegrationId: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
  conversationId: string;
  acctId: string;
  src: string;
  dst: string;
  dcontext: string;
  clid: string;
  channel: string;
  lastapp: string;
  lastdata: string;
  start: Date;
  answer: Date;
  end: Date;
  duration: number;
  billsec: number;
  disposition: string;
  amaflags: string;
  uniqueid: string;
  userfield: string;
  channelExt: string;
  dstchannelExt: string;
  service: string;
  callerName: string;
  dstanswer: string;
  session: string;
  actionOwner: string;
  actionType: string;
  srcTrunkName: string;
  dstTrunkName: string;
  natCall: string;
  natCallPeer: string;
  videoCall: string;
  gdmsUniqueCode: string;
  gdsCall: string;
  gscCall: string;
  waveSrcSeqid: string;
  waveDstSeqid: string;
  deviceInfo: string;
  deviceInfoPeer: string;
  recordfilesDesc: string;
  recordfiles: string;
  anonymousCall: string;
  reason: string;
  waveSrcHide: string;
  waveDstHide: string;
  newSrc: string;
  sn: string;
  recordUrl: string;
  oldRecordUrl: string;
}

export interface ICallCdrDocument extends ICallCdr, Document {}

export const CDRSchema = new Schema({
  inboxIntegrationId: { type: String },
  conversationId: { type: String },
  createdAt: { type: Date },
  updatedAt: { type: Date },
  createdBy: { type: String },
  updatedBy: { type: String },
  acctId: { type: String, unique: true },
  src: { type: String },
  dst: { type: String },
  dcontext: { type: String },
  clid: { type: String },
  channel: { type: String },
  lastapp: { type: String },
  lastdata: { type: String },
  start: { type: Date },
  answer: { type: Date },
  end: { type: Date },
  duration: { type: Number },
  billsec: { type: Number },
  disposition: { type: String },
  amaflags: { type: String },
  uniqueid: { type: String },
  userfield: { type: String },
  channelExt: { type: String },
  dstchannelExt: { type: String },
  service: { type: String },
  callerName: { type: String },
  dstanswer: { type: String },
  session: { type: String },
  actionOwner: { type: String },
  actionType: { type: String },
  srcTrunkName: { type: String },
  dstTrunkName: { type: String },
  natCall: { type: String },
  natCallPeer: { type: String },
  videoCall: { type: String },
  gdmsUniqueCode: { type: String },
  gdsCall: { type: String },
  gscCall: { type: String },
  waveSrcSeqid: { type: String },
  waveDstSeqid: { type: String },
  deviceInfo: { type: String },
  deviceInfoPeer: { type: String },
  recordfilesDesc: { type: String },
  recordfiles: { type: String },
  anonymousCall: { type: String },
  reason: { type: String },
  waveSrcHide: { type: String },
  waveDstHide: { type: String },
  newSrc: { type: String },
  sn: { type: String },
  recordUrl: { type: String },
  oldRecordUrl: { type: String },
});

CDRSchema.index({ acctId: 1 }, { unique: true });
