import mongoose, { Schema, mongo } from 'mongoose';
import { isSaas } from '@/integrations/whatsapp/config';

/**
 * On SaaS every workspace shares one Meta app, and Meta keeps one webhook
 * callback per WhatsApp Business Account for that app. A WABA may therefore
 * belong to only one workspace: this cross-workspace record, outside the
 * tenant databases, says which. Self-hosted runs one workspace, so it is not
 * used there.
 */
const OWNERSHIP_DB = 'erxes_frontline_whatsapp';
const OWNERSHIP_MODEL = 'whatsapp_waba_owners';

export const WABA_OWNED_ELSEWHERE_MESSAGE =
  'This WhatsApp Business Account is already connected to another erxes workspace. Remove it there first, or connect a different account.';

interface IWabaOwner {
  _id: string;
  subdomain: string;
}

const wabaOwnerSchema = new Schema<IWabaOwner>(
  {
    _id: { type: String, label: 'WhatsApp Business Account id' },
    subdomain: { type: String, required: true, index: true },
  },
  { timestamps: true, collection: OWNERSHIP_MODEL },
);

const getWabaOwners = () => {
  const connection = mongoose.connection.useDb(OWNERSHIP_DB, {
    useCache: true,
    noListener: true,
  });

  return (
    connection.models[OWNERSHIP_MODEL] ||
    connection.model<IWabaOwner>(OWNERSHIP_MODEL, wabaOwnerSchema)
  );
};

const isDuplicateKeyError = (error: unknown) =>
  error instanceof mongo.MongoServerError && error.code === 11000;

/** The workspace that owns the WABA, or undefined when none does (always on self-hosted). */
export const getWabaOwner = async (
  wabaId: string,
): Promise<string | undefined> => {
  if (!isSaas()) return undefined;

  const owner = await getWabaOwners().findById(wabaId).lean<IWabaOwner>();

  return owner?.subdomain;
};

/** Fails early, before anything is saved, when another workspace owns the WABA. */
export const assertWabaAvailable = async (
  wabaId: string,
  subdomain: string,
): Promise<void> => {
  const owner = await getWabaOwner(wabaId);

  if (owner && owner !== subdomain) {
    throw new Error(WABA_OWNED_ELSEWHERE_MESSAGE);
  }
};

/**
 * Records this workspace as the WABA's owner before its webhook is pointed
 * here. The unique id makes a race between two workspaces leave one owner.
 */
export const claimWaba = async (
  wabaId: string,
  subdomain: string,
): Promise<void> => {
  if (!isSaas()) return;

  try {
    await getWabaOwners().create({ _id: wabaId, subdomain });
  } catch (error) {
    if (!isDuplicateKeyError(error)) throw error;

    await assertWabaAvailable(wabaId, subdomain);
  }
};

/** Frees the WABA once this workspace no longer has a number from it. */
export const releaseWaba = async (
  wabaId: string,
  subdomain: string,
): Promise<void> => {
  if (!isSaas()) return;

  await getWabaOwners().deleteOne({ _id: wabaId, subdomain });
};
