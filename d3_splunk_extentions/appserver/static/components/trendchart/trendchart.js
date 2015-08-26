/**
 * Created by berniem on 8/5/15.
 */
define(function(require, exports, module) {
  var _ = require("underscore");
  var d3 = require("../d3/d3");
  var SimpleSplunkView = require("splunkjs/mvc/simplesplunkview");
  var mvc = require("splunkjs/mvc");
  var css = require("css!./trendchart.css");
  var Trendchart = SimpleSplunkView.extend({
    className: "splunk-trend-chart",
    options: {
      "managerid": null,
      "data": "preview",
      "width": 960,
      "height": null,
      "searchid": null,
      "marker_label": null,
      "marker_value": null,
      "ylabel": null

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
      var formattedData = { data: [], markers: []};
      var parseDate  = d3.time.format.iso.parse;
      var date;
      var markerLabel = this.settings.get('marker_label');
      var markerValue = this.settings.get('marker_value');
      data.map(function(d) {
        date = parseDate(d._time);
        if (d.pct05) {
          formattedData.data.push(
            {
              date: date,
              pct05: d.pct05,
              pct25: d.pct25,
              pct50: d.pct50,
              pct75: d.pct75,
              pct95: d.pct95
            }
          )
        }
        if (d[markerValue]) {
          formattedData.markers.push(
            {
              date: date,
              label: d[markerLabel],
              color: d.color,
              value: d[markerValue] || ''
            }
          )
        }
      });
      return formattedData; // this is passed into updateView as 'data'
    },
    updateView: function(viz, data) {
      this.$el.html("");
      var tokens = mvc.Components.getInstance("default");
      var id = this.id;
      var width = $("#"+id).parent().width();
      var height = Number(this.settings.get('height')) || 400;
      var yLabel = this.settings.get('ylabel');
      var searchid = this.settings.get('searchid');

      function addAxesAndLegend (svg, xAxis, yAxis, margin, chartWidth, chartHeight) {
        var legendWidth  = 200;
        var legendHeight = 100;

        // clipping to make sure nothing appears behind legend
        svg.append('clipPath')
          .attr('id', 'axes-clip')
          .append('polygon')
          .attr('points', (-margin.left)                 + ',' + (-margin.top)                 + ' ' +
          (chartWidth - legendWidth - 1) + ',' + (-margin.top)                 + ' ' +
          (chartWidth - legendWidth - 1) + ',' + legendHeight                  + ' ' +
          (chartWidth + margin.right)    + ',' + legendHeight                  + ' ' +
          (chartWidth + margin.right)    + ',' + (chartHeight + margin.bottom) + ' ' +
          (-margin.left)                 + ',' + (chartHeight + margin.bottom));

        var axes = svg.append('g')
          .attr('clip-path', 'url(#axes-clip)');

        axes.append('g')
          .attr('class', 'x axis')
          .attr('transform', 'translate(0,' + chartHeight + ')')
          .call(xAxis);

        axes.append('g')
          .attr('class', 'y axis')
          .call(yAxis)
          .append('text')
          .attr('transform', 'rotate(-90)')
          .attr('y', 6)
          .attr('dy', '.71em')
          .attr()
          .style('text-anchor', 'end')
          .text(yLabel);

        var legend = svg.append('g')
          .attr('class', 'legend')
          .attr('transform', 'translate(' + (chartWidth - legendWidth) + ', 0)');

        legend.append('rect')
          .attr('class', 'legend-bg')
          .attr('width',  legendWidth)
          .attr('height', legendHeight);

        legend.append('rect')
          .attr('class', 'outer')
          .attr('width',  75)
          .attr('height', 20)
          .attr('x', 10)
          .attr('y', 10);

        legend.append('text')
          .attr('x', 115)
          .attr('y', 25)
          .text('5% - 95%');

        legend.append('rect')
          .attr('class', 'inner')
          .attr('width',  75)
          .attr('height', 20)
          .attr('x', 10)
          .attr('y', 40);

        legend.append('text')
          .attr('x', 115)
          .attr('y', 55)
          .text('25% - 75%');

        legend.append('path')
          .attr('class', 'median-line')
          .attr('d', 'M10,80L85,80');

        legend.append('text')
          .attr('x', 115)
          .attr('y', 85)
          .text('Median');
      }

      function drawPaths (svg, data, x, y) {
        var upperOuterArea = d3.svg.area()
          .interpolate('basis')
          .x (function (d) { return x(d.date) || 1; })
          .y0(function (d) { return y(d.pct95); })
          .y1(function (d) { return y(d.pct75); });

        var upperInnerArea = d3.svg.area()
          .interpolate('basis')
          .x (function (d) { return x(d.date) || 1; })
          .y0(function (d) { return y(d.pct75); })
          .y1(function (d) { return y(d.pct50); });

        var medianLine = d3.svg.line()
          .interpolate('basis')
          .x(function (d) { return x(d.date); })
          .y(function (d) { return y(d.pct50); });

        var lowerInnerArea = d3.svg.area()
          .interpolate('basis')
          .x (function (d) { return x(d.date) || 1; })
          .y0(function (d) { return y(d.pct50); })
          .y1(function (d) { return y(d.pct25); });

        var lowerOuterArea = d3.svg.area()
          .interpolate('basis')
          .x (function (d) { return x(d.date) || 1; })
          .y0(function (d) { return y(d.pct25); })
          .y1(function (d) { return y(d.pct05); });

        svg.datum(data);

        svg.append('path')
          .attr('class', 'area upper outer')
          .attr('d', upperOuterArea)
          .attr('clip-path', 'url(#rect-clip)');

        svg.append('path')
          .attr('class', 'area lower outer')
          .attr('d', lowerOuterArea)
          .attr('clip-path', 'url(#rect-clip)');

        svg.append('path')
          .attr('class', 'area upper inner')
          .attr('d', upperInnerArea)
          .attr('clip-path', 'url(#rect-clip)');

        svg.append('path')
          .attr('class', 'area lower inner')
          .attr('d', lowerInnerArea)
          .attr('clip-path', 'url(#rect-clip)');

        svg.append('path')
          .attr('class', 'median-line')
          .attr('d', medianLine)
          .attr('clip-path', 'url(#rect-clip)');
      }

      function addMarker (marker, svg, chartHeight, x, tip) {
        var radius = (Number(marker.value)* 7)/2;
        var xPos = x(marker.date) - radius - 4;
        var yPosStart = chartHeight - radius - 4;
        var yPosEnd = (marker.color === 'green' ? 80 : 160) + radius - 2;
        var colorClass = marker.color.toLowerCase() || 'green';
        var value = marker.value;
        var label = marker.label;
        var date = marker.date;
        var markerG = svg.append('g')
          .attr('class', 'marker '+colorClass)
          .attr('transform', 'translate(' + xPos + ', ' + yPosStart + ')')
          .attr('opacity', 0);

        markerG.transition()
          .duration(1000)
          .attr('transform', 'translate(' + xPos + ', ' + yPosEnd + ')')
          .attr('opacity', 1);

        markerG.append('path')
          .attr('d', 'M' + radius + ',' + (chartHeight-yPosStart) + 'L' + radius + ',' + (chartHeight-yPosStart))
          .transition()
          .duration(1000)
          .attr('d', 'M' + radius + ',' + (chartHeight-yPosEnd) + 'L' + radius + ',' + (radius*2));

        markerG.append('circle')
          .attr('class', 'marker-bg')
          .on("click", function () {
            tokens.set("marker_date", date);
            tokens.set("marker_label", label);
            tokens.set("marker_value", value);
          })
          .attr('cx', radius)
          .attr('cy', radius)
          .attr('r', radius)
            .on("mouseover", function () {
              tip.transition()
               .duration(500)
               .style("opacity", 0);
              tip.transition()
                .duration(200)
                .style("opacity", .9);
              tip.html(date)
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px")

            });

        markerG.append('text')
          .attr('x', radius)
          .attr('y', radius*0.9)
          .text(label);

        markerG.append('text')
          .attr('x', radius)
          .attr('y', radius*1.5)
          .text(value);
      }

      function startTransitions (svg, chartWidth, chartHeight, rectClip, markers, x) {
        // Define 'div' for tooltips
        var div = d3.select("body")
          .append("div")  // declare the tooltip div
          .attr("class", "tooltip")              // apply the 'tooltip' class
          .style("opacity", 0);                  // set the opacity to nil

        rectClip.transition()
          .duration(1000*markers.length)
          .attr('width', chartWidth);

        markers.forEach(function (marker, i) {
          setTimeout(function () {
            addMarker(marker, svg, chartHeight, x, div);
          }, 1000 + 500*i);
        });
      }

      function makeChart (data, markers, width, height, id) {
        var svgWidth  = width;
        var svgHeight = height;
        var margin = { top: 20, right: 10, bottom: 40, left: 80 };
        var chartWidth  = svgWidth  - margin.left - margin.right;
        var chartHeight = svgHeight - margin.top  - margin.bottom;

        var x = d3.time.scale().range([0, chartWidth])
            .domain(d3.extent(data, function (d) { return d.date; })),
          y = d3.scale.linear().range([chartHeight, 0])
            .domain([0, d3.max(data, function (d) { return d.pct95; })]);

        var xAxis = d3.svg.axis().scale(x).orient('bottom')
            .innerTickSize(-chartHeight).outerTickSize(0).tickPadding(10),
          yAxis = d3.svg.axis().scale(y).orient('left')
            .innerTickSize(-chartWidth).outerTickSize(0).tickPadding(10);

        var svg = d3.select("#"+id).append('svg')
          .attr('width',  svgWidth)
          .attr('height', svgHeight)
          .append('g')
          .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

        // clipping to start chart hidden and slide it in later
        var rectClip = svg.append('clipPath')
          .attr('id', 'rect-clip')
          .append('rect')
          .attr('width', 0)
          .attr('height', chartHeight);

        addAxesAndLegend(svg, xAxis, yAxis, margin, chartWidth, chartHeight);
        drawPaths(svg, data, x, y);
        startTransitions(svg, chartWidth, chartHeight, rectClip, markers, x);
      }
      makeChart(data.data, data.markers, width, height, id);
    }
  });
  return Trendchart;
});