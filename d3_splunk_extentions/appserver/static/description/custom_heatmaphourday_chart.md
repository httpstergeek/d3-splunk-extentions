The Heatmap hour day chart visualization allows you to graph values hour over day to find peak times. In the Example data your can see peak times are 3p to 9p Thursday thru Friday.

How to integrate this custom visualization into your deployment and/or
app:

+ Load the following `autodiscover.js` into your app's appserver/static
  directory
+ Load all required source files for the d3 bubble chart. You can find these in
  `$SPLUNK_HOME$/etc/apps/d3_splunk_extentions/appserver/static/components/heatmap_dayhour/`
+ Add an html element to your simple xml dashboard
+ Use similar `<div />` tags to instantiate your custom viz, as well as the
  search to drive it
+ Note that you must bind the custom viz to the search manager, denoted by
  `"managerid"`
    -   The "managerid" is bound to the "id" of the searchmanager in the
        following example
- Also make sure to reference the correct path to your custom viz source
    files (`data-require`)
+ Data is expected to be in a three field/ columns hour, day, and value. Value can be a count, sum, etc but must be numeric
+ Configurable data-options:
    - `managerid` Search Manager ID.
    - `hourField` field containing hour values
    - `dayField` field containing day values
    - `valueField` field containing day values
    - `gridSize` controls square sizes for heat map.
    - `height` controls  svg height.
    - `colorbrewPalette` colorpalette from Colorbrew.  Example YlGn or Accent
    - `paletteNumber` colorpalette Number. This can be any value of colorbrewPalette listed next to option.

Example Searches :

+ The following is an example of using Service Now data.
    - eventtype=snow\_incident earliest=-30d@d
     <br />       | dedup sys\_id sys\_created_on
     <br />       | timechart span=1h count as value
     <br />       | eval time=tonumber(strftime(\_time,"%H"))
     <br />       | eval day=tonumber(strftime(\_time,"%w"))
     <br />       | fields - \_time | stats sum(value) as value by time day


    
Note: Panel width is auto scaled by from width of parent panel and will resize when dragged to new row.  More configuration options in future relase

For additional information on using the splunksearchmanager, please
refer to the Splunk Web Framework Reference Manual