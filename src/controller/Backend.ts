/**
 * This is the main programmatic entry point for the project.
 */
import {Datasource} from "./Datasources/Datasource";
import Toggl from "./Datasources/Toggl/Toggl";
import TargetProcess from "./Datasources/TargetProcess/TargetProcess";


export default class Backend{

    constructor() {
        console.log('InsightFacadeImpl::init()');
    }


    getOneStep(){
        return new Promise(function (fulfill, reject) {
            let dataSources: Array<Datasource> = [new Toggl(), new TargetProcess()];
            let superDataSource: Datasource = new Datasource;
            superDataSource.setIterables(dataSources);
            superDataSource.getData().then(function (response){
                let xtc = superDataSource;
                return response;
            });
        });
    }
}