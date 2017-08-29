import {request} from "http";

export class Datasource {
    dataObj: any;
    dataUrlParams: { [paramName: string]: string };
    dataUrlBase: string;


    constructor(datasourceFullUrl = '') {
        this.dataObj = {};
        this.dataUrlBase = datasourceFullUrl;
        this.dataUrlParams = {};
    }

    getURL(): any {
        return this.dataUrlBase;
    };

    getDataObj() {
        console.log("Getting data object...");
        var rtnObj: Array<{}> = [];
        var that = this;
        Object.keys(this.dataObj).forEach(function (key) {
            rtnObj = rtnObj.concat(that.dataObj[key]);
        });

        return JSON.stringify(rtnObj);
    }

    getData(urlObj: any = null, dataObjIndex: any = 0) {
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

    getDataNewer(urlObj: any = null, dataObjIndex: any = 0) {
        var that = this;
        var customUrlObj: boolean = (urlObj == null);
        return new Promise(function (fulfill, reject) {
            var request = require('request');
            if(customUrlObj == null){
                urlObj = that.getURL();
            }

            request(urlObj, function (error: any, response: any, body: any) {
                that.dataObj[dataObjIndex] = JSON.parse(body);

                if (that.dataObj == {}) {
                    reject("Received no data. URL attempt: " + JSON.stringify(urlObj))
                } else {
                    if(customUrlObj == null){
                        that.formatDataObj();
                    }
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

    getDataNEW(start: number, iterateBy: number, end: number, curPage: any) {
        var that = this;

        return new Promise(function (fulfill, reject) {

            var urlObj = that.getURL();

            var loopCounter = start;
            var linkAry = [];

            for (var i: number = start; i < end; i += iterateBy, loopCounter++) {
                var tempUrlObj = Object.assign({}, urlObj);
                tempUrlObj.url = urlObj.url + "&" + curPage.param + "=" + loopCounter;
                linkAry.push(tempUrlObj);
            }

            Promise.all(linkAry.map(function (curUrlObj, index){
                return that.getDataNewer(curUrlObj, index);
            })).then(function (){
                that.formatDataObj();

                return fulfill({
                    data: that.getDataObj(),
                    url: JSON.stringify(urlObj)
                });
            });
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