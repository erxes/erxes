# Stub Collections

Stub out Meteor collections with in-memory local collections.

The idea here is to allow the use of things like Factories for unit tests and styleguides without having to restrict ourselves to making components "pure".

So a component (ie. a template) can still call `Apps.findOne(appId)`, it's just that we will have stubbed out `Apps` to point to a local collection that we can completely control in our test.

## Usage

`StubCollections.add(<collections>)` - register the default list of collections to stub.  Make sure to keep collections in sync when we add / remove them.

`StubCollections.stub(<collections>)` - stub a list of collections

`StubCollections.stub()` - stub all collections that have been previously enabled for stubbing

`StubCollections.restore()` - undo stubbing (call at the end of tests / on routing away)
