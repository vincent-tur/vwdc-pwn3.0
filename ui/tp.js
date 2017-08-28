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
            alias: "TargetProcess User Stories",
            columns: cols
        };

        schemaCallback([tableSchema]);
    };

    // Download the data
    myConnector.getData = function(table, doneCallback) {
        $.ajax({
            type: 'GET',
            dataType: 'json',
            url: "http://localhost:4321/get_tp/",
            success: function(resp) {


                var feat = JSON.parse(resp),
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
            tableau.connectionName = "TargetProcess Connector"; // This will be the data source name in Tableau
            tableau.submit(); // This sends the connector object to Tableau
        });
    });
})();
