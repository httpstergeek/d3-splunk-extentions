define(function(require, exports, module) {
  var _ = require("underscore");
  var d3 = require("../d3/d3");
  var SimpleSplunkView = require("splunkjs/mvc/simplesplunkview");
  require("css!./showreel.css");
  var Showreel = SimpleSplunkView.extend({
    className: "splunk-showreel-chart",
    options: {
      "managerid": null,
      "data": "results"
    },
    output_mode: "json",
    initialize: function() {
      SimpleSplunkView.prototype.initialize.apply(this, arguments);
    },
    createView: function() {
      return true;
    },
    // Making the data look how we want it to for updateView to do its job
    formatData: function(data) {
      var formattedData;
      return formattedData; // this is passed into updateView as 'data'
    },
    updateView: function(viz, data) {
    }
  });
  return Showreel;
});