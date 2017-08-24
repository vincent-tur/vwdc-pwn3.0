/**
 * This is the REST entry point for the project.
 * Restify is configured here.
 */

import restify = require('restify');

import Log from "../Util";
import {InsightResponse} from "../controller/IInsightFacade";
import InsightFacade from "../controller/InsightFacade";

/**
 * This configures the REST endpoints for the server.
 */

export default class Server {
    //TODO:  In all likelyhood your Server file will be calling your InsightFacade methods.
    //TODO: https://piazza.com/class/iw1iu9xgfam11a?cid=1743
    //TODO: REST BODY: https://github.com/restify/node-restify/issues/191
    //TODO: content-type: application/json

    // POST /dataset/pwned HTTP/1.1
    // Host: localhost:4321
    // Upgrade-Insecure-Requests: 1
    // User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36
    // Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8
    //  Accept-Encoding: gzip, deflate, sdch, br
    //  Accept-Language: en-US,en;q=0.8
    //  Connection: close
    //  Content-Type: application/x-www-form-urlencoded
    //  Content-Length: 32
    //
    //  home=Cosby&favorite+flavor=flies
    private port: number;
    //TODO: private rest: restify.Server;
    public rest: restify.Server;

    static insightFacade: InsightFacade;

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
                // Log.info('Server::start() - start');

                that.rest = restify.createServer({
                    name: 'insightUBC'
                });

                Server.insightFacade = new InsightFacade;
                // Server.startUp_addDatasets();

                that.rest.use(restify.bodyParser({mapParams: true, mapFiles: true}));

                that.rest.get('/', function (req: restify.Request, res: restify.Response, next: restify.Next) {
                    res.send(200);
                    return next();
                });

                // provides the echo service
                // curl -is  http://localhost:4321/echo/myMessage
                //TODO: https://github.com/ubccpsc/310/blob/2017jan/project/Deliverable3.md
                that.rest.get('/echo/:msg', Server.echo);
                that.rest.put('/dataset/:id', Server.addDataset);
                // that.rest.del('/dataset/:id', Server.removeDataset);
                // that.rest.post('/query/:request', Server.performQuery);


                that.rest.get(/.*/, restify.serveStatic({
                    directory: './ui/',
                    default: 'index.html'
                }));

                // Other endpoints will go here

                that.rest.listen(that.port, function () {
                    // Log.info('Server::start() - restify listening: ' + that.rest.url);
                    fulfill(true);
                });

                that.rest.on('error', function (err: string) {
                    // catches errors in restify start; unusual syntax due to internal node not using normal exceptions here
                    // Log.info('Server::start() - restify ERROR: ' + err);
                    reject(err);
                });
            } catch (err) {
                // Log.error('Server::start() - ERROR: ' + err);
                reject(err);
            }
        });
    }



    // public static startUp_addDatasets(){
    //     var path = require("path");
    //     var fs = require("fs");
    //     var zipPath: string = path.join(__dirname, '../', 'roomsFULL.zip');
    //     var zipPath1 = path.join(__dirname, '../', 'coursesFULL.zip');
    //     let options = {encoding: "base64"};
    //
    //     fs.readFile(zipPath, options, function (err: any, base64data: any) {
    //         if (err) {
    //             console.log("ERROR ADDING ROOMS\n");
    //             return;
    //         }
    //         Server.insightFacade.addDataset('rooms', base64data).then(function () {
    //             fs.readFile(zipPath1, options, function (err: any, base64data_2: any) {
    //                 if (err) {
    //                     console.log("ERROR ADDING COURSES\n");
    //                     return;
    //                 }
    //                 Server.insightFacade.addDataset('courses', base64data_2).then(function () {
    //                     Log.info("App::initServer() - Finished adding datasets");
    //                     return;
    //
    //                 }).catch(function () {
    //                     console.log("CATCH: addDataset courses\n");
    //                     return;
    //                 });
    //             });
    //         }).catch(function (e) {
    //             console.log("CATCH: addDataset rooms\n");
    //             return;
    //         });
    //     });
    // }

    public static addDataset(req: restify.Request, res: restify.Response, next: restify.Next) {
        // // Log.trace('Server::echo(..) - params: ' + JSON.stringify(req.params));
        // try {
        //     Server.insightFacade.addDataset(req.params.id, req.params.body).then(function (result) {
        //         // Log.info('Server::echo(..) - responding ' + result.code);
        //         res.json(result.code, result.body);
        //     }).catch(function (result) {
        //         // Log.error('Server::echo(..) - responding CATCH result');
        //         res.json(result.code, result.body);
        //     });
        //
        // } catch (err) {
        //     // Log.error('Server::echo(..) - responding 400');
        //     res.json(400, {error: err.message});
        // }
        // return next();
    }
    //
    // public static removeDataset(req: restify.Request, res: restify.Response, next: restify.Next) {
    //     // Log.trace('Server::echo(..) - params: ' + JSON.stringify(req.params));
    //     try {
    //         Server.insightFacade.removeDataset(req.params.id).then(function (result) {
    //             // Log.info('Server::echo(..) - responding ' + result.code);
    //             res.json(result.code, result.body);
    //         }).catch(function (result) {
    //             // Log.error('Server::echo(..) - responding CATCH result');
    //             res.json(result.code, result.body);
    //         });
    //
    //     } catch (err) {
    //         // Log.error('Server::echo(..) - responding 400');
    //         res.json(400, {error: err.message});
    //     }
    //     return next();
    // }

    // public static performQuery(req: restify.Request, res: restify.Response, next: restify.Next) {
    //     // Log.trace('Server::echo(..) - params: ' + JSON.stringify(req.params));
    //     try {
    //         Server.insightFacade.performQuery(req.params.request).then(function (result) {
    //             // Log.info('Server::echo(..) - responding ' + result.code);
    //             res.json(result.code, result.body);
    //         }).catch(function (result) {
    //             // Log.error('Server::echo(..) - responding CATCH result');
    //             res.json(result.code, result.body);
    //         });
    //
    //     } catch (err) {
    //         // Log.error('Server::echo(..) - responding 400');
    //         res.json(400, {error: err.message});
    //     }
    //     return next();
    // }


    // The next two methods handle the echo service.
    // These are almost certainly not the best place to put these, but are here for your reference.
    // By updating the Server.echo function pointer above, these methods can be easily moved.

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

    public static performEcho(msg: string): InsightResponse {
        if (typeof msg !== 'undefined' && msg !== null) {
            return {code: 200, body: {message: msg + '...' + msg}};
        } else {
            return {code: 400, body: {error: 'Message not provided'}};
        }
    }

}