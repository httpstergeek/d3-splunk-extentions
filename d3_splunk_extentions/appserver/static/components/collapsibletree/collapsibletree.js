/**
 * Created by berniem on 8/21/15.
 */

define(function(require, exports, module) {
  var _ = require("underscore");
  var d3 = require("../d3/d3");
  var SimpleSplunkView = require("splunkjs/mvc/simplesplunkview");
  var mvc = require("splunkjs/mvc");
  var css = require("css!./collapsibletree.css");
  var Waterfall = SimpleSplunkView.extend({
    className: "splunk-collapsibletree-chart",
    options: {
      "managerid": null,
      "data": "results",
      "width": 960,
      "height": null,
      "yvalpre": "",
    },

    output_mode: "json",

    initialize: function() {
      SimpleSplunkView.prototype.initialize.apply(this, arguments);

      // Set up resize callback.
      $(window).resize(_.debounce(_.bind(this._handleResize, this), 20));
    },

    _handleResize: function() {
      this.render();
    },

    createView: function() {
      return true;
    },

    // Making the data look how we want it to for updateView to do its job
    formatData: function(data) {
      var formattedData = [];
      var label = this.settings.get('label');
      var value = this.settings.get('value');
      var yvalpre = this.settings.get('yvalpre');
      return formattedData; // this is passed into updateView as 'data'
    },
    updateView: function(viz, data) {
      this.$el.html("");
      var id = this.id;
      var width = $("#"+id).parent().width();
      var height = Number(this.settings.get('height')) || 400;
      var yLabel = this.settings.get('ylabel');
      var yvalpre = this.settings.get('yvalpre');

    }
  });
  return Waterfall;
});
