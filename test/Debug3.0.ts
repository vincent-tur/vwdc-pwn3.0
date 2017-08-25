/**
 * Created by rtholmes on 2016-10-31.
 */

import Server from "../src/rest/Server";
import {expect} from 'chai';

import {Response} from "restify";

describe("EchoSpec", function () {
    //TODO:https://piazza.com/class/iw1iu9xgfam11a?cid=1743
    var s: Server;
    var fs = require("fs");
    var chai = require('chai'), chaiHttp = require('chai-http');
    this.timeout(1000000);
    var path = require("path");


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

    it("GET /", function () {
        return chai.request("http://localhost:1234")
            .get('/')
            .then(function (res: Response) {
            })
            .catch(function () {
                expect.fail();
            });
    });
    it("GET /echo/:msg test", function () {
        return chai.request("http://localhost:1234")
            .get('/echo/hello')
            .then(function (res: Response) {
            })
            .catch(function () {
                expect.fail();
            });
    });


});
