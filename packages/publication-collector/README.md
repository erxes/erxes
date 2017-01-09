# Publication Collector

This is a first pass at a publication testing package

Based on (read: more or less copied exactly from) https://github.com/stubailo/meteor-rest/blob/devel/packages/rest/http-subscription.js

## Usage

```js
const collector = new PublicationCollector({userId});
collector.collect('publicationName', args, for, pub);
collector.on('ready', (collections) => {
  chai.assert.equal(collections.lists.find().count(), 10);
});
```


TODO
 [ ] Is this a good idea? I don't think there's anything else out there that does this
 [ ] Cleanup and lint etc
 [ ] Make usage easier
 [ ] Should it return a promise somehow? Perhaps I should assume Sashko thought about this
 [ ] Generalise enough that it can be used by simple REST
 [ ] Document
 [ ] Write tests