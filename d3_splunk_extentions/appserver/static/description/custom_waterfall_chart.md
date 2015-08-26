The Waterfall Chart visualization allows you to quickly graph values summations which contain negative and positive value . This example shows you how to integrate a D3 waterfal into your simple xml dashboard.  This could be use for sales vs returns.

How to integrate this custom visualization into your deployment and/or
app:

+ Load the following `autodiscover.js` into your app's appserver/static
  directory
+ Load all required source files for the d3 bubble chart. You can find these in
  `$SPLUNK_HOME$/etc/apps/d3_splunk_extentions/appserver/static/components/waterfall/`
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
    - `legendTitle` Statement above legend.
    - `opacityArea` Opacity of drawn area.
    - `height` controls  svg height.
    - `width` controls svg width
    - `label`  the Splunk field for the columns.  Typically the field broken using the _by_ statment
    - `value` the Splunk field use for compute totals.  This can by the count or summation field.
    
Example Searches :

+ The following is a contrived example.
    - index=\_internal earliest=-1d | top component | eval count=if(component=="ExecProcessor", count\*-6.3, count) | eval count=if(component=="IndexProcessor", count\*-42.3, count) 


    
Note: This visualization does not auto scale.  Possiblity in later version.
For additional information on using the splunksearchmanager, please
refer to the Splunk Web Framework Reference Manual
