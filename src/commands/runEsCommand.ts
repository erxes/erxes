import { client } from '../elasticsearch';
const argv = process.argv;

/*
 * yarn run runEsCommand deleteByQuery  '{"index":"erxes_office__events","body":{"query":{"match":{"customerId":"CX2BFBGDEHFehNT8y"}}}}'
 */
const main = async () => {
  if (argv.length === 4) {
    const body = argv.pop();
    const action = argv.pop();

    try {
      const response = await client[action](JSON.parse(body || '{}'));
      console.log(response);
    } catch (e) {
      console.log(e);
    }
  }
};

main()
  .then(() => {
    console.log('done ...');
  })
  .catch(e => {
    console.log(e.message);
  });
