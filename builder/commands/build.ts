import build from '../src/build';

const main = async () => {
  if (process.argv.length <= 2) {
    throw new Error(
      'Please pass the one of the following values gateway,core,plugin !!!'
    );
  }


  const type = process.argv[2];
  let folderName = type;

  if (type === 'plugin') {
    if (process.argv.length <= 3) {
      throw new Error('Please pass plugin name !!!');
    }

    folderName = `plugin-${process.argv[3]}-api`;
  }

  await build(folderName);  
};

main()
  .then(() => process.exit(0))
  .catch(e => {
    console.log(e);
    process.exit(1);
  });
