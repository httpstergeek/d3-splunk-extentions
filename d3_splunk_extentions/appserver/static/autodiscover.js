// Barrowed from simple_xml_examples app published by splunk

require.config({
    paths: {
        "app": "../app"
    }
});

require(['splunkjs/mvc/d3_splunk_extentions/ready!'], function(){
    require(['splunkjs/ready!'], function(){
        // The splunkjs/ready loader script will automatically instantiate all elements
        // declared in the dashboard's HTML.
    });
});
