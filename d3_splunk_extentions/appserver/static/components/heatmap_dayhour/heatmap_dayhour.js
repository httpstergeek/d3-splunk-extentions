/**
 * Created by berniem on 4/5/16.
 */


define(function(require, exports, module) {
  var _ = require("underscore");
  var d3 = require("../d3/d3");
  var colorbrewer = require("../d3/colorbrewer");
  var SimpleSplunkView = require("splunkjs/mvc/simplesplunkview");
  var mvc = require("splunkjs/mvc");
  var css = require("css!./heatmap_dayhour.css");
  var Heatmaphourday = SimpleSplunkView.extend({
    className: "splunk-headmap-day-hour-chart",
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
            time: Number(d[hourField]) + 1,
            day: Number(d[dayField]) + 1,
            value: Number(d[valueField])
          }
        )
      });

      return formattedData;
    },
    updateView: function(viz, data) {
      console.log(colorbrewer);
      this.$el.html("");
      var id = this.id;
      var width = $("#"+id).parent().width();
      var tiplabel = this.settings.get('valueField');
      var gridSize = this.settings.get('gridSize');
      var palette = this.settings.get('colorbrewPalette');
      var paletteNumber = Number(this.settings.get('paletteNumber'));
      var height = Number(this.settings.get('height'));

      var margin = { top: 50, right: 0, bottom: 100, left: 30 },
        width = width - margin.left - margin.right,
        height = height - margin.top - margin.bottom,
        gridSize = Math.floor(width / gridSize),
        legendElementWidth = gridSize*2,
        buckets = paletteNumber,
        colors = colorbrewer[palette][paletteNumber],
        days = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],
        times = ["1a", "2a", "3a", "4a", "5a", "6a", "7a", "8a", "9a", "10a", "11a", "12a", "1p", "2p", "3p", "4p", "5p", "6p", "7p", "8p", "9p", "10p", "11p", "12p"];

      var svg = d3.select("#"+id).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      var dayLabels = svg.selectAll(".dayLabel")
        .data(days)
        .enter().append("text")
        .text(function (d) { return d; })
        .attr("x", 0)
        .attr("y", function (d, i) { return i * gridSize; })
        .style("text-anchor", "end")
        .attr("transform", "translate(-6," + gridSize / 1.5 + ")")
        .attr("class", function (d, i) { return ((i >= 0 && i <= 4) ? "dayLabel mono axis axis-workweek" : "dayLabel mono axis"); });

      var timeLabels = svg.selectAll(".timeLabel")
        .data(times)
        .enter().append("text")
        .text(function(d) { return d; })
        .attr("x", function(d, i) { return i * gridSize; })
        .attr("y", 0)
        .style("text-anchor", "middle")
        .attr("transform", "translate(" + gridSize / 2 + ", -6)")
        .attr("class", function(d, i) { return ((i >= 7 && i <= 16) ? "timeLabel mono axis axis-worktime" : "timeLabel mono axis"); });

      var tip = d3.select("body")
        .append("div")  // declare the tooltip div
        .attr("class", "tooltip")           // apply the 'tooltip' class
        .style("background-color", "white")
        .style("font-weight", "bold")
        .style("vertical-align", "middle")
        .style("text-align", "center")

        .style("opacity", 0);


      var heatmapChart = function(data) {

        var data1 = function(data) {
          return {
            day: +data.day,
            time: +data.time,
            value: +data.value
          };
        }
        console.log(data1(data));
        var colorScale = d3.scale.quantile()
          .domain([0, buckets - 1, d3.max(data, function (d) { return d.value; })])
          .range(colors);

        var cards = svg.selectAll(".hour")
          .data(data, function(d) {return d.day+':'+d.time;});
        console.log(colorScale.invertExtent());
        cards.append("title");
        cards.enter().append("rect")
          .attr("x", function(d) {return (d.time - 1) * gridSize; })
          .attr("y", function(d) { return (d.day - 1) * gridSize; })
          .attr("rx", 4)
          .attr("ry", 4)
          .attr("class", "hour bordered")
          .attr("width", gridSize)
          .attr("height", gridSize)
          .style("fill", colors[0])
          .on("mouseover", function (d) {
            tip.transition()
              .duration(500)
              .style("opacity", 0);
            tip.transition()
              .duration(200)
              .style("opacity", .9);
            tip.html("<div>"+tiplabel+"</div>"+"<div>"+d.value+"</div>")
              .style("left", (d3.event.pageX) + "px")
              .style("top", (d3.event.pageY - 28) + "px")
            // .enter().append("div")
          });

        cards.transition().duration(1000)
          .style("fill", function(d) { return colorScale(d.value); });

        cards.select("title").text(function(d) { return d.value; });

        cards.exit().remove();

        var legend = svg.selectAll(".legend")
          .data([0].concat(colorScale.quantiles()), function(d) { return d; });

        legend.enter().append("g")
          .attr("class", "legend");

        legend.append("rect")
          .attr("x", function(d, i) { return legendElementWidth * i; })
          .attr("y", height)
          .attr("width", legendElementWidth)
          .attr("height", gridSize / 2)
          .style("fill", function(d, i) { return colors[i]; });

        legend.append("text")
          .attr("class", "mono")
          .text(function(d) { return "≥ " + Math.round(d); })
          .attr("x", function(d, i) { return legendElementWidth * i; })
          .attr("y", height + gridSize);

        legend.exit().remove();

      };

      heatmapChart(data);

    }
  });
  return Heatmaphourday;
});
