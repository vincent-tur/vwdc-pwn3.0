import {isNullOrUndefined} from "util";
import Building from "./Building";
import Room from "./Room";
import DataSetManager from "../DataSetManager";
/**
 * Created by V on 2017-02-16.
 */
export default class BuildingManager {
    Buildings: {[rooms_address: string]: Building};
    currentMemoryId: string = null;

    linksToExtract: Array<string> = [];
    zip: JSZip;

    /*
     BuildingManager Essential Functions
     */
    constructor(currentMemoryId: string) {
        this.currentMemoryId = currentMemoryId;
        this.Buildings = {};
    }
    // getMemoryFolder(idToGet: string = this.currentMemoryId): string{
    //     return DataSetManager.baseMemoryFolder + "/" + idToGet + "/";
    // }
    //
    // saveDatasetToDisk(id: string, content: string){
    //
    //     var that = this;
    //     var dir2: string = this.getMemoryFolder(id);
    //
    //     Object.keys(that.Departments).forEach(function (dept_name: string) {
    //         that.Departments[dept_name].saveDatasetToDiskHelper(dir2);
    //     });
    // }

    clearDataSetInMemory() {
        this.Buildings = {};
    }

    receivedActualContent(): boolean {
        return (Object.keys(this.Buildings).length > 0);
    }

    /*
     Parsing from index.html. Start point.
     */
    parse(content: string): Promise<{}> {

        var that = this;

        return new Promise(function (fulfill, reject) {
            that.readZip(content).then(function () {
                if (that.receivedActualContent() == false) {
                    reject({"code": 400, "body": {"error": "Received valid zip but no real data"}});
                    that.currentMemoryId = null;
                    return;
                }
                fulfill("DepartmentManager.parse success");
                return;
            }).catch(function (e: any) {
                reject({"code": 400, "body": {"error": "addDataSetHelper.readZip failure: " + JSON.stringify(e)}});
                that.currentMemoryId = null;
                return;
            });
        })
    }

    /*
     Adding Room and Building object
     */
    convertDataToObject(fileData: string, extraParameters: {[key: string]: any} = {}): Promise<any> {
        var that = this;
        return new Promise(function (fulfill, reject) {


            var parse5 = require('parse5');
            var document: HTMLDocument = parse5.parse(fileData);

            var buildingFullName: string = that.getBuildingFullName(document["childNodes"]); //TODO: Implement getBuildingFullName
            var buildingShortName: string = that.getBuildingShortName(document["childNodes"]);
            var buildingAddress: string = that.getBuildingAddress(document["childNodes"]);


            var roomsTableNode: any = that.getElementsByClassName(document["childNodes"], "view-buildings-and-classrooms");
            var roomNumbersNode: any = that.getElementsByClassName(roomsTableNode, "views-field-field-room-number");
            var roomSeatsNode: any = that.getElementsByClassName(roomsTableNode, "views-field-field-room-capacity");
            var roomFurnitureNode: any = that.getElementsByClassName(roomsTableNode, "views-field-field-room-furniture");
            var roomTypeNode: any = that.getElementsByClassName(roomsTableNode, "views-field-field-room-type");

            //For each room on the building page:
            //  extract individual room contents

            var promises: any = [];

            promises.push(that.getRoomLatLon(buildingAddress));


            Promise.all(promises).then(function (data: any) {

                for (let j = 1; j < roomNumbersNode.length; j++) {
                    let roomObj: Room = new Room;

                    if (roomNumbersNode[j]["childNodes"][1] == undefined) {
                        return reject();
                    }
                    if (isNullOrUndefined(data)) {
                        return reject("Wasn't able to retrieve address for: " + roomObj.rooms_name);
                    }

                    roomObj.rooms_number = that.getInnerValue(roomNumbersNode[j]["childNodes"][1]); //The room number. Not always a number, so represented as a string.
                    roomObj.rooms_href = that.getAttribute(roomNumbersNode[j]["childNodes"][1], "href"); //The link to full details online (e.g., "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/DMP-201").
                    roomObj.rooms_fullname = buildingFullName; //Full building name (e.g., "Hugh Dempster Pavilion").
                    roomObj.rooms_shortname = buildingShortName; //Short building name (e.g., "DMP").

                    roomObj.rooms_name = roomObj.rooms_shortname + "_" + roomObj.rooms_number;   //The room id; should be rooms_shortname+"_"+rooms_number.
                    roomObj.rooms_address = buildingAddress; //The building address. (e.g., "6245 Agronomy Road V6T 1Z4").

                    roomObj.rooms_furniture = roomFurnitureNode[j]["childNodes"][0]["value"].trim(); //The room type (e.g., "Classroom-Movable Tables & Chairs").
                    roomObj.rooms_seats = roomSeatsNode[j]["childNodes"][0]["value"].trim(); //The number of seats in the room.
                    roomObj.rooms_type = roomTypeNode[j]["childNodes"][0]["value"].trim(); //The room type (e.g., "Small Group").

                    roomObj.rooms_lat = data[0]["lat"]; //The latitude of the building. Instructions for getting this field are below.
                    roomObj.rooms_lon = data[0]["lon"]; //The longitude of the building. Instructions for getting this field are below.

                    try {
                        that.addRoom(roomObj);
                        fulfill(1);

                    } catch (e) {
                        // console.log(e.message);
                        //TODO: Possibly reject here.
                    }
                }
            });


        });

    }


    getRoomLatLon(buildingAddress: string): Promise<any> {
        return new Promise(function (fulfill, reject) {

            var http = require('http');
            buildingAddress = encodeURIComponent(buildingAddress);
            let path: string = '/api/v1/team191/' + buildingAddress;
            var options = {
                host: 'skaha.cs.ubc.ca',
                port: 11316,
                path: path
            };

            http.get(options, function (res: any) {
                let totalData: string = "";

                res.setEncoding('utf8');

                res.on("data", function (chunk: any) {
                    totalData += chunk;
                });
                res.on("end", function (chunk: any) {
                    fulfill(JSON.parse(totalData));
                });
            }).on('error', function (e: any) {
                reject();
                // console.log(e.message);
            });

        });

    }

    addRoom(roomObj: Room) {

        //  Check if Building has already been added.
        //  If doesn't exist, add it and then add course to it.
        //  Otherwise add to existing department obj
        if (this.Buildings === null || Object.keys(this.Buildings).indexOf(roomObj.rooms_shortname) === -1) {
            this.addBuilding(roomObj.rooms_shortname);
        }
        this.Buildings[roomObj.rooms_shortname].addRoom(roomObj);

    }

    addBuilding(rooms_name: string) {
        this.Buildings[rooms_name] = new Building(rooms_name);
    }

    /*
     Parsing Index.html
     */
    parseIndexHtml(zip: JSZip): Promise<any> {
        var that = this;
        return new Promise(function (fulfill, reject) {
            if (isNullOrUndefined(zip["files"]["index.htm"])) {
                reject("Missing index.htm file (in readZip)");
                return;
            }

            that.zip = zip;
            that.zip.file("index.htm").async("string").then(function (content: string) {

                var parse5 = require('parse5');
                var document: HTMLDocument = parse5.parse(content);
                var indexTable: Array<Node> = that.getElementsByClassName(document["childNodes"], "views-field views-field-title");
                that.linksToExtract = that.extractBuildingLinksFromIndex(indexTable);

                if (that.linksToExtract.length == 0) {
                    reject("No building links to extract in the given index.html file");
                    return;
                }

                that.readZipHelper(zip).then(function () {
                    fulfill("readZipHelper success");
                    return;
                }).catch(function (e: any) {
                    reject({"code": 400, "body": {"error": "that.readZipHelper failure"}});
                    return;
                });
            }).catch(function () {
                reject("Could not perform JSZip.async on index file");
                return;
            });
        });
    }

    extractBuildingLinksFromIndex(indexTableNodes: Array<any>): Array<string> {
        let rtnArrayLinks: Array<string> = [];
        for (let i: number = 0; i < indexTableNodes.length; i++) {
            let aHrefNode: any = this.getElementsByTagName(indexTableNodes[i], "a");
            let aHrefLink: string = this.getAttribute(aHrefNode, "href");
            if (!isNullOrUndefined(aHrefLink)) {

                //zip.files is in the format of "campus/discover/buildings-and-classrooms/PHRM"
                //aHrefLink original format is "./campus/discover/buildings-and-classrooms/PHRM"
                //so we take the substring of it
                aHrefLink = aHrefLink.substring(2, aHrefLink.length);
                rtnArrayLinks.push(aHrefLink);
            }
        }
        return rtnArrayLinks;
    }

    /*
     Parsing individual building files
     */
    getBuildingFullName(node: any): string {
        let getNode: any = this.getElementById(node, "building-info");

        if (!isNullOrUndefined(getNode)) {
            getNode = getNode[0];
            getNode = this.getElementsByTagName(getNode["childNodes"], "h2");
            getNode = this.getElementsByTagName(getNode, "span");
            return this.getInnerValue(getNode);
        }
        return null;
    }

    getBuildingShortName(node: any): string {
        let nodeAry: any = this.getElementsByTagName(node, "link");
        if (nodeAry.length == 0)
            return undefined;

        for (let j = 0; j < nodeAry.length; j++) {
            if (this.attributeEquals(nodeAry[j], "rel", "shortlink")) {
                return this.getAttribute(nodeAry[j], "href");
            }
        }

        return undefined;
    }

    getBuildingAddress(node: any): string {
        /*
         The very first element of the div class "building-field" array
         is the address. It is nested a few levels deep within the child nodes
         of nodeAry[0] though.
         */

        let nodeAry: any = this.getElementsByClassName(node, "building-field");
        if (nodeAry.length == 0) {
            return undefined;
        } else {
            return nodeAry[0]["childNodes"][0]["childNodes"][0]["value"];
        }
    }

    /*
     HTML DOM Manipulation
     */
    getElementsByTagName(node: any, tagName: string): Array<Node> {
        if (!Array.isArray(node))
            node = [node]; //convert from single object node to single array to avoid code duplication below

        let rtnArray: Array<Node> = [];
        for (let i = 0; i < node.length; i++) {
            if (node[i]["tagName"] == tagName) {
                rtnArray = rtnArray.concat([node[i]]);
            }
            if (!isNullOrUndefined(node[i]["childNodes"])) {
                rtnArray = rtnArray.concat(this.getElementsByTagName(node[i]["childNodes"], tagName));
            }
        }

        return rtnArray;
    }

    getElementsByClassName(node: any, className: string): Array<Node> {
        if (!Array.isArray(node))
            node = [node]; //convert from single object node to single array to avoid code duplication below

        let rtnArray: Array<Node> = [];
        let regexClassName = "*" + className + "*";

        for (let i = 0; i < node.length; i++) {
            if (this.attributeEquals(node[i], "class", regexClassName)) {
                rtnArray = rtnArray.concat([node[i]]);
            }
            if (!isNullOrUndefined(node[i]["childNodes"])) {
                rtnArray = rtnArray.concat(this.getElementsByClassName(node[i]["childNodes"], className));
            }
        }
        return rtnArray;
    }

    getElementById(node: any, elementId: string): Array<Node> {
        if (!Array.isArray(node))
            node = [node]; //convert from single object node to single array to avoid code duplication below

        let rtnArray: Array<Node> = [];
        let regexClassName = elementId;

        for (let i = 0; i < node.length; i++) {
            if (this.attributeEquals(node[i], "id", regexClassName)) {
                rtnArray = rtnArray.concat([node[i]]);
            }
            if (!isNullOrUndefined(node[i]["childNodes"])) {
                rtnArray = rtnArray.concat(this.getElementById(node[i]["childNodes"], elementId));
            }
        }
        return rtnArray;
    }

    getAttribute(node: any, attrName: string): any {

        if (isNullOrUndefined(node))
            return undefined;
        else if (Array.isArray(node) && node.length == 0)
            return undefined;

        if (Array.isArray(node) && node.length > 0)
            node = node[0];

        if (!isNullOrUndefined(node["attrs"])) {
            for (let i = 0; i < node["attrs"].length; i++) {
                if (node["attrs"][i]["name"] == attrName) {
                    return node["attrs"][i]["value"];
                }
            }
        }

        return undefined;
    }

    attributeEquals(node: any, attrName: string, attrValue: string): boolean {
        if (!isNullOrUndefined(node["attrs"])) {
            for (let i = 0; i < node["attrs"].length; i++) {
                if (node["attrs"][i]["name"] == attrName && this.matchRuleShort(node["attrs"][i]["value"], attrValue)) {
                    return true;
                }
            }
        }
        return false;
    }

    getInnerValue(node: any): string {
        if (Array.isArray(node) && node.length == 1)
            node = node[0];
        else if (Array.isArray(node) && node.length > 1) {
            // console.log("WARNING IN getInnerValue: LENGTH OF GIVEN NODE ARRAY IS GREATER THAN 1");
            node = node[0];
        }

        return node["childNodes"][0]["value"];
    }

    matchRuleShort(str: any, rule: any) {
        return new RegExp("^" + rule.split("*").join(".*") + "$").test(str);
    }

    /*
     ZIP Reader
     */
    readZip(content: string): Promise<{}> {
        "use strict";
        var that = this;
        return new Promise(function (fulfill, reject) {
            var JSZip = require("jszip");
            let options2 = {base64: true};

            // https://piazza.com/class/iw1iu9xgfam11a?cid=558
            //read a zip file
            //https://stuk.github.io/jszip/documentation/howto/read_zip.html

            var zip = new JSZip();
            zip.loadAsync(content, options2).then(function (zip: any) {
                //http://stackoverflow.com/questions/39322964/extracting-zipped-files-using-jszip-in-javascript


                //TODO---
                that.parseIndexHtml(zip).then(function () {
                    that.readZipHelper(zip).then(function () {
                        fulfill("readZipHelper success");
                        return;
                    }).catch(function (e: any) {
                        reject({"code": 400, "body": {"error": "that.readZipHelper failure"}});
                        return;
                    });
                }).catch(function (e: any) {
                    reject({"code": 400, "body": {"error": "Failed to parse index html file: " + e}});
                    return;
                });

                //------


            }).catch(function (err: any) {
                // console.log(JSON.stringify(err));
                reject({"code": 400, "body": {"error": "zip.loadAsync failure: " + JSON.stringify(err)}});
                return;
            });
        });

    }

    readZipHelper(zip: JSZip): Promise<{}> {
        var that = this;
        return new Promise(function (fulfill, reject) {

            iterateFiles().then(function (fileContents) {
                for (let x = 0; x < fileContents.length; x++) {
                    that.readFileHelper(fileContents[x]).then(function () {
                        fulfill(1);
                        return;
                    }).catch(function (err: any) {
                        reject("iterateFiles promise rejection error: " + JSON.stringify(err));
                        return;
                    });
                }
            });
            function iterateFiles() {
                return Promise.all(that.linksToExtract.map(function (link) {
                    if (!isNullOrUndefined(zip.files[link])) {
                        return zip.files[link].async('string');
                    }

                }));
            }
        });
    }

    readFileHelper(fileData: any): Promise<any> {
        var that = this;
        return new Promise(function (fulfill, reject) {
            that.convertDataToObject(fileData).then(function () {
                fulfill(fileData);
                return;
            }).catch(function (e: any) {
                reject("Invalid file contents in readFileHelper");
                return;
            });
        });
    }

}