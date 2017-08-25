/**
 * Starts the server. It is unlikely you will have to change anything here.
 */
import Server from './rest/Server';


/**
 * Starts the server; doesn't listen to whether the start was successful.
 */
export class App {


    public initServer(port: number) {
        console.log('App::initServer( ' + port + ' ) - start');

        let s = new Server(port);
        s.start().then(function (val: boolean) {
            console.log("App::initServer() - loading datasets...");
        }).catch(function (err: Error) {
            console.log("App::initServer() - ERROR: " + err.message);
        });
    }




}

// This ends up starting the whole system and listens on a hardcoded port (4321)

 console.log('App - starting');
 let app = new App();
 app.initServer(4321);
