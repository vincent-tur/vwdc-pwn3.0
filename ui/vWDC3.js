(function() {
    // Create the connector object
    var myConnector = tableau.makeConnector();

    // Define the schema
    myConnector.getSchema = function(schemaCallback) {
        var cols = [{
            id: "id",
            dataType: tableau.dataTypeEnum.string
        }, {
            id: "focus",
            alias: "Focus level",
            dataType: tableau.dataTypeEnum.string
        }, {
            id: "topic_hardness",
            alias: "Topic hardness",
            dataType: tableau.dataTypeEnum.string
        }, {
            id: "study_importance",
            alias: "Study importance",
            dataType: tableau.dataTypeEnum.string
        }, {
            id: "first_encounter",
            alias: "First encounter",
            dataType: tableau.dataTypeEnum.string
        }];

        var tableSchema = {
            id: "targetProcessData",
            alias: "TargetProcess Tasks",
            columns: cols
        };

        schemaCallback([tableSchema]);
    };

    // Download the data
    myConnector.getData = function(table, doneCallback) {
        $.ajax({
            type: 'GET',
            dataType: 'jsonp',
            url: "https://v.tpondemand.com/api/v2/Tasks/?access_token=MTpPcWtkaEVpaVZJQjhraXREUVc1UWRyRHdYWS9KOGdnUWFBT1pjSzJJd29FPQ==&select={id,focus:CustomValues.Get(%22Focus%20level%22).value,topic_hardness:CustomValues.Get(%22Topic%20hardness%22).value,study_importance:CustomValues.get(%22Importance%20to%20study%22).value,first_encounter:CustomValues[%22First%20encounter%22]}&take=5000",
            success: function(resp) {
                var feat = resp.items,
                    tableData = [];

                // Iterate over the JSON object
                for (var i = 0, len = feat.length; i < len; i++) {
                    tableData.push({
                        "id": feat[i].id,
                        "focus": feat[i].focus,
                        "topic_hardness": feat[i].topic_hardness,
                        "study_importance": feat[i].study_importance,
                        "first_encounter": feat[i].first_encounter
                    });
                }

                table.appendRows(tableData);
                doneCallback();
            }})};


    tableau.registerConnector(myConnector);

    // Create event listeners for when the user submits the form
    $(document).ready(function() {
        $("#submitButton").click(function() {
            tableau.connectionName = "TargetProcess Tasks Connector"; // This will be the data source name in Tableau
            tableau.submit(); // This sends the connector object to Tableau
        });
    });
})();
