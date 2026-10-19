cat << 'EOF' > downgradeScriptSale.js
// MONGO_URL='mongodb://mongo:27017' node downgradeScriptSale.js
// Stop application writes and back up erxes before running.
const { MongoClient } = require('mongodb');
const { isDeepStrictEqual } = require('node:util');

async function main() {
  if (!process.env.MONGO_URL) throw new Error('MONGO_URL is required.');
  const client = new MongoClient(process.env.MONGO_URL);

  try {
    await client.connect();
    const v3 = client.db('erxesv3');
    const v2 = client.db('erxes');
    const deals = await v3.collection('deals').find({
      createdAt: {
        $gte: new Date('2026-10-11T00:20:13.218Z'),
        $lte: new Date('2026-10-16T00:00:00+08:00'),
      },
    }).sort({ createdAt: 1, _id: 1 }).toArray();
    const newDealIds = new Set(deals.map((deal) => deal._id));
    const relationTypes = {
      'sales:deal': ['deal', 'deals'],
      'core:customer': ['customer', 'customers'],
      'core:company': ['company', 'companies'],
      'core:product': ['product', 'products'],
      'frontline:ticket': ['ticket', 'tickets'],
    };

    for (const deal of deals) {
      try {
        if (typeof deal._id !== 'string' || !deal._id) throw new Error('Invalid deal _id.');
        if (deal.propertiesData && Object.keys(deal.propertiesData).length) {
          process.stdout.write(`WARN deal=${deal._id}: unexpected propertiesData copied unchanged.\n`);
        }
        if (!deal.stageId || !await v2.collection('sales_stages').findOne({ _id: deal.stageId })) {
          process.stdout.write(`WARN deal=${deal._id}: V2 stage ${deal.stageId} not found; stageId retained.\n`);
        }
        if (deal.number !== undefined && deal.number !== null) {
          const duplicate = await v2.collection('deals').findOne({ number: deal.number, _id: { $ne: deal._id } });
          if (duplicate) throw new Error(`Deal ${deal._id}: number ${deal.number} belongs to ${duplicate._id}.`);
        }
        if (deal.parentId && !newDealIds.has(deal.parentId)
          && !await v2.collection('deals').findOne({ _id: deal.parentId })) {
          process.stdout.write(`WARN deal=${deal._id}: parent ${deal.parentId} not found; parentId retained.\n`);
        }
        const productsData = [];
        for (const [index, product] of (deal.productsData || []).entries()) {
          try {
            if (!product?.productId || !await v2.collection('products').findOne({ _id: product.productId })) {
              throw new Error(`V2 product ${product?.productId} not found.`);
            }
            productsData.push(product);
          } catch (error) {
            process.stdout.write(`SKIP deal=${deal._id} productRow=${index} product=${product?.productId}: ${error.message}\n`);
          }
        }
        const userIds = new Set([deal.userId, deal.modifiedBy, ...(deal.assignedUserIds || []), ...(deal.watchedUserIds || [])]);
        for (const userId of userIds) {
          if (userId && !await v2.collection('users').findOne({ _id: userId })) {
            process.stdout.write(`WARN deal=${deal._id}: V2 user ${userId} not found; user reference retained.\n`);
          }
        }

        const relations = await v3.collection('relations').find({
          entities: { $elemMatch: { contentType: 'sales:deal', contentId: deal._id } },
        }).toArray();
        const conformities = [];
        const skippedLinks = new Set();
        for (const relation of relations) {
          try {
            if (!Array.isArray(relation.entities) || relation.entities.length !== 2) {
              throw new Error(`Deal ${deal._id}: relation ${relation._id} must have two entities.`);
            }
            const dealSide = relation.entities.findIndex((entity) => entity.contentType === 'sales:deal' && entity.contentId === deal._id);
            if (dealSide === -1) throw new Error(`Relation ${relation._id} does not reference deal ${deal._id}.`);
            const related = relation.entities[1 - dealSide];
            const relatedType = relationTypes[related.contentType];
            if (!relatedType || typeof related.contentId !== 'string' || !related.contentId) {
              throw new Error(`Deal ${deal._id}: unsupported relation ${related.contentType}/${related.contentId}.`);
            }
            const [relType, collection] = relatedType;
            if (!(relType === 'deal' && newDealIds.has(related.contentId))
              && !await v2.collection(collection).findOne({ _id: related.contentId })) {
              skippedLinks.add(`${relType}/${related.contentId}`);
              throw new Error(`Deal ${deal._id}: V2 ${collection}/${related.contentId} not found.`);
            }
            conformities.push({
              _id: String(relation._conformityId || relation._id),
              mainType: 'deal', mainTypeId: deal._id,
              relType, relTypeId: related.contentId,
            });
          } catch (error) {
            process.stdout.write(`SKIP deal=${deal._id} relation=${relation._id}: ${error.message}\n`);
          }
        }

        const oldConformities = await v2.collection('conformities').find({ $or: [
          { mainType: 'deal', mainTypeId: deal._id },
          { relType: 'deal', relTypeId: deal._id },
        ] }).toArray();
        for (const old of oldConformities) {
          const relatedKey = old.mainType === 'deal' && old.mainTypeId === deal._id
            ? `${old.relType}/${old.relTypeId}` : `${old.mainType}/${old.mainTypeId}`;
          if (skippedLinks.has(relatedKey)) continue;
          const sameLink = conformities.some((link) =>
            (old.mainType === 'deal' && old.mainTypeId === deal._id && old.relType === link.relType && old.relTypeId === link.relTypeId)
            || (old.relType === 'deal' && old.relTypeId === deal._id && old.mainType === link.relType && old.mainTypeId === link.relTypeId),
          );
          if (!sameLink) process.stdout.write(`WARN deal=${deal._id}: unexpected V2 conformity ${old._id} retained.\n`);
        }

        // Preserve customFieldsData and the embedded Gantt relations unchanged.
        const { _id, ...dealFields } = deal;
        // Skip missing product rows; preserve the original totals/payments.
        if (deal.productsData !== undefined) dealFields.productsData = productsData;
        const dates = [deal.createdAt, deal.updatedAt, deal.modifiedAt].filter((date) => date instanceof Date);
        dealFields.modifiedAt = new Date(Math.max(...dates.map((date) => date.getTime())));
        await v2.collection('deals').updateOne({ _id }, { $set: dealFields }, { upsert: true });
        const savedDeal = await v2.collection('deals').findOne({ _id });
        for (const [field, value] of Object.entries(dealFields)) {
          if (!savedDeal || !isDeepStrictEqual(savedDeal[field], value)) {
            throw new Error(`Deal ${_id}: read-back mismatch in ${field}.`);
          }
        }

        for (const conformity of conformities) {
          try {
            const filter = { $or: [
              { mainType: 'deal', mainTypeId: _id, relType: conformity.relType, relTypeId: conformity.relTypeId },
              { mainType: conformity.relType, mainTypeId: conformity.relTypeId, relType: 'deal', relTypeId: _id },
            ] };
            await v2.collection('conformities').updateOne(filter, { $setOnInsert: conformity }, { upsert: true });
            if (!await v2.collection('conformities').findOne(filter)) {
              throw new Error(`Deal ${_id}: conformity read-back failed for ${conformity.relType}/${conformity.relTypeId}.`);
            }
          } catch (error) {
            process.stdout.write(`SKIP deal=${deal._id} conformity=${conformity._id}: ${error.message}\n`);
            process.exitCode = 1;
          }
        }
      } catch (error) {
        process.stdout.write(`ERROR deal=${deal._id}: ${error.message}\n`);
        process.exitCode = 1;
      }
    }
  } finally {
    await client.close();
  }
}

module.exports = { main };
if (require.main === module) {
  main().catch((error) => {
    process.stderr.write(`${error.message}\nEarlier writes may have committed; fix the cause and rerun.\n`);
    process.exitCode = 1;
  });
}
EOF
