The Trend Chart visualization allows you to quickly plot percentile band
overlayed with event markers using a subsearch. This example shows you how to
integrate a D3 trend chart into your simple xml dashboard.

How to integrate this custom visualization into your deployment and/or
app:

+ Load the following `autodiscover.js` into your app's appserver/static
  directory
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
+ required field names pct05 and pct95 for upper band, pct25 and pct75 for mid band, pct50 as median for line.
+ Configurable data-options:
    - `marker_label` is the splunk field which contains the marker label/ Title. 
    - `marker_value` is the Splunk field which contains numeric value. This value determines marker size.
    - `ylabel` controls the Y axis label.
    - `height` controls the panel height.
+ Tokens on onclick event for markers `marker_date`, `marker_label`, and `marker_value`. Can be use to power other panel or search.
    
Example Searches using subsearch:

+ The main search fetches stats for response\_time by day with a subsearch to find changes affecting those servers.  The result is the data is joined on day as an overlay.
    - index=access host=webservers uri\_root="/home" | bucket \_time span=1d | stats  perc05(response\_time) as pct05 , perc25(response\_time) as pct25, perc50(response\_time) as pct50 ,perc75(response\_time) as pct75, perc95(esponse\_time) as pct95 by \_time | append \[search index=changes category=prod systems=webservers| bucket \_time span=1d | stats  count as value by \_time \] 


    
Note: Panel width is auto scaled by from width of parent panel and will resize when dragged to new row

For additional information on using the splunksearchmanager, please
refer to the Splunk Web Framework Reference Manual
