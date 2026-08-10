import { IMessageDocument } from '@/inbox/@types/conversationMessages';
import { IContext } from '~/connectionResolvers';

export default {
  user(message: IMessageDocument) {
    return message.userId && { __typename: 'User', _id: message.userId };
  },

  customer(message: IMessageDocument) {
    return (
      message.customerId && { __typename: 'Customer', _id: message.customerId }
    );
  },

  /**
   * Delivery state for messages sent through WhatsApp.
   *
   * Meta reports sent/delivered/read/failed on a `statuses` webhook, and the
   * WhatsApp module already records it against the message — but nothing ever
   * read it back, so a message Meta REFUSED looked exactly like a delivered
   * one in the inbox. An agent had no way to know a reply never arrived.
   *
   * Joined on erxesApiMessageId, the WhatsApp row's own pointer back to this
   * message. NOT on `mid`: ConversationMessage exposes a mid field in the
   * schema, but nothing ever writes it — it is dead, and a resolver built on
   * it would silently return null for every message.
   *
   * Resolved rather than copied onto the inbox row because the value changes
   * several times per message (sent -> delivered -> read); a stored copy would
   * be a second thing to keep in sync.
   *
   * Null for every other channel — they do not report delivery this way, and
   * inventing a status for them would be worse than saying nothing.
   */
  async whatsappDelivery(message: IMessageDocument, _args, { models }: IContext) {
    const sent = await models.WhatsappConversationMessages.findOne(
      { erxesApiMessageId: message._id },
      { deliveryStatus: 1, errorMessage: 1 },
    ).lean();

    if (!sent?.deliveryStatus) return null;

    return {
      status: sent.deliveryStatus,
      // Meta's own reason, surfaced only when it actually failed. This is the
      // difference between "it did not send" and "it did not send BECAUSE the
      // number is not on WhatsApp".
      error: sent.errorMessage || null,
    };
  },

  /**
   * The message this one is a WhatsApp swipe-reply (or quoted send) to, when
   * it is one.
   *
   * Two joins deep: first this message's own WhatsApp row, to read the
   * `replyToMid` it was stored with (Meta's wamid of whatever it quotes);
   * then a SECOND row matched on `mid: replyToMid`, because that is the only
   * thing both directions of a quote agree on — an inbound reply can quote
   * either an inbound or an outbound message, and wamid is the one identifier
   * both share. `_id` is deliberately not part of the first query's filter:
   * this message may be an inbound OR outbound one and either can carry a
   * `replyToMid`, unlike `whatsappDelivery` above which only ever applies to
   * something we sent.
   *
   * Returns null rather than throwing when the quoted message cannot be
   * found locally — Meta's `context.id` can name a message from before this
   * integration existed, or one a redelivery raced away — and a broken quote
   * link is worth losing quietly rather than failing the whole message.
   */
  async whatsappReplyTo(
    message: IMessageDocument,
    _args,
    { models }: IContext,
  ) {
    const own = await models.WhatsappConversationMessages.findOne(
      { erxesApiMessageId: message._id },
      { replyToMid: 1 },
    ).lean();

    if (!own?.replyToMid) return null;

    const quoted = await models.WhatsappConversationMessages.findOne(
      { mid: own.replyToMid },
      { erxesApiMessageId: 1, content: 1 },
    ).lean();

    if (!quoted?.erxesApiMessageId) return null;

    return {
      _id: quoted.erxesApiMessageId,
      content: quoted.content || null,
    };
  },

  /**
   * This message's OWN wamid, so the composer can quote it as a reply target.
   *
   * The unrelated `mid` field on the schema is dead — nothing writes it onto
   * the inbox row, only onto the WhatsApp module's own row — so this resolves
   * it the same way `whatsappDelivery` does, via `erxesApiMessageId`. Applies
   * to either direction: an agent can reply to a customer's inbound message
   * just as validly as to another agent's outbound one.
   *
   * Null for every non-WhatsApp message, which is also what makes this safe
   * to use as the switch for "can this message be replied to at all" on the
   * frontend — a message with no wamid has nothing Meta would accept as a
   * `context.message_id`.
   */
  async whatsappMid(message: IMessageDocument, _args, { models }: IContext) {
    const own = await models.WhatsappConversationMessages.findOne(
      { erxesApiMessageId: message._id },
      { mid: 1 },
    ).lean();

    return own?.mid || null;
  },
};
