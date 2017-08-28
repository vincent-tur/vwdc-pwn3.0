

export class Datasource {
    dataObj: any;
    dataUrlParams: {[paramName: string] : string};
    dataUrlBase: string;


    constructor(datasourceFullUrl = ''){
        this.dataObj = {};
        this.dataUrlBase = datasourceFullUrl;
        this.dataUrlParams = {};
    }

    getURL(): any{
        return this.dataUrlBase;
    };

    getDataObj(){
        console.log("Getting data object...");
        var rtnObj: Array<{}> = [];
        var that = this;
        Object.keys(this.dataObj).forEach(function (key){
            rtnObj = rtnObj.concat(that.dataObj[key]);
        });
        return JSON.stringify(rtnObj);
    }

    getData() {
        var that = this;

        return new Promise(function (fulfill, reject){
            var request = require('request');
            var url = that.getURL();
            request(url, function (error: any, response: any, body: any) {
                that.dataObj[0] = JSON.parse(body);
                that.formatDataObj();
                if(that.dataObj == {}){
                    reject("Received no data. URL attempt: " + url)
                }else{
                    fulfill({
                        data: that.dataObj,
                        url: url
                    });
                }

                // console.log('error:', error); // Print the error if one occurred
                // console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
                // console.log('body:', body); // Print the HTML for the Google homepage.
            });
        });
    }
    getDataNEW(start: number, iterateBy: number, end: number, curPage: any) {
        var that = this;

        return new Promise(function (fulfill, reject){
            const { URL, URLSearchParams } = require('url');
            var request = require('request');
            var urlStr = that.getURL();
            console.log(urlStr.url);
            var newUrlObj = URL.parse(urlStr.url);
            var newSearchObj = new URLSearchParams(newUrlObj.search);

            newUrlObj.searchParams.append(curPage.urlParamName, curPage.value);
            var newUrlStr = newUrlObj.href;

            var loopCounter = 0;
            for(var i: number = start; i < end; i+=iterateBy){
                request(newUrlStr, function (error: any, response: any, body: any) {
                    that.dataObj[loopCounter] = JSON.parse(body);
                    that.formatDataObj();
                    if(that.dataObj == {}){
                        reject("Received no data. URL attempt: " + newUrlStr)
                    }else{
                        fulfill({
                            data: that.dataObj,
                            url: newUrlStr
                        });
                    }

                    // console.log('error:', error); // Print the error if one occurred
                    // console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
                    // console.log('body:', body); // Print the HTML for the Google homepage.
                loopCounter++;
                });
            }

        });
    }

    formatDataObj(){

    }
}