export abstract class Datasource {
    abstract dataObj: {};
    abstract dataUrlParams: {[paramName: string] : string};
    abstract dataUrlBase: string;


    constructor(dataUrlBase: string = ''){
        this.dataObj = {};
        this.dataUrlBase = dataUrlBase;
        this.dataUrlParams = {}
    }

    abstract getURL(): {};

    getData(): Promise<any> {
        var that = this;

        return new Promise(function (fulfill, reject){
            var request = require('request');
            var url = that.getURL();
            request(url, function (error: any, response: any, body: any) {
                that.dataObj = JSON.parse(body);

                if(that.dataObj == {}){
                    reject("Received no data. URL attempt: " + url)
                }else{
                    fulfill();
                }

                // console.log('error:', error); // Print the error if one occurred
                // console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
                // console.log('body:', body); // Print the HTML for the Google homepage.
            });
        });
    }
}