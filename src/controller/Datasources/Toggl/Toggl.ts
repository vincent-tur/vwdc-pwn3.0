
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
                that.getDataNEW(0,50, totalEntries, {param: 'page', value: pages}).then(function (response){
                   return fulfill(response);
                });
                // console.log('error:', error); // Print the error if one occurred
                // console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
                // console.log('body:', body); // Print the HTML for the Google homepage.
            });
        });
        //
        // $.ajax({
        //     type: 'GET',
        //     url: url,
        //     dataType: 'json',
        //     beforeSend: function (xhr) {
        //         xhr.setRequestHeader('Authorization', 'Basic ' + btoa(token + ':api_token'));
        //     },
        //     // success: pagesCallback
        // });
    }
    formatDataObj() {
        var that = this;
        Object.keys(this.dataObj).forEach(function (key){
            that.dataObj[key] = that.dataObj[key].data;
        });

    }
}