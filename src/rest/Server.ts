/**
 * This is the REST entry point for the project.
 * Restify is configured here.
 */

import restify = require('restify');
import Toggl from "../controller/Datasources/Toggl/Toggl";
import TargetProcess from "../controller/Datasources/TargetProcess/TargetProcess";
import Backend from "../controller/Backend";

// import {InsightResponse} from "../controller/IInsightFacade";
// import InsightFacade from "../controller/Backend";

/**
 * This configures the REST endpoints for the server.
 */

export default class Server {
    //TODO:  In all likelyhood your Server file will be calling your InsightFacade methods.
    //TODO: https://piazza.com/class/iw1iu9xgfam11a?cid=1743
    //TODO: REST BODY: https://github.com/restify/node-restify/issues/191
    //TODO: content-type: application/json


    private port: number;
    //TODO: private rest: restify.Server;
    public rest: restify.Server;

    static Backend: Backend;

    constructor(port: number) {
        // Log.info("Server::<init>( " + port + " )");
        this.port = port;
    }


    /**
     * Stops the server. Again returns a promise so we know when the connections have
     * actually been fully closed and the port has been released.
     *
     * @returns {Promise<boolean>}
     */
    public stop(): Promise<boolean> {
        // Log.info('Server::close()');
        let that = this;
        return new Promise(function (fulfill) {
            that.rest.close(function () {
                fulfill(true);
            });
        });
    }

    /**
     * Starts the server. Returns a promise with a boolean value. Promises are used
     * here because starting the server takes some time and we want to know when it
     * is done (and if it worked).
     *
     * @returns {Promise<boolean>}
     */
    public start(): Promise<boolean> {
        let that = this;
        return new Promise(function (fulfill, reject) {
            try {
                that.rest = restify.createServer({
                    name: 'insightUBC'
                });

                Server.Backend = new Backend;

                that.rest.use(restify.bodyParser({mapParams: true, mapFiles: true}));
                that.rest.get('/', function (req: restify.Request, res: restify.Response, next: restify.Next) {
                    res.send(200);
                    return next();
                });
                that.rest.get('/echo/:msg', Server.echo);
                that.rest.get('/get_toggl/:msg', Server.getToggl);
                that.rest.get('/get_tp/:msg', Server.getTargetProcess);
                that.rest.get('/one_step/:msg', Server.getOneStep);


                // that.rest.put('/dataset/:id', Server.addDataset);
                // that.rest.del('/dataset/:id', Server.removeDataset);
                // that.rest.post('/query/:request', Server.performQuery);

                that.rest.get(/.*/, restify.serveStatic({
                    directory: './ui/',
                    default: 'index.html'
                }));
                that.rest.listen(that.port, function () {
                    fulfill(true);
                });
                that.rest.on('error', function (err: string) {
                    // catches errors in restify start; unusual syntax due to internal node not using normal exceptions here
                    reject(err);
                });
            } catch (err) {
                reject(err);
            }
        });
    }

    public static getOneStep(req: restify.Request, res: restify.Response, next: restify.Next){
        console.log("Server request: get_oneStep");
        Server.Backend.getOneStep().then(function (result: any){
            res.json(200, result)
        }).catch(function (result: any){
            res.json(500, result.message)
        });

        return next();


    }

    public static getToggl(req: restify.Request, res: restify.Response, next: restify.Next){
        console.log("Server request: get_toggle");
        let tgl = new Toggl();
        return tgl.getData().then(function (){
           let serv_response =  tgl.getDataObj();
           res.json(200, serv_response);
           return next();
        });


    }


    public static getTargetProcess(req: restify.Request, res: restify.Response, next: restify.Next){
        let tp = new TargetProcess();
        return tp.getData().then(function (){
            let serv_response =  tp.getDataObj();
            res.json(200, serv_response);
            return next();
        });


    }

    public static echo(req: restify.Request, res: restify.Response, next: restify.Next) {
        // Log.trace('Server::echo(..) - params: ' + JSON.stringify(req.params));
        try {
            let result = Server.performEcho(req.params.msg);
            // Log.info('Server::echo(..) - responding ' + result.code);
            res.json(result.code, result.body);
        } catch (err) {
            // Log.error('Server::echo(..) - responding 400');
            res.json(400, {error: err.message});
        }
        return next();
    }

    public static performEcho(msg: string): any {
        if (typeof msg !== 'undefined' && msg !== null) {
            return {code: 200, body: {message: msg + '...' + msg}};
        } else {
            return {code: 400, body: {error: 'Message not provided'}};
        }
    }

}