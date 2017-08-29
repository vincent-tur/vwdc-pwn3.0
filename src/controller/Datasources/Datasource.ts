import {request} from "http";

export class Datasource {
    dataObj: any;
    dataUrlParams: { [paramName: string]: string };
    dataUrlBase: string;

    iterableDataSources: Array<Datasource>;
    constructor(datasourceFullUrl = '') {
        this.dataObj = {};
        this.dataUrlBase = datasourceFullUrl;
        this.dataUrlParams = {};
        this.iterableDataSources = [];
    }

    setIterables(iterableDatasources: Array<Datasource>){
        this.iterableDataSources = iterableDatasources;
    }

    getURL(): any {
        return this.dataUrlBase;
    };

    getDataObj(format: string = "json") {
        console.log("Getting data object...");
        var rtnObj: Array<{}> = [];
        var that = this;
        Object.keys(this.dataObj).forEach(function (key) {
            rtnObj = rtnObj.concat(that.dataObj[key]);
        });

        if(format == "string"){
            return JSON.stringify(rtnObj);
        }else if(format == "json"){
            return rtnObj;
        }else{
            console.log("<Invalid format type specified in Datasource.getDataObj>");
        }

    }

    public getData(urlObj: any = null, dataObjIndex: any = 0): Promise<any> {

        if(this.iterableDataSources.length > 0){
            return this.iterableGetData();
        }

        var that = this;
        return new Promise(function (fulfill, reject) {
            var request = require('request');
            if(urlObj == null){
                urlObj = that.getURL();
            }

            request(urlObj, function (error: any, response: any, body: any) {
                that.dataObj[dataObjIndex] = JSON.parse(body);
                that.formatDataObj();
                if (that.dataObj == {}) {
                    reject("Received no data. URL attempt: " + JSON.stringify(urlObj))
                } else {
                    fulfill({
                        data: that.dataObj,
                        url: JSON.stringify(urlObj)
                    });
                }

                // console.log('error:', error); // Print the error if one occurred
                // console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
                // console.log('body:', body); // Print the HTML for the Google homepage.
            });
        });
    }

    iterableGetData(){
        var that = this;
        return Promise.all(that.iterableDataSources.map(function (datasourceObj){
            return datasourceObj.getData();
        })).then(values => {
            // var extracted = that.extractGeneral(values);
            // that.dataObj[dataObjKey] = extracted;

            that.dataObj.push(values);
        }, reason => {
            console.log('Failure [TargetProc Tasks GET]: ' + reason);
        });
    }




    collapseDataObj(){
        var rtnObj: any = [];
        var that = this;
        Object.keys(this.dataObj).forEach(function (key) {
            rtnObj = rtnObj.concat(that.dataObj[key]);
        });
        that.dataObj = rtnObj;
        return;
    }

    formatDataObj() {

    }
}