(function () {

/* Imports */
var Tracker = Package.tracker.Tracker;
var Deps = Package.tracker.Deps;



/* Exports */
if (typeof Package === 'undefined') Package = {};
(function (pkg, symbols) {
  for (var s in symbols)
    (s in pkg) || (pkg[s] = symbols[s]);
})(Package.deps = {}, {
  Tracker: Tracker,
  Deps: Deps
});

})();
