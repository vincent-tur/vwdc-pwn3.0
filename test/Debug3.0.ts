/**
 * Created by rtholmes on 2016-10-31.
 */

import Server from "../src/rest/Server";
import {expect} from 'chai';
import Toggl from '../src/controller/Datasources/Toggl/Toggl';
import {Response} from "restify";
import TargetProcess from "../src/controller/Datasources/TargetProcess/TargetProcess";

describe("Debug [vwdc-pwn3.0] Spec", function () {
    var s: Server;
    var chai = require('chai'), chaiHttp = require('chai-http');
    this.timeout(1000000);

    var fs = require("fs");
    var path = require("path");
    //TODO: Spent 1.92h Remain: 5.92H

    before(function (done) {
        chai.use(chaiHttp);
        console.log('App - starting');
        s = new Server(1234);
        s.start().then(function (val: boolean) {
            done();
        }).catch(function (err: Error) {
            console.log("App::initServer() - ERROR: " + err.message);
            done();
        });
    });

    after(function (done) {
        s.stop().then(function () {
            done();
        });
        console.log('After: ' + (<any>this).test.parent.title);
    });

    it("3.0aaaa First Test - Toggl", function () {
        var fetch = require('node-fetch');
        return fetch('https://v.tpondemand.com/api/v1/assignables/216?access_token=MTpuRjdJUFU4WkYrcFNnQ3hyam5PanlPbGVZUG9nbGFWTSt2aHJXWXdxNWl3PQ==&include=[TimeRemain,RoleEfforts]&format=json')
            .then(function(res: any) {

                return res.json();
            }).then(function(json: any) {
            console.log(json);
            console.log('over here');
        });
    });


    it("3.0 First Test - Toggl", function () {
        let tgl = new Toggl();
        return tgl.getData().then(function (){
            tgl.getDataObj();
        });
    });
    it("3.0 First Test - TargetProcess", function () {
        let tp = new TargetProcess();
        return tp.getData();
    });


    //
    // it("GET /", function () {
    //     return chai.request("http://localhost:1234")
    //         .get('/')
    //         .then(function (res: Response) {
    //
    //         })
    //         .catch(function () {
    //             expect.fail();
    //         });
    // });
    // it("GET /echo/:msg test", function () {
    //     return chai.request("http://localhost:1234")
    //         .get('/echo/hello')
    //         .then(function (res: Response) {
    //         })
    //         .catch(function () {
    //             expect.fail();
    //         });
    // });

    // it("Testing PUT (add dataset 'rooms') Request", function () {
    //     return chai.request('http://localhost:1234')
    //         .put('/dataset/rooms')
    //         .attach("body", fs.readFileSync(zipPath), 'roomsFULL.zip')
    //         .then(function (res: Response) {
    //             Log.trace('then:');
    //             expect(res.statusCode).to.equal(204);
    //             // some assertions
    //         })
    //         .catch(function (err: any) {
    //             Log.trace('catch:');
    //             // some assertions
    //             expect.fail();
    //         });
    // });
    // it("Testing POST (performQuery: rooms_lon EQ) Request", function () {
    //     //TODO: Use JSON.parse in InsightFacade.performQuery to make it work with REST
    //     return chai.request('http://localhost:1234')
    //         .post('/query/' + JSON.stringify({
    //                 "WHERE": {
    //                     "EQ": {
    //                         "rooms_lon": -123.24807
    //
    //                     }
    //                 },
    //                 "OPTIONS": {
    //                     "COLUMNS": [
    //                         "rooms_name"
    //                     ],
    //                     "ORDER": "rooms_name",
    //                     "FORM": "TABLE"
    //                 }
    //             }))
    //         .then(function (response: InsightResponse) {
    //             let correctResponse: Object = {
    //                 "render": "TABLE",
    //                 "result": [
    //                     {
    //                         "rooms_name": "DMP_101"
    //                     },
    //                     {
    //                         "rooms_name": "DMP_110"
    //                     },
    //                     {
    //                         "rooms_name": "DMP_201"
    //                     },
    //                     {
    //                         "rooms_name": "DMP_301"
    //                     },
    //                     {
    //                         "rooms_name": "DMP_310"
    //                     }
    //                 ]
    //             };
    //             expect(response.body).to.eql(correctResponse);
    //             return;
    //         })
    //         .catch(function (err: any) {
    //             Log.trace('catch:');
    //             // some assertions
    //             console.log(JSON.stringify(err));
    //             expect.fail();
    //         });
    // });
    // it("Testing DEL (remove dataset 'rooms') Request", function () {
    //     return chai.request('http://localhost:1234')
    //         .del('/dataset/rooms')
    //         .then(function (res: Response) {
    //             Log.trace('then:');
    //
    //         })
    //         .catch(function (err: any) {
    //             Log.trace('catch:');
    //             // some assertions
    //             expect.fail();
    //         });
    // });
});
