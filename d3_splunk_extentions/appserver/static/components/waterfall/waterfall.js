/**
 * Created by berniem on 8/21/15.
 */

define(function(require, exports, module) {
  var _ = require("underscore");
  var d3 = require("../d3/d3");
  var SimpleSplunkView = require("splunkjs/mvc/simplesplunkview");
  var mvc = require("splunkjs/mvc");
  var css = require("css!./waterfall.css");
  var Waterfall = SimpleSplunkView.extend({
    className: "splunk-waterfall-chart",
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
      data.map(function(d) {
        formattedData.push(
          {
            name: d[label],
            value: Number(d[value])
          }
        )
      });
      return formattedData; // this is passed into updateView as 'data'
    },
    updateView: function(viz, data) {
      this.$el.html("");
      var id = this.id;
      var width = $("#"+id).parent().width();
      var height = Number(this.settings.get('height')) || 400;
      var yLabel = this.settings.get('ylabel');
      var yvalpre = this.settings.get('yvalpre');

      var margin = {top: 20, right: 30, bottom: 30, left: 40},
        width = width - margin.left - margin.right,
        height = height - margin.top - margin.bottom,
        padding = 0.3;

      var x = d3.scale.ordinal()
        .rangeRoundBands([0, width], padding);

      var y = d3.scale.linear()
        .range([height, 0]);

      var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

      var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .tickFormat(function(d) { return labelFormatter(d); });

      var chart = d3.select("#"+id).append('svg')
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .style("display", "block")
        .style("margin", "auto")
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");



      // Transform data (i.e., finding cumulative values and total) for easier charting
      var cumulative = 0;
      for (var i = 0; i < data.length; i++) {
        data[i].start = cumulative;
        cumulative += data[i].value;
        data[i].end = cumulative;

        data[i].class = ( data[i].value >= 0 ) ? 'positive' : 'negative'
      }
      data.push({
        name: 'Total',
        end: cumulative,
        start: 0,
        class: 'total'
      });

      x.domain(data.map(function(d) { return d.name; }));
      y.domain([0, d3.max(data, function(d) { return d.end; })]);

      chart.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

      chart.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', 6)
        .attr('dy', '.71em')
        .style('text-anchor', 'end')
        .text(yLabel);

      var bar = chart.selectAll(".bar")
        .data(data)
        .enter().append("g")
        .attr("class", function(d) { return "bar " + d.class })
        .attr("transform", function(d) { return "translate(" + x(d.name) + ",0)"; });

      bar.append("rect")
        .attr("y", function(d) { return y( Math.max(d.start, d.end) ); })
        .attr("height", function(d) { return Math.abs( y(d.start) - y(d.end) ); })
        .attr("width", x.rangeBand());

      bar.append("text")
        .attr("x", x.rangeBand() / 2)
        .attr("y", function(d) { return y(d.end) + 5; })
        .attr("dy", function(d) { return ((d.class=='negative') ? '-' : '') + ".75em" })
        .attr("class", "barlabel")
        .text(function(d) { return labelFormatter(d.end - d.start);});

      bar.filter(function(d) { return d.class != "total" }).append("line")
        .attr("class", "connector")
        .attr("x1", x.rangeBand() + 5 )
        .attr("y1", function(d) { return y(d.end) } )
        .attr("x2", x.rangeBand() / ( 1 - padding) - 5 )
        .attr("y2", function(d) { return y(d.end) } )

      function labelFormatter(n) {
        n = Math.round(n);
        var result = n;
        if (Math.abs(n) > 1000) {
          result = Math.round(n/1000) + 'K';
        }
        return yvalpre + result;
      }
    }
  });
  return Waterfall;
});