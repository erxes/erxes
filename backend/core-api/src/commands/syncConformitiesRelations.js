const dotenv = require('dotenv');
const { MongoClient } = require('mongodb');
const { nanoid } = require('nanoid');

dotenv.config();

const { MONGO_URL = 'mongodb://127.0.0.1:27017/erxes?directConnection=true' } = process.env;

const client = new MongoClient(MONGO_URL);
let db;
let Conformities;
let Relations;

const confTypeRelType = {
  'customer': 'core:customer',
  'company': 'core:company',
  'deal': 'sales:deal',
}
const relTypeConfType = {
  'core:customer': 'customer',
  'core:company': 'company',
  'sales:deal': 'deal',
}

const command = async () => {
  await client.connect();
  console.log(Boolean(client))
  db = client.db();
  console.log(Boolean(db))

  Conformities = db.collection('conformities');
  Relations = db.collection('relations');
  await Relations.createIndex({ _conformityId: 1 });

  const now = new Date();
  console.log(`Process start at: ${new Date()}`);

  const conformityFilter = {
    _synced: { $ne: true },
    $or: [
      { mainType: 'deal', relType: 'customer' },
      { mainType: 'deal', relType: 'company' },
      { mainType: 'customer', relType: 'deal' },
      { mainType: 'company', relType: 'deal' },
    ]
  }

  // сүүлийн синкээс хойш шинээр нэмэгдсэн Conformities ийг relations болгох
  const newConformities = await Conformities.find({ ...conformityFilter }).toArray();
  const bulkOps = newConformities.map(conformity => ({
    updateOne: {
      filter: {
        _conformityId: conformity._id
      },
      update: {
        $set: {
          entities: [
            {
              contentType: confTypeRelType[conformity.mainType],
              contentId: conformity.mainTypeId
            },
            {
              contentType: confTypeRelType[conformity.relType],
              contentId: conformity.relTypeId
            }
          ],
          _conformityId: conformity._id,
        },
        $setOnInsert: {
          createdAt: now,
          updatedAt: now,
        }
      },
      upsert: true
    },
  }));
  if (bulkOps.length) {
    await Relations.bulkWrite(bulkOps);
    await Conformities.updateMany({ _id: { $in: newConformities.map(c => c._id) } }, { $set: { _synced: true } })
  }
  console.log(`${newConformities.length} insert relations, cause created conformities`)

  // сүүлийн синкээс хойш синк хийгдсэн датанаас Relations талаас устгагдсануудыг Conformities талд дагуулж устгах
  const onlyConformities = await Conformities.aggregate([
    { $match: { _synced: true } },
    {
      $lookup: {
        from: 'relations',
        localField: '_id',
        foreignField: '_conformityId',
        as: 'rels'
      }
    },
    { $match: { rels: { $size: 0 } } },

    { $project: { _id: 1 } }
  ]).toArray();

  if (onlyConformities.length) {
    await Conformities.deleteMany({
      _id: { $in: onlyConformities.map(d => d._id) }
    });
  }
  console.log(`${onlyConformities.length} delete conformies, cause deleted relations`)

  // сүүлийн синкээс хойш шинээр нэмэгдсэн Relations ийг Conformities рүү нөхөж хийх
  const newRelations = await Relations.find({ _conformityId: { $exists: false } }).toArray();
  const bulkInsConf = [];
  const bulkUpdRel = [];
  for (const relation of newRelations) {
    const _conformityId = nanoid();

    bulkInsConf.push({
      _id: _conformityId,
      mainType: relTypeConfType[relation.entities[0].contentType],
      mainTypeId: relation.entities[0].contentId,
      relType: relTypeConfType[relation.entities[1].contentType],
      relTypeId: relation.entities[1].contentId,
      _synced: true,
    });

    bulkUpdRel.push({
      updateOne: {
        filter: { _id: relation._id },
        update: { $set: { _conformityId, }, }
      },
    })
  };
  if (newRelations.length) {
    await Conformities.insertMany(bulkInsConf);
    await Relations.bulkWrite(bulkUpdRel)
  }
  console.log(`${newRelations.length} insert conformities, cause created relations`)

  // сүүлийн синкээс хойш синк хийгдсэн датанаас Conformies талаас устгасанг Relations талд дагуулж устгах
  const onlyRelations = await Relations.aggregate([
    { $match: { _conformityId: { $exists: true, $ne: '' } } },
    {
      $lookup: {
        from: 'conformities',
        localField: '_conformityId',
        foreignField: '_id',
        as: 'rels'
      },
    },
    { $match: { rels: { $size: 0 } } },
    { $project: { _conformityId: 1 } }
  ]).toArray();

  if (onlyRelations.length) {
    await Relations.deleteMany({
      _conformityId: { $in: onlyRelations.map(d => d._conformityId) }
    });
  }
  console.log(`${onlyRelations.length} delete relations, cause deleted confomities`)

  console.log(`Process finished at: ${now}`);

  process.exit();
};

command();
