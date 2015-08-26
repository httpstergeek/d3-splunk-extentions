The radar/ spider chart visualization allows you to quickly graph values as relationships. This chart requires the user of xyseries command

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
    - `ylabel` controls the Y axis label.
    - `height` controls  svg height.
    - `label`  the Splunk field for the columns.  Typically the field broken using the _by_ statment
    - `value` the Splunk field use for compute totals.  This can by the count or summation field.
    - `levels` draws marker lines in chart.
    - `axis` Splunk field used for axis
    
Example Searches :

+ The following is an example of show relationship of changes by depart and event\_name (change type). The axis is departments.
    - index=\* "change-type"=application| stats count by department event\_name |  addcoltotals labelfield=total count | xyseries department event_name count 


    
Note: Panel width is auto scaled by from width of parent panel and will resize when dragged to new row.  More configuration options in future relase

For additional information on using the splunksearchmanager, please
refer to the Splunk Web Framework Reference Manual