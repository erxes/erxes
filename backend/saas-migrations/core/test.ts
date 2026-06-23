const {
  MONGO_URL = 'mongodb://localhost:27017/erxes?directConnection=true',
  CORE_MONGO_URL,

  SOURCE_SUBDOMAIN,
  TARGET_SUBDOMAIN,

  DRY_RUN,

  BATCH_SIZE = '1000',
} = process.env;

console.log('MONGO_URL:', MONGO_URL);
console.log('CORE_MONGO_URL:', CORE_MONGO_URL);
console.log('SOURCE_SUBDOMAIN:', SOURCE_SUBDOMAIN);
console.log('TARGET_SUBDOMAIN:', TARGET_SUBDOMAIN);
console.log('DRY_RUN:', DRY_RUN);
console.log('BATCH_SIZE:', BATCH_SIZE);
