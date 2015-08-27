The Showreel visualization allows you to quickly plot pie, line, stackcharts to show different views of the same data. 
This example shows you how to integrate a D3 trend chart into your simple xml dashboard.

How to integrate this custom visualization into your deployment and/or
app:

+ Load the following `autodiscover.js` into your app's appserver/static directory
+ Load all required source files for the d3 bubble chart. You can find these in
  `$SPLUNK_HOME$/etc/apps/d3_splunk_extentions/appserver/static/components/trendchart/`
+ Add an html element to your simple xml dashboard
+ Use similar `<div />` tags to instantiate your custom viz, as well as the
  search to drive it
+ Note that you must bind the custom viz to the search manager, denoted by
  `"managerid"`
    -   The "managerid" is bound to the "id" of the searchmanager in the
        following example
- Also make sure to reference the correct path to your custom viz source
    files (`data-require`)
+ Configurable data-options:
    - `duration` How long show showreel will run.
    - `delay` pause between transitions. 
    - `value` values to be plotted.
    - `label` labels for line charts.
    - `height` height of chart
