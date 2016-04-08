/**
 * Created by berniem on 4/6/16.
 */

define(function(require, exports, module) {
  var _ = require("underscore");
  var d3 = require("../d3/d3");
  var colorbrewer = require("../d3/colorbrewer");
  var SimpleSplunkView = require("splunkjs/mvc/simplesplunkview");
  var mvc = require("splunkjs/mvc");
  var css = require("css!./mapcolorbrewer.css");
  var Mapcolorbrewer = SimpleSplunkView.extend({
    className: "splunk-map-color-brew",
    options: {
      "managerid": null,
      "data": "preview",
      "gridSize": 24,
      "height": 450,
      "hourField": "time",
      "dayField": "day",
      "valueField": "value",
      "colorbrewPalette": "Paired",
      "paletteNumber": 12
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
      var hourField = this.settings.get('hourField');
      var dayField = this.settings.get('dayField');
      var valueField = this.settings.get('valueField');
      data.map(function(d) {
        formattedData.push(
          {
            time: Number(d[hourField]) ,
            day: Number(d[dayField]),
            value: Number(d[valueField])
          }
        )
      });

      return formattedData;
    },
    updateView: function(viz, data) {
      _
      this.$el.html("");
      var id = this.id;
      d3.select("#"+id)
        .selectAll(".palette")
        .data(d3.entries(colorbrewer))
        .enter().append("span")
        .attr("class", "palette")
        .attr("title", function(d) { return d.key; })
        .text(function(d) {
          var x = colorbrewer[d.key];
          var b = _.map(x, function(num){return num.length});
          var max = Math.max.apply(Math, b);
          var min = Math.min.apply(Math, b);
          return d.key+": "+ min + "-"+ max; })
        .on("click", function(d) { console.log(d3.values(d.value).map(JSON.stringify).join("\n")); })
        .selectAll(".swatch")
        .data(function(d) { return d.value[d3.keys(d.value).map(Number).sort(d3.descending)[0]]; })
        .enter().append("span")
        .attr("class", "swatch")
        .style("margin", "0 auto")
        .style("background-color", function(d) { return d; });

    }
  });
  return Mapcolorbrewer;
});
