import DepartmentManager from "./Courses/DepartmentManager";
import {isNullOrUndefined} from "util";
import {InsightResponse} from "./IInsightFacade";
import BuildingManager from "./Rooms/BuildingManager";

export default class DataSetManager {

    dataSet: {[dataset_id: string]: any}; //either DepartmentManager or BuildingManager

    static currentCachedIds: Array<string> = [];

    static path = require("path");
    static baseMemoryFolder: string = DataSetManager.path.join(__dirname, '../../', 'memory'); // "../memory";

    constructor() {

        //DataSetManager.baseMemoryFolder

        this.dataSet = {};
    }

    saveDatasetToDisk(id: string, content: string): Promise<any> {

        var that = this;
        var fs = require('fs');
        var dir: string = DataSetManager.baseMemoryFolder;
        var dir2: string = this.getMemoryFolderNoTrailingSlash(id);


        return new Promise(function (fulfill, reject) {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir);
            }
            if (!fs.existsSync(dir2)) {
                fs.mkdirSync(dir2);
            } else {
                fulfill("Dataset already exists");
                return;
            }
            fs.writeFile(that.getBase64CachePath(id), content, function (err: any) {
                if (err) {
                    reject(JSON.stringify(err));
                    return;
                }
            });
            //TODO
            if(id == "courses"){
                that.dataSet[id].saveDatasetToDisk();
            }

            DataSetManager.currentCachedIds.push(id);
            fulfill("Dataset saved successfully");
            return;
        })
    }

    addDataSetHelper(id: string, content: string, responseCode: number): Promise<InsightResponse> {
        var that = this;
        return new Promise(function (fulfill, reject) {
            if (id == "courses") {
                that.dataSet[id] = new DepartmentManager(id);
                that.readZip(id, content).then(function () {
                    if (that.dataSet[id].receivedActualContent() == false) {
                        reject({"code": 400, "body": {"error": "Received valid zip but no real data"}});
                        delete that.dataSet[id];
                        return;
                    }
                    that.saveDatasetToDisk(id, content).then(function () {
                        if (responseCode == 204) {
                            return fulfill({
                                "code": responseCode,
                                "body": "the operation was successful and the id was new (not added in this session or was previously cached)."
                            });
                        } else {
                            return fulfill({
                                "code": responseCode,
                                "body": "The operation was successful and the id already existed (was added in this session or was previously cached)"
                            });
                        }
                    }).catch(function (e: any) {
                        reject({"code": 400, "body": {"error": "saveDatasetToDisk failure: " + JSON.stringify(e)}});
                        return;
                    });
                }).catch(function (e: any) {
                    reject({"code": 400, "body": {"error": "addDataSetHelper.readZip failure: " + JSON.stringify(e)}});
                    delete that.dataSet[id];
                    return;
                });
            }
            else { //id == "rooms"
                that.dataSet[id] = new BuildingManager(id);
                that.dataSet[id].parse(content).then(function (response: any) {
                    that.saveDatasetToDisk(id, content).then(function () {
                        if (responseCode == 204) {
                            return fulfill({
                                "code": responseCode,
                                "body": "the operation was successful and the id was new (not added in this session or was previously cached)."
                            });
                        } else {
                            return fulfill({
                                "code": responseCode,
                                "body": "The operation was successful and the id already existed (was added in this session or was previously cached)"
                            });
                        }
                    }).catch(function (e: any) {
                        reject({"code": 400, "body": {"error": "saveDatasetToDisk failure: " + JSON.stringify(e)}});
                        return;
                    });
                }).catch(function (response: any) {
                    reject({"code": 400, "body": {"error": "dataSet.parse failure: " + JSON.stringify(response)}});
                    return;
                });
            }
        });
    }

    /*static loadFolderRecursive(path: any) {
        var fs = require('fs');
        var that = this;
        if (fs.existsSync(path)) {
            fs.readdirSync(path).forEach(function (file: any) {
                var thisFile = path + "/" + file;
                if (fs.lstatSync(thisFile).isDirectory()) {
                    that.loadFolderRecursive(thisFile);
                } else {
                    fs.unlinkSync(thisFile);
                }
            });
            fs.rmdirSync(path);
        }
    };*/

    getMemoryFolder(idToGet: string): string {
        return this.getMemoryFolderNoTrailingSlash(idToGet) +  "/";
    }
    getMemoryFolderNoTrailingSlash(idToGet: string): string {

        return DataSetManager.baseMemoryFolder + "/" + idToGet;
    }

    getBase64CachePath(id: string): string {
        return this.getMemoryFolder(id) + "base64cache";
    }

    DiskCacheToMemCache(id: string): Promise<boolean> {
        var that = this;

        return new Promise(function (fulfill, reject) {
            if (id == "DOESNT_EXIST") {
                return reject({"code": 400, "body": "requested data sets are not in memory"});
            }
            var fs = require('fs');
            var dir = that.getMemoryFolderNoTrailingSlash(id);
            if (Object.keys(that.dataSet).indexOf(id) === -1 && !fs.existsSync(dir)) {
                return reject({"code": 424, "body": {"message": "the query failed because it depends on an id that has not been added.", "missing":id}});
            }

            //if it's not memory cached already
            if (Object.keys(that.dataSet).indexOf(id) === -1) {
                let options = {encoding: "utf8"};
                const fs = require('fs');
                //read a zip file
                //https://stuk.github.io/jszip/documentation/howto/read_zip.html
                fs.readFile(that.getBase64CachePath(id), options, function (err: any, base64: any) {
                    if (err) {
                        return reject({"code": 424, "body": "DiskCacheToMemCache error"});
                    }
                    that.dataSet[id].addDataSetHelper(id, base64, 204).then(function () {
                        return fulfill(true);
                    }).catch(function (e: any) {
                         console.log(JSON.stringify(e));
                        return reject({"code": 424, "body": "addDatasetHelper error: " + JSON.stringify(e)});
                    });
                });
            } else {
                fulfill(true);
                return;
            }
        });
    }

    isDiskCached(id: string): boolean {
        if (isNullOrUndefined(this.dataSet)) {
            return false;
        }

        if (DataSetManager.currentCachedIds.indexOf(id) > -1) {
            return true;
        } else {
            return false;
        }

    }

    clearDatasetInMemory() {
        var that = this;
        Object.keys(this.dataSet).forEach(function (dataset_id: string) {
            that.dataSet[dataset_id].clearDataSetInMemory();
            var index = DataSetManager.currentCachedIds.indexOf(dataset_id);
            DataSetManager.currentCachedIds.splice(index, 1);
        });
        this.dataSet = {};
    }


    readZip(id: string, content: string): Promise<{}> {
        "use strict";
        var that = this;
        return new Promise(function (fulfill, reject) {
            var JSZip = require("jszip");
            let options2 = {base64: true};

            // https://piazza.com/class/iw1iu9xgfam11a?cid=558
            // read a zip file
            // https://stuk.github.io/jszip/documentation/howto/read_zip.html

            var zip = new JSZip();
            zip.loadAsync(content, options2).then(function (zip: any) {
                //http://stackoverflow.com/questions/39322964/extracting-zipped-files-using-jszip-in-javascript
                readZipHelper(zip).then(function () {
                    fulfill("readZipHelper success");
                    return;
                }).catch(function (e: any) {
                    reject({"code": 400, "body": {"error": "that.readZipHelper failure"}});
                    return;
                });
            }).catch(function (err: any) {
                reject({"code": 400, "body": {"error": "zip.loadAsync failure: " + JSON.stringify(err)}});
                return;
            });
        });
        function readFileHelper(fileData: any): Promise<any> {
            return new Promise(function (fulfill, reject) {
                that.dataSet[id].convertDataToObject(fileData).then(function () {
                    fulfill(1);
                    return;
                }).catch(function (e: any) {
                    reject("Invalid file contents in readFileHelper");
                    return;
                });
            });
        }

        function readZipHelper(zip: JSZip): Promise<{}> {
            return new Promise(function (fulfill, reject) {

                iterateFiles().then(function (fileContents) {
                    for (let x = 0; x < fileContents.length; x++) {
                        readFileHelper(fileContents[x]).then(function () {
                            fulfill(1);
                            return;
                        }).catch(function (err: any) {
                            reject("iterateFiles promise rejection error: " + JSON.stringify(err));
                            return;
                        });
                    }
                });
                function iterateFiles() {
                    return Promise.all(Object.keys(zip.files).map(function (filename) {
                        return zip.files[filename].async('string');
                    }));
                }
            });
        }
    }

    deleteFolderRecursive(path: any) {
        var fs = require('fs');
        var that = this;
        if (fs.existsSync(path)) {
            fs.readdirSync(path).forEach(function (file: any) {
                var thisFile = path + "/" + file;
                if (fs.lstatSync(thisFile).isDirectory()) {
                    that.deleteFolderRecursive(thisFile);
                } else {
                    fs.unlinkSync(thisFile);
                }
            });
            fs.rmdirSync(path);
        }
    };
}