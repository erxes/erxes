(function () {

/* Imports */
var DDP = Package['ddp-client'].DDP;
var DDPServer = Package['ddp-server'].DDPServer;

/* Package-scope variables */
var LivedataTest;



/* Exports */
if (typeof Package === 'undefined') Package = {};
(function (pkg, symbols) {
  for (var s in symbols)
    (s in pkg) || (pkg[s] = symbols[s]);
})(Package.livedata = {}, {
  DDP: DDP,
  DDPServer: DDPServer,
  LivedataTest: LivedataTest
});

})();
