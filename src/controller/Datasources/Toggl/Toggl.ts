
import {Datasource} from "../Datasource";

export default class Toggl extends Datasource{

    dataObj: any;
    dataUrlParams: {[paramName: string] : string};
    dataUrlBase: string;


    constructor(){
        super();

        this.dataUrlBase = 'https://toggl.com/reports/api/v2/details';
        this.dataUrlParams['email'] = 'fa_vince@hotmail.com';
        this.dataUrlParams['workspace'] = '2204314';

        //Date is in this format: 2017-07-25
        this.dataUrlParams['startt'] = '2017-08-01';
        this.dataUrlParams['endt'] = '2017-08-29';
        this.dataUrlParams['token'] = 'd323f7bda7be76cc85b7836db3eaafab';
    }

    getURL(): {}{
        let urlObj = {
                        url: this.dataUrlBase + "?user_agent="+this.dataUrlParams['email']+"&workspace_id="+this.dataUrlParams['workspace']+"&since="+this.dataUrlParams['startt']+"&until="+this.dataUrlParams['endt'],
                        headers: {
                            'Authorization': 'Basic ' + new Buffer(this.dataUrlParams['token'] + ':api_token').toString('base64')
                        }
                     };
        return urlObj;
    }



    getData(){

        var url = this.dataUrlBase + "?user_agent="+this.dataUrlParams['email']+"&workspace_id="+this.dataUrlParams['workspace']+"&since="+this.dataUrlParams['startt']+"&until="+this.dataUrlParams['endt'];

            var that = this;

        return new Promise(function (fulfill, reject){

            var request = require('request');
            var url = that.getURL();
            request(url, function (error: any, response: any, body: any) {
                var responseObj = JSON.parse(body);
                var totalEntries = responseObj["total_count"];
                var pages = String(Math.ceil(totalEntries/50));
                that.getDataHelper(1,50, totalEntries, {param: 'page', value: pages}).then(function (response){
                   return fulfill(response);
                });
                // console.log('error:', error); // Print the error if one occurred
                // console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
                // console.log('body:', body); // Print the HTML for the Google homepage.
            });
        });
    }
    formatDataObj() {
        var that = this;
        Object.keys(this.dataObj).forEach(function (key){
            that.dataObj[key] = that.dataObj[key].data;
        });
        console.log('right here');
    }


    getDataHelper(start: number, iterateBy: number, end: number, curPage: any) {
        var that = this;

        return new Promise(function (fulfill, reject) {

            var urlObj: any = that.getURL();

            var loopCounter = start;
            var linkAry = [];

            for (var i: number = start; i < end; i += iterateBy, loopCounter++) {
                var tempUrlObj: any = Object.assign({}, urlObj);
                tempUrlObj.url = urlObj.url + "&" + curPage.param + "=" + loopCounter;
                linkAry.push(tempUrlObj);
            }

            Promise.all(linkAry.map(function (curUrlObj, index){
                return that.getDataNewer(curUrlObj, index);
            })).then(function (){
                that.formatDataObj();

                // return fulfill({
                //     data: that.getDataObj(),
                //     url: JSON.stringify(urlObj)
                // });
                return fulfill(that.getDataObj());
            });
        });
    }

    getDataNewer(urlObj: any = null, dataObjIndex: any = 0) {
        //CAN'T USE SUPER INSIDE PROMISE ASYNC CALL!!!! MUST HAVE THIS FUNCTION.
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

}