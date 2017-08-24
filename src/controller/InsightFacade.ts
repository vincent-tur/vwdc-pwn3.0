/**
 * This is the main programmatic entry point for the project.
 */
import  {IInsightFacade, InsightResponse, QueryRequest} from "./IInsightFacade";
import Log from "../Util";
import {isNullOrUndefined} from "util";
import CourseSection from "./Courses/CourseSection";
import FinalResponseBST from "./FinalResponse/FinalResponseBST";
import DataSetManager from "./DataSetManager";
import Department from "./Courses/Department";
import Building from "./Rooms/Building";
import Room from "./Rooms/Room";


export default class InsightFacade implements IInsightFacade {

    dataSetManager: DataSetManager;

    constructor() {
        this.dataSetManager = new DataSetManager;
        Log.trace('InsightFacadeImpl::init()');
    }

    static adapterPerformSchedule(roomAry: {[building_name: string] : Array<string>}, courseAry: {[dpt_name: string] : Array<string>}){
        InsightFacade.adapterPerformSchedule_Courses(courseAry);
    }

    static adapterPerformSchedule_Rooms(roomAry: {[building_name: string] : Array<string>}){
        var jsonObj: any =  {"WHERE":{}};
        // jsonObj.WHERE["AND"] = [];
        var jsonAndAry: Array<any> = [];
        var jsonAnd: any;

        var counter = 0;
        Object.keys(roomAry).forEach(function (building_name){
            jsonAnd = {"AND": []};
            jsonAnd.AND.push({"IS": {"rooms_shortname": building_name}});
            jsonAnd.AND.push({"OR": []});
            for(var i = 0; i < roomAry[building_name].length; i++){
                jsonAnd.AND[1].OR.push({"IS:": {"rooms_number": roomAry[building_name][i]}});
            }
            jsonAndAry.push(jsonAnd);
            counter++;
        });
        if(counter == 1){
            jsonObj.WHERE = jsonAndAry[0];
        }else if(counter > 1){
            jsonObj.WHERE.OR = [];
            for(var i = 0; i < jsonAndAry.length; i++){
                jsonObj.WHERE.OR.push(jsonAndAry[i]);
            }
        }

        console.log(JSON.stringify(jsonObj));
        return jsonObj;
    }
    static adapterPerformSchedule_Courses(courseAry: {[dpt_name: string] : Array<string>}) {
        var jsonObj: any =  {"WHERE":{}};
        // jsonObj.WHERE["AND"] = [];
        var jsonAndAry: Array<any> = [];
        var jsonAnd: any;

        var counter = 0;
        Object.keys(courseAry).forEach(function (dpt_name){
            jsonAnd = {"AND": []};
            jsonAnd.AND.push({"IS": {"courses_dept": dpt_name}});
            jsonAnd.AND.push({"OR": []});
            jsonAnd.AND.push({"NOT": {"EQ": {"courses_year": 1900}}});
            for(var i = 0; i < courseAry[dpt_name].length; i++){
                jsonAnd.AND[1].OR.push({"IS": {"courses_id": courseAry[dpt_name][i]}});
            }
            jsonAndAry.push(jsonAnd);
            counter++;
        });
        if(counter == 1){
            jsonObj.WHERE = jsonAndAry[0];
        }else if(counter > 1){
            jsonObj.WHERE.OR = [];
            for(var i = 0; i < jsonAndAry.length; i++){
                jsonObj.WHERE.OR.push(jsonAndAry[i]);
            }
        }

        console.log(JSON.stringify(jsonObj));
        return jsonObj;

    }

    /**
     * Add a dataset to UBCInsight.
     *
     * @param id  The id of the dataset being added.
     * @param content  The base64 content of the dataset. This content should be in the
     * form of a serialized zip file.
     *
     * The promise should return an InsightResponse for both fulfill and reject.
     *
     * Fulfill should be for 2XX codes and reject for everything else.
     *
     * After receiving the dataset, it should be processed into a data structure of
     * your design. The processed data structure should be persisted to disk; your
     * system should be able to load this persisted value into memory for answering
     * queries.
     *
     * Ultimately, a dataset must be added or loaded from disk before queries can
     * be successfully answered.
     *
     * Response codes:
     *
     * 201: the operation was successful and the id already existed (was added in
     * this session or was previously cached).
     * 204: the operation was successful and the id was new (not added in this
     * session or was previously cached).
     * 400: the operation failed. The body should contain {"error": "my text"}
     * to explain what went wrong.
     *
     */
    addDataset(id: string, content: string): Promise<InsightResponse> {
        var that = this;
        return new Promise(function (fulfill, reject) {

            if (isNullOrUndefined(id)) {
                return reject({"code": 400, "body": {"error": "Given ID for data set is null or undefined"}});
            }
            if (isNullOrUndefined(content)) {
                return ({"code": 400, "body": {"error": "Given base64 content is null or undefined"}});
            }


            //If it is disk cached already, then load it from disk into memory (201)
            if (that.dataSetManager.isDiskCached(id)) {
                return that.removeDataset(id).then(function (response: InsightResponse) {
                    that.dataSetManager.addDataSetHelper(id, content, 201).then(function (response: InsightResponse) {
                        return fulfill(response);
                    }).catch(function (err: any) {
                        return reject({
                            "code": 400,
                            "body": {"error": "dManager.addDatasethelper failure: " + JSON.stringify(err)}
                        });
                    });
                }).catch(function (err: any) {
                    return reject({
                        "code": 400,
                        "body": {"error": "dManager.saveDatasetToDisk failure: " + JSON.stringify(err)}
                    });
                });
            }

            //Not disk or memory cached. (201)
            that.dataSetManager.addDataSetHelper(id, content, 204).then(function (response: InsightResponse) {
                fulfill(response);
                return;
            }).catch(function (response: InsightResponse) {
                reject(response);
                return;
            });
        });
    }


    /*
     * 204: the operation was successful.
     * 404: the operation was unsuccessful because the delete was for a resource that was not previously added.
     */
    removeDataset(id: string): Promise<InsightResponse> {
        var that = this;
        return new Promise(function (fulfill, reject) {
            if (isNullOrUndefined(id)) {
                return reject({
                    "code": 404,
                    "body": "The operation was unsuccessful because the delete was for a resource that was not previously added."
                });

            }
            try {
                var fs = require('fs');
                let dir: string = that.dataSetManager.getMemoryFolderNoTrailingSlash(id);
                if (!fs.existsSync(dir)) {
                    return reject({
                        "code": 404,
                        "body": "The operation was unsuccessful because the delete was for a resource that was not previously added."
                    });

                }
                that.dataSetManager.deleteFolderRecursive(dir);
                if (Object.keys(that.dataSetManager.dataSet).indexOf(id) > -1) {
                    that.dataSetManager.clearDatasetInMemory();
                }


                return fulfill({"code": 204, "body": "The operation was successful (dataset removed)"});

            } catch (err) {
                return reject({
                    "code": 404,
                    "body": "The operation was unsuccessful because the delete was for a resource that was not previously added. Error: " + err.message
                });

            }
        });
    }


    /**
     * Perform a query on UBCInsight.
     *
     * @param query  The query to be performed. This is the same as the body of the POST message.
     *
     * @return Promise <InsightResponse>
     *
     * The promise should return an InsightResponse for both fulfill and reject.
     *
     * Fulfill should be for 2XX codes and reject for everything else.
     *
     * Return codes:
     *
     * 200: the query was successfully answered. The result should be sent in JSON according in the response body.
     * 400: the query failed; body should contain {"error": "my text"} providing extra detail.
     * 424: the query failed because it depends on a resource that has not been PUT. The body should contain {"missing": ["id1", "id2"...]}.
     *
     */
    performQuery(query: QueryRequest): Promise <InsightResponse> {
        var that = this;

        if(typeof query === "string"){
            query = JSON.parse(query);
        }
        return new Promise(function (fulfill, reject) {
            let listOfName: any = [];

            var isValidated: {[key: string]: any} = validateQuery();
            if (isValidated["success"] == false) {
                return reject({"code": 400, "body": isValidated["error"]});
            }

            let operationList: any = [];
            let isNot: any = false;
            let iNot: any = false;
            let rawQuery: any = [];
            var finalResponse: {[key: string]: any} = {};

            var resultBST: FinalResponseBST = new FinalResponseBST;
            finalResponse["code"] = 200;
            finalResponse["body"] = {};

            var neededDataset = getNeededDatasets();

            if (!("WHERE" in query)) {
                return reject({"code": 400, "body": {"error": "needs where"}});
            }

            if (!("OPTIONS" in query)) {
                return reject({"code": 400, "body": {"error": "needs options"}});
            }

            that.dataSetManager.DiskCacheToMemCache(neededDataset).then(function () {
                for (var key in query) {
                    if (key == "WHERE") {
                        rawQuery = performCheck(query.WHERE);

                        if (Array.isArray(rawQuery[0])) {
                            rawQuery = rawQuery[0];
                        }

                        if ("OPTIONS" in query) {
                            if ("TRANSFORMATIONS" in query) {
                                let groupBy: any = [];
                                let groupResults: any = [];
                                let aggQuery: any = [];

                                if ("GROUP" in query.TRANSFORMATIONS && "APPLY" in query.TRANSFORMATIONS) {
                                    groupBy = query.TRANSFORMATIONS["GROUP"];
                                    if (groupBy.length > 0) {

                                        listOfName = listOfName.concat(groupBy);

                                        var isSuperset = query.OPTIONS["COLUMNS"].every(function (val: any) { return listOfName.indexOf(val) >= 0; });

                                        if (isSuperset == true) {
                                            groupResults = performArray(rawQuery, groupBy);
                                        } else {
                                            return reject({"code": 400, "body": {"error": "COLUMNS terms must correspond to either GROUP or Apply"}});
                                        }

                                        let newBy = query.TRANSFORMATIONS["APPLY"];
                                        for (var o = 0; o < newBy.length; o++) {
                                            let namee = Object.keys(newBy[o])[0];

                                            let func = newBy[o][namee];

                                            if (Object.keys(func)[0] == "MAX") {
                                                let search = func[Object.keys(func)[0]];
                                                performAggregation(groupResults, search, "MAX", namee);
                                            }
                                            if (Object.keys(func)[0] == "MIN") {
                                                let search = func[Object.keys(func)[0]];
                                                performAggregation(groupResults, search, "MIN", namee);
                                            }
                                            if (Object.keys(func)[0] == "AVG") {
                                                let search = func[Object.keys(func)[0]];
                                                performAggregation(groupResults, search, "AVG", namee);
                                            }
                                            if (Object.keys(func)[0] == "SUM") {
                                                let search = func[Object.keys(func)[0]];
                                                performAggregation(groupResults, search, "SUM", namee);
                                            }
                                            if (Object.keys(func)[0] == "COUNT") {
                                                let search = func[Object.keys(func)[0]];
                                                performAggregation(groupResults, search, "COUNT", namee);
                                            }
                                        }

                                        for (var i = 0; i < groupResults.length; i++) {
                                            aggQuery.push(groupResults[i][0]);
                                        }

                                        groupResults = [];
                                        rawQuery = aggQuery;
                                        aggQuery = [];

                                    } else {
                                        return reject({"code": 400, "body": {"error": "Group must contain more than zero"}});
                                    }
                                } else {
                                    return reject({"code": 400, "body": {"error": "Must have Apply"}});
                                }
                            }


                            if (!isNullOrUndefined(query.OPTIONS["ORDER"])) {
                                var orderBy: any = undefined;
                                var setDirection: any = "UP";
                                let qOO = query.OPTIONS["ORDER"];
                                if (typeof qOO == "object") {
                                    if ('keys' in qOO) {
                                        orderBy = qOO["keys"];
                                    }
                                    if ('dir' in qOO) {
                                        setDirection = qOO['dir'];
                                    }
                                } else {
                                    orderBy = qOO;
                                }

                                var orderKeyExistsInColumns: boolean = false;
                                Object.keys(query.OPTIONS["COLUMNS"]).forEach(function (index) {
                                    var thisColumn = query.OPTIONS["COLUMNS"][index];
                                    if (typeof orderBy == "object") {
                                        for (var i = 0; i < orderBy.length; i++) {
                                            if (thisColumn == orderBy[i]) {
                                                orderKeyExistsInColumns = true;
                                                return;
                                            }
                                        }
                                    }
                                    if (typeof orderBy == "string") {
                                        if (thisColumn == orderBy) {
                                            orderKeyExistsInColumns = true;
                                            return;
                                        }
                                    }
                                });
                                if (orderKeyExistsInColumns == false) {
                                    return reject({
                                        "code": 400,
                                        "body": {"error": "Order key needs to be included in columns"}
                                    });
                                }
                                resultBST.setSortByKeys(orderBy);
                                resultBST.setDirection(setDirection);
                            }

                            if (!isNullOrUndefined(rawQuery) && !isNullOrUndefined(rawQuery[0])) {
                                for (var key in query.OPTIONS) {
                                    if (key == "COLUMNS") {

                                        let oC: any = Object.keys(query.OPTIONS["COLUMNS"]);

                                        if (Object.keys(oC).length == 0 || Object.keys(oC).length == undefined) {
                                            return reject({"code": 400, "body": {"error": "Empty Column"}});
                                        }

                                        for (var curCourseIndex = 0; curCourseIndex < rawQuery.length; curCourseIndex++) {
                                            let subResult: {[key: string]: any} = {};

                                            Object.keys(query.OPTIONS["COLUMNS"]).forEach(function (columnIndex) {

                                                if (typeof query.OPTIONS["COLUMNS"][columnIndex] != "string") {
                                                    return reject({"code": 400, "body": {"error": "Must be string"}});
                                                }

                                                let columnKey: string = query.OPTIONS["COLUMNS"][columnIndex];
                                                let curCourse = rawQuery[curCourseIndex];

                                                let curCourseVal = undefined;

                                                if (columnKey == "courses_uuid") {
                                                    if (typeof curCourse[columnKey] == 'number') {
                                                        let curCourseVale = curCourse[columnKey];
                                                        curCourseVal = String(curCourseVale);
                                                    } else {
                                                        curCourseVal = curCourse[columnKey];
                                                    }
                                                }
                                                if (columnKey == "rooms_seats" || columnKey == "courses_year") {
                                                    if (typeof curCourse[columnKey] == 'string') {
                                                        let curCourseVale = curCourse[columnKey];
                                                        curCourseVal = Number(curCourseVale);
                                                    } else {
                                                        curCourseVal = curCourse[columnKey];
                                                    }
                                                }
                                                if (columnKey != "courses_uuid" && columnKey != "rooms_seats" && columnKey != "courses_year") {
                                                    curCourseVal = curCourse[columnKey];
                                                }

                                                subResult[columnKey] = curCourseVal;

                                            });
                                            resultBST.insert(subResult);

                                        }
                                    }
                                }
                            }

                            //function is to push perform query to REST
                            //order by size
                            //return
                            //The 'size' of course number of pass + fail students in its largest section (max) that is not an overall section.
                            //The number of sections = number of sections in 2014 divided by three and rounded up
                            //return course number, size, section number
                            if ("SCHEDULING" in query) {
                                if ("LatLon" in query.SCHEDULING) {
                                    let lat = [];
                                    let lon = [];
                                    let response = [];

                                    for (var y = 0; y < query.SCHEDULING["LatLon"].length; y++) {
                                        for (var index = 0; index < rawQuery.length; index++) {
                                            if (rawQuery[index]["rooms_shortname"] == query.SCHEDULING["LatLon"][y]) {
                                                lat.push(rawQuery[index]["rooms_lat"]);
                                                lon.push(rawQuery[index]["rooms_lon"]);
                                            }
                                        }
                                    }

                                    for (var x = 0; x < lat.length; x++) {
                                        for (var ind = 0; ind < rawQuery.length; ind++) {
                                            let distance = calcCrow(lat[x], lon[x], rawQuery[ind]["rooms_lat"], rawQuery[ind]["rooms_lon"]);
                                            if (distance <= query.SCHEDULING["Distance"] && response.indexOf(rawQuery[ind]["rooms_shortname"]) == - 1) {
                                                response.push(rawQuery[ind]["rooms_shortname"]);
                                            }
                                        }
                                    }

                                    finalResponse = response;
                                }

                                if ("TRUE" in query.SCHEDULING) {

                                    var fBST: any = [];
                                    let rBST = resultBST.getFinalResult();
                                    let curCoursePass = 0;
                                    let tMap: any = [];

                                    for (var cCourseIndex = 0; cCourseIndex < rawQuery.length; cCourseIndex++) {
                                        let cCourseVal: any = [];

                                        if (rawQuery[cCourseIndex]["courses_year"] == "2014") {
                                            cCourseVal.push(rawQuery[cCourseIndex]["courses_dept"] + " " + rawQuery[cCourseIndex]["courses_id"]);
                                        }

                                        if (rawQuery[cCourseIndex]["courses_year"] == "2014") {
                                            if (tMap.hasOwnProperty(cCourseVal)) {
                                                if (rawQuery[cCourseIndex]["courses_year"] == "2014") {
                                                    tMap[cCourseVal].push(rawQuery[cCourseIndex]);
                                                }
                                            } else {
                                                tMap[cCourseVal] = [];
                                                if (rawQuery[cCourseIndex]["courses_year"] == "2014") {
                                                    tMap[cCourseVal].push(rawQuery[cCourseIndex]);
                                                    tMap.push(tMap[cCourseVal]);
                                                }
                                            }
                                        }
                                    }

                                    for (var cCourseIndex = 0; cCourseIndex < rBST.length; cCourseIndex++) {

                                        let cCourse = rBST[cCourseIndex];
                                        let nCourse = rBST[cCourseIndex];
                                        let fCourse = rBST[cCourseIndex];


                                        if (cCourseIndex > 0) {
                                            nCourse = rBST[cCourseIndex - 1];
                                            if (cCourseIndex < rBST.length - 1) {
                                                fCourse = rBST[cCourseIndex + 1]
                                            }
                                        }

                                        if (nCourse["courses_id"] != cCourse["courses_id"] || fCourse["courses_id"] != cCourse["courses_id"]) {
                                            curCoursePass = 0;
                                        }

                                        let cCI = cCourseIndex;

                                        if (curCoursePass == 0) {
                                            for (var checkCourseIndex = cCI; checkCourseIndex < rBST.length; checkCourseIndex++) {
                                                let ccC = rBST[checkCourseIndex];
                                                let ncC = rBST[checkCourseIndex];
                                                let fcC = rBST[checkCourseIndex];


                                                if (checkCourseIndex > 0) {
                                                    ncC = rBST[checkCourseIndex - 1];
                                                    if (checkCourseIndex < rBST.length - 1) {
                                                        fcC = rBST[checkCourseIndex + 1]
                                                    }
                                                }

                                                if (nCourse["courses_id"] != cCourse["courses_id"] || fCourse["courses_id"] != cCourse["courses_id"]) {
                                                    curCoursePass = Number(ccC["courses_pass"]) + Number(ccC["courses_fail"]);
                                                    break;
                                                }

                                                if (ncC["courses_id"] == ccC["courses_id"] || fcC["courses_id"] == ccC["courses_id"]) {
                                                    if (Number(ccC["courses_pass"]) + Number(ccC["courses_fail"]) >= curCoursePass && ccC["courses_year"] != 1900) {
                                                        curCoursePass = Number(ccC["courses_pass"]) + Number(ccC["courses_fail"]);
                                                    }
                                                } else {
                                                    break;
                                                }
                                            }
                                        }

                                        rBST[cCourseIndex]["courses_pass"] = curCoursePass;

                                        let kk = cCourse["courses_dept"] + " " + cCourse["courses_id"];

                                        if (tMap.hasOwnProperty(kk)) {
                                            let calculation = Math.round(tMap[kk].length / 3);
                                            if (calculation == 0) {
                                                calculation = 1;
                                            }
                                            rBST[cCourseIndex]["courses_fail"] = calculation;
                                        }

                                    }


                                    for (var i = 0; i < rBST.length; i++) {
                                        let rB = rBST[i];

                                        if (i == 0) {
                                            fBST.push(rBST[i]);
                                        } else {
                                            let nB = rBST[i - 1];
                                            if (rB["courses_id"] != nB["courses_id"]) {
                                                fBST.push(rBST[i]);
                                            }
                                        }
                                    }

                                    finalResponse["body"]['render'] = query.OPTIONS["FORM"];
                                    finalResponse["body"]["result"] = fBST;
                                }

                            } else {
                                finalResponse["body"]['render'] = query.OPTIONS["FORM"];
                                finalResponse["body"]["result"] = resultBST.getFinalResult();
                            }

                        }


                    }
                }

                return fulfill(finalResponse);
            }).catch(function () {
                return reject({"code": 400, "body": "The query failed in that.dataSetManager.DiskCacheToMemCache"});
            });

            function calcCrow(lat1: any, lon1: any, lat2: any, lon2: any) {
                var R = 6371000; // m
                var dLat: any = toRad(lat2-lat1);
                var dLon: any = toRad(lon2-lon1);
                var lat1: any = toRad(lat1);
                var lat2: any = toRad(lat2);

                var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                    Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
                var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
                var d = R * c;
                return d;
            }

            // Converts numeric degrees to radians
            function toRad(Value: any)
            {
                return Value * Math.PI / 180;
            }


            function performCheck(key: any) {
                let testVar: any = [];
                let firstVar: any = [];

                Object.keys(key).forEach(function (k) {
                    if (typeof key[k] == "object" && key[k] !== null) {

                        let newKey = key[k];


                        if (k == "LT" || k == "GT" || k == "EQ" || k == "IS" || k == "AND" || k == "OR" || k == "NOT") {

                            if (checkLOGICCOMPARISON(k)) {
                                operationList.push(k);

                                if (newKey.length == undefined || newKey.length == 0) {
                                    return reject({"code": 400, "body": {"error": "Empty"}});
                                }

                                if (isNot == true && checkAndNegative(operationList)) {
                                    iNot = true;
                                    isNot = false;
                                } else {
                                    iNot = false;
                                }

                                if (isNot == true) {
                                    if (k == "OR") {
                                        k = "AND";
                                    }
                                }

                                for (let p = 0; p < newKey.length; p++) {
                                    firstVar.push(performCheck(newKey[p]));
                                }

                                if (firstVar.length == newKey.length) {
                                    let secondVar: any = [];

                                    if (k == "AND") {


                                        if (firstVar.length == 1) {
                                            let listFirst = firstVar.pop();
                                            let listSecond = listFirst[0];

                                            firstVar = negativeAND(listSecond);
                                            return firstVar;
                                        }

                                        if (firstVar.length == 2) {
                                            let listFirst = firstVar.pop();
                                            let listSecond = firstVar.pop();


                                            if (Object.keys(listFirst).length == 1) {
                                                listFirst = listFirst[0];
                                            }
                                            if (Object.keys(listSecond).length == 1) {
                                                listSecond = listSecond[0];
                                            }

                                            for (let e = 0; e < listFirst.length; e++) {
                                                for (let s = 0; s < listSecond.length; s++) {
                                                    if (listSecond[s] == listFirst[e]) {
                                                        firstVar.push(listSecond[s]);
                                                    }
                                                }
                                            }

                                            firstVar = negativeAND(firstVar);
                                            return firstVar;
                                        }


                                        if (firstVar.length > 2) {
                                            while (firstVar.length > 2) {
                                                secondVar = [];

                                                let listFirst = firstVar.pop();
                                                let listSecond = firstVar.pop();

                                                if (Object.keys(listFirst).length == 1) {
                                                    listFirst = listFirst[0];
                                                }
                                                if (Object.keys(listSecond).length == 1) {
                                                    listSecond = listSecond[0];
                                                }


                                                for (let e = 0; e < listFirst.length; e++) {
                                                    for (let s = 0; s < listSecond.length; s++) {
                                                        if (listSecond[s] == listFirst[e]) {
                                                            secondVar.push(listSecond[s]);
                                                        }
                                                    }
                                                }


                                                firstVar.push(secondVar);
                                            }


                                            if (firstVar.length == 2) {
                                                secondVar = [];

                                                let listFirst = firstVar.pop();
                                                let listSecond = firstVar.pop();

                                                if (Object.keys(listFirst).length == 1) {
                                                    listFirst = listFirst[0];
                                                }
                                                if (Object.keys(listSecond).length == 1) {
                                                    listSecond = listSecond[0];
                                                }

                                                for (let e = 0; e < listFirst.length; e++) {
                                                    for (let s = 0; s < listSecond.length; s++) {
                                                        if (listSecond[s] == listFirst[e]) {
                                                            firstVar.push(listSecond[s]);
                                                        }
                                                    }
                                                }


                                                firstVar = negativeAND(firstVar);
                                                return firstVar;
                                            }

                                        }

                                    }
                                    if (k == "OR") {
                                        while (firstVar.length > 2) {
                                            secondVar = [];


                                            let listFirst = firstVar.pop();
                                            let listSecond = firstVar.pop();

                                            if (Object.keys(listFirst).length == 1) {
                                                listFirst = listFirst[0];
                                            }
                                            if (Object.keys(listSecond).length == 1) {
                                                listSecond = listSecond[0];
                                            }

                                            secondVar = aUN(listSecond.concat(listFirst));

                                            firstVar.push(secondVar);
                                        }


                                        if (firstVar.length == 2) {
                                            secondVar = [];


                                            let listFirst = firstVar.pop();
                                            let listSecond = firstVar.pop();

                                            if (Object.keys(listFirst).length == 1) {
                                                listFirst = listFirst[0];
                                            }
                                            if (Object.keys(listSecond).length == 1) {
                                                listSecond = listSecond[0];
                                            }

                                            firstVar = aUN(listSecond.concat(listFirst));

                                            return firstVar;
                                        }

                                        if (firstVar.length == 1) {
                                            let listFirst = firstVar.pop();
                                            let listSecond = listFirst[0];

                                            firstVar = listSecond;

                                            return firstVar;
                                        }
                                    }
                                }
                                return testVar;
                            }

                            if (checkMCOMPARISON(k)) {
                                operationList.push(k);
                                testVar.push(performSimple(key));
                                return testVar;
                            }

                            if (checkSCOMPARISON(k)) {
                                operationList.push(k);
                                testVar.push(performSimple(key));
                                return testVar;
                            }

                            if (checkNEGATION(k)) {
                                operationList.push(k);

                                if (isNot == true && checkDoubleNegative(operationList)) {
                                    isNot = false;
                                } else {
                                    isNot = true;
                                }

                                let newKey = key[k];

                                if (newKey.length == undefined) {
                                    testVar = performCheck(newKey);
                                }
                                if (newKey.length == 1) {
                                    for (let n = 0; n < newKey.length; n++) {
                                        testVar = performCheck(newKey[n]);
                                    }
                                }
                            }

                        } else {
                            return reject({"code": 400, "body": {"error": "invalid operation"}});
                        }

                    }
                });

                if(JSON.stringify(key) == "{}"){
                    if (neededDataset == "courses") {
                        var departmentsInMem: {[dept_name: string]: Department} = that.dataSetManager.dataSet[neededDataset].Departments;

                        Object.keys(departmentsInMem).forEach(function (dpt_name: string) {
                            Object.keys(departmentsInMem[dpt_name].Courses).forEach(function (course_num: string) {
                                Object.keys(departmentsInMem[dpt_name].Courses[course_num].CourseSections).forEach(function (course_uuid: string) {
                                    testVar.push(departmentsInMem[dpt_name].Courses[course_num].CourseSections[course_uuid]);
                                });
                            });
                        });
                    } else {
                        var buildingsInMem: {[building_name: string]: Building} = that.dataSetManager.dataSet[neededDataset].Buildings;

                        Object.keys(buildingsInMem).forEach(function (building_name: string) {
                            Object.keys(buildingsInMem[building_name].Rooms).forEach(function (room_name: string) {
                                testVar.push(buildingsInMem[building_name].Rooms[room_name]);
                            });
                        });
                    }
                }

                if (firstVar.length >= 1) {
                    return firstVar;
                }

                return testVar;
            }


            function performArray(array: any, f: any) {
                let result: any = [];

                let rQuery = [];

                var tagMap: any = [];

                for (var curCourseIndex = 0; curCourseIndex < array.length; curCourseIndex++) {
                    let subResult: any = [];
                    let curCourseVal: any = [];

                    let columnKey: string = undefined;



                    let curCourse = array[curCourseIndex];
                    for (let i = 0; i < f.length; i++) {
                        if (typeof f[i] != "string") {
                            return reject({"code": 400, "body": {"error": "Must be string"}});
                        }

                        columnKey = f[i];

                        curCourseVal.push(curCourse[columnKey]);
                    }

                    curCourseVal.push(0);

                    if (tagMap.hasOwnProperty(curCourseVal)) {
                        tagMap[curCourseVal].push(array[curCourseIndex]);
                    } else {
                        tagMap[curCourseVal] = [];
                        tagMap[curCourseVal].push(array[curCourseIndex]);
                        tagMap.push(tagMap[curCourseVal]);
                    }

                }

                return tagMap;
            }


            function performAggregation(arrays: any, f: any, aggregate: any, name: any) {
                let result: any = [];
                for (var a = 0; a < arrays.length; a++) {

                    let array = arrays[a];

                    let subResult: any = [];

                    for (var curCourseIndex = 0; curCourseIndex < array.length; curCourseIndex++) {
                        if (typeof f != "string") {
                            return reject({"code": 400, "body": {"error": "Must be string"}});
                        }
                        let columnKey = f;
                        let curCourse = array[curCourseIndex];
                        let curCourseVal = undefined;


                        if (columnKey == "courses_uuid") {
                            if (typeof curCourse[columnKey] == 'number') {
                                let curCourseVale = curCourse[columnKey];
                                curCourseVal = curCourseVale.toString();
                            } else {
                                curCourseVal = curCourse[columnKey];
                            }
                        }
                        if (columnKey == "rooms_seats" || columnKey == "courses_year") {
                            if (typeof curCourse[columnKey] == 'string') {
                                let curCourseVale = curCourse[columnKey];
                                curCourseVal = Number(curCourseVale);
                            } else {
                                curCourseVal = curCourse[columnKey];
                            }
                        }

                        if (columnKey != "courses_uuid" && columnKey != "rooms_seats" && columnKey != "courses_year") {
                            curCourseVal = curCourse[columnKey];
                        }

                        subResult.push(curCourseVal);
                    }

                    if (aggregate == "MAX") {
                        var max = Math.max(...subResult);
                        if (isNaN(max)) {
                            return reject({"code": 400, "body": {"error": "Must be number1"}});
                        } else {
                            for (var curCourseIndex = 0; curCourseIndex < array.length; curCourseIndex++) {
                                let curCourse = array[curCourseIndex];
                                curCourse[name] = max;
                            }
                        }
                    }
                    if (aggregate == "MIN") {
                        var min = Math.min(...subResult);
                        if (isNaN(min)) {
                            return reject({"code": 400, "body": {"error": "Must be number2"}});
                        } else {
                            for (var curCourseIndex = 0; curCourseIndex < array.length; curCourseIndex++) {
                                let curCourse = array[curCourseIndex];
                                curCourse[name] = min;
                            }
                        }
                    }
                    if (aggregate == "AVG") {
                        let multiply = subResult.map(function(a: any) {
                            if (isNaN(parseInt(a))) {
                                return reject({"code": 400, "body": {"error": "Must be number3"}});
                            } else {
                                let value = Number(a) * 10;
                                value = Number(value.toFixed(0));
                                return value;
                            }
                        });

                        let total = multiply.reduce(add, 0);

                        if (isNaN(total)) {
                            return reject({"code": 400, "body": {"error": "Must be number4"}});
                        } else {
                            let avg = total / subResult.length;
                            avg = avg / 10;
                            var res = Number(avg.toFixed(2));
                            for (var curCourseIndex = 0; curCourseIndex < array.length; curCourseIndex++) {
                                let curCourse = array[curCourseIndex];
                                curCourse[name] = res;
                            }
                        }
                    }
                    if (aggregate == "SUM") {
                        var sum = subResult.reduce(add, 0);
                        if (isNaN(sum)) {
                            return reject({"code": 400, "body": {"error": "Must be number5"}});
                        } else {
                            for (var curCourseIndex = 0; curCourseIndex < array.length; curCourseIndex++) {
                                let curCourse = array[curCourseIndex];
                                curCourse[name] = Number(sum.toFixed(2));
                            }
                        }
                    }
                    if (aggregate == "COUNT") {
                        var count = 1;

                        var counts: any = {};
                        subResult.forEach(function(x: any) {
                            counts[x] = (counts[x] || 0) + 1;
                        });

                        count = Object.keys(counts).length;

                        for (var curCourseIndex = 0; curCourseIndex < array.length; curCourseIndex++) {
                            let curCourse = array[curCourseIndex];
                            curCourse[name] = Math.round(count);
                        }
                    }
                }
            }

            function add(a: any, b: any) {
                return Number(a) + Number(b);
            }

            function checkDoubleNegative(array: any) {
                let nNot: any = false;
                for (var i = 0; i < array.length; i++) {
                    if (array[i] == "NOT" || array[i] == "AND" || array[i] == "OR") {
                        if (array[i - 1] == "NOT" || array[i - 1] == "AND" || array[i - 1] == "OR") {
                            if (nNot == true) {
                                return false;
                            } else {
                                return true;
                            }
                        }
                    }
                }
            }

            function checkAndNegative(array: any) {
                for (var i = 0; i < array.length; i++) {
                    if (array[i] == "AND") {
                        if (array[i - 1] == "NOT") {
                            return true;
                        } else {
                            return false;
                        }
                    }
                }
            }


            function negativeAND(firstVar: any) {

                if (iNot == true) {
                    var objAry: any = [];

                    if (neededDataset == "courses") {
                        var departmentsInMem: {[dept_name: string]: Department} = that.dataSetManager.dataSet[neededDataset].Departments;

                        Object.keys(departmentsInMem).forEach(function (dpt_name: string) {
                            Object.keys(departmentsInMem[dpt_name].Courses).forEach(function (course_num: string) {
                                Object.keys(departmentsInMem[dpt_name].Courses[course_num].CourseSections).forEach(function (course_uuid: string) {
                                    objAry.push(departmentsInMem[dpt_name].Courses[course_num].CourseSections[course_uuid]);
                                });
                            });
                        });
                    } else {
                        var buildingsInMem: {[building_name: string]: Building} = that.dataSetManager.dataSet[neededDataset].Buildings;

                        Object.keys(buildingsInMem).forEach(function (building_name: string) {
                            Object.keys(buildingsInMem[building_name].Rooms).forEach(function (room_name: string) {
                                objAry.push(buildingsInMem[building_name].Rooms[room_name]);
                            });
                        });
                    }


                    let listFirst = firstVar;
                    firstVar = [];
                    let listSecond = objAry;

                    firstVar = listSecond.filter(function (current: any) {
                        return listFirst.filter(function (current_b: any) {
                                return current_b == current
                            }).length == 0
                    });

                    return firstVar;

                } else {
                    return firstVar;
                }

            }



            function aUN(array: any) {
                var a = array;

                for (var i = 0; i < a.length; ++i) {
                    for (var j = i + 1; j < a.length; ++j) {
                        if (a[i] == a[j])
                            a.splice(j--, 1);
                    }
                }

                return a;
            }

            function performSimple(key: any) {
                let operation: any = Object.keys(key)[0];
                let element: any = Object.keys(key[operation])[0];
                let value: any = key[operation][element];
                // let operation: any = operationList[operationList.length - 1];
                // let value: any = undefined;
                let answer: any = undefined;

                answer = checkCourseObj(element, value, operation);
                return answer;
            }

            function checkLOGICCOMPARISON(key: any) {
                if (key == "AND" || key == "OR") {
                    return true;
                }
            }

            function checkMCOMPARISON(key: any): Boolean {
                if (key == "LT" || key == "GT" || key == "EQ") {
                    return true;
                }
            }

            function checkSCOMPARISON(key: any): Boolean {
                if (key == "IS") {
                    return true;
                }
            }

            function checkNEGATION(key: any): Boolean {
                if (key == "NOT") {
                    return true;
                }
            }

            function checkCourseObj(element: any, value: any, operations: any) {
                let roomsSC = element == "rooms_fullname" || element == 'rooms_shortname' || element == 'rooms_number' || element == 'rooms_name' || element == 'rooms_address' || element == 'rooms_type' || element == 'rooms_furniture' || element == 'rooms_href';
                let roomsMC = element == 'rooms_lat' || element == 'rooms_lon' || element == 'rooms_seats';
                let coursesMC = element == "courses_avg" || element == 'courses_pass' || element == 'courses_fail' || element == "courses_audit" || element == "courses_year";
                let coursesSC = element == "courses_dept" || element == "courses_id" || element == "courses_instructor" || element == "courses_title" || element == "courses_uuid";

                if (operations == "NOT") {
                    isNot = true;
                }

                if (operations == "LT" || operations == "GT" || operations == "EQ") {
                    if (typeof value != "number") {
                        return reject({"code": 400, "body": {"error": "needs to be a number"}});
                    }
                    if (coursesSC || roomsSC) {
                        return reject({"code": 400, "body": {"error": "invalid subject"}});
                    }
                    if (coursesMC || roomsMC) {
                        return grabElement(element, value, operations);
                    } else {
                        return reject({"code": 400, "body": {"error": "invalid subject"}});
                    }
                }

                if (operations == "IS") {
                    if (typeof value != "string") {
                        return reject({"code": 400, "body": {"error": "needs to be a string"}});
                    }
                    if (coursesMC || roomsMC) {
                        return reject({"code": 400, "body": {"error": "invalid subject"}});
                    }

                    if (coursesSC || roomsSC) {
                        return grabElement(element, value, operations);
                    } else {
                        return reject({"code": 400, "body": {"error": "invalid subject"}});
                    }
                }

                if (operations == "AND" || operations == "OR") {
                    return grabElement(element, value, operations);
                }
            }

            function grabElement(element: any, value: any, operation: any) {
                let roomsSC = element == "rooms_fullname" || element == 'rooms_shortname' || element == 'rooms_number' || element == 'rooms_name' || element == 'rooms_address' || element == 'rooms_type' || element == 'rooms_furniture' || element == 'rooms_href';
                let roomsMC = element == 'rooms_lat' || element == 'rooms_lon' || element == 'rooms_seats';
                let coursesMC = element == "courses_avg" || element == 'courses_pass' || element == 'courses_fail' || element == "courses_audit" || element == "courses_year";
                let coursesSC = element == "courses_dept" || element == "courses_id" || element == "courses_instructor" || element == "courses_title" || element == "courses_uuid";

                if (roomsSC || coursesSC) {
                    return performSC(element, value, operation);
                }

                if (coursesMC || roomsMC) {
                    return performMC(element, value, operation);
                }
            }

            //Returns array of Course Section objects
            function performSC(element: string, value: any, operation: any) {
                let roomsSC = element == "rooms_fullname" || element == 'rooms_shortname' || element == 'rooms_number' || element == 'rooms_name' || element == 'rooms_address' || element == 'rooms_type' || element == 'rooms_furniture' || element == 'rooms_href';
                let coursesSC = element == "courses_dept" || element == "courses_id" || element == "courses_instructor" || element == "courses_title" || element == "courses_uuid";

                if (neededDataset == "courses") {
                    if (coursesSC) {
                        return performSC_Courses(element, value, operation);
                    } else {
                        return reject({"code": 400, "body": {"error": "only one dataset allowed"}});
                    }
                } else {
                    if (roomsSC) {
                        return performSC_Rooms(element, value, operation);
                    } else {
                        return reject({"code": 400, "body": {"error": "only one dataset allowed"}});
                    }
                }
            }

            function performSC_Courses(element: string, value: any, operation: any) {
                var courseSectionObjAry: Array<CourseSection> = [];
                var escapeLoop: boolean = false;


                var departmentsInMem: {[dept_name: string]: Department} = that.dataSetManager.dataSet[neededDataset].Departments;

                Object.keys(departmentsInMem).forEach(function (dpt_name: string) {
                    Object.keys(departmentsInMem[dpt_name].Courses).forEach(function (course_num: string) {
                        Object.keys(departmentsInMem[dpt_name].Courses[course_num].CourseSections).forEach(function (course_uuid: string) {
                            if (isNot == false) {

                                if (operation == "IS") {
                                    if (matchRuleShort(departmentsInMem[dpt_name].Courses[course_num].CourseSections[course_uuid][element], value)) {
                                        courseSectionObjAry.push(departmentsInMem[dpt_name].Courses[course_num].CourseSections[course_uuid]);
                                    }

                                }
                            }

                            if (isNot == true) {

                                if (operation == "IS") {
                                    if (!matchRuleShort(departmentsInMem[dpt_name].Courses[course_num].CourseSections[course_uuid][element], value)) {
                                        courseSectionObjAry.push(departmentsInMem[dpt_name].Courses[course_num].CourseSections[course_uuid]);
                                    }

                                }
                            }
                        });
                        if (escapeLoop === true) return;
                    });
                    if (escapeLoop === true) return;
                });

                return courseSectionObjAry;
            }

            function performSC_Rooms(element: string, value: any, operation: any) {
                var roomObjAry: Array<Room> = [];
                var escapeLoop: boolean = false;
                var buildingsInMem: {[building_name: string]: Building} = that.dataSetManager.dataSet[neededDataset].Buildings;

                Object.keys(buildingsInMem).forEach(function (building_name: string) {
                    Object.keys(buildingsInMem[building_name].Rooms).forEach(function (room_name: string) {
                        if (isNot == false) {

                            if (operation == "IS") {
                                if (matchRuleShort(buildingsInMem[building_name].Rooms[room_name][element], value)) {
                                    roomObjAry.push(buildingsInMem[building_name].Rooms[room_name]);
                                }

                            }
                        }

                        if (isNot == true) {

                            if (operation == "IS") {
                                if (!matchRuleShort(buildingsInMem[building_name].Rooms[room_name][element], value)) {
                                    roomObjAry.push(buildingsInMem[building_name].Rooms[room_name]);
                                }

                            }
                        }

                        if (escapeLoop === true) return;
                    });
                    if (escapeLoop === true) return;
                });

                return roomObjAry;
            }

            function matchRuleShort(str: any, rule: any) {
                return new RegExp("^" + rule.split("*").join(".*") + "$").test(str);
            }

            function performMC(element: any, value: any, operation: any) {
                let roomsMC = element == 'rooms_lat' || element == 'rooms_lon' || element == 'rooms_seats';
                let coursesMC = element == "courses_avg" || element == 'courses_pass' || element == 'courses_fail' || element == "courses_audit" || element == "courses_year";

                if (neededDataset == "courses") {
                    if (coursesMC) {
                        return performMC_Courses(element, value, operation);
                    } else {
                        return reject({"code": 400, "body": {"error": "only one dataset allowed"}});
                    }
                } else {
                    if (roomsMC) {
                        return performMC_Rooms(element, value, operation);
                    } else {
                        return reject({"code": 400, "body": {"error": "only one dataset allowed"}});
                    }
                }
            }

            function performMC_Courses(element: any, value: any, operation: any) {
                var courseSectionObjAry: any = [];
                var escapeLoop: boolean = false;
                var departmentsInMem: {[dept_name: string]: Department} = that.dataSetManager.dataSet[neededDataset].Departments;

                Object.keys(departmentsInMem).forEach(function (dpt_name) {
                    Object.keys(departmentsInMem[dpt_name].Courses).forEach(function (course_num) {
                        Object.keys(departmentsInMem[dpt_name].Courses[course_num].CourseSections).forEach(function (course_uuid) {
                            let elementz: any = departmentsInMem[dpt_name].Courses[course_num].CourseSections[course_uuid][element];
                            if (isNot == false) {

                                if (operation == "EQ") {
                                    if (departmentsInMem[dpt_name].Courses[course_num].CourseSections[course_uuid][element] == value) {
                                        courseSectionObjAry.push(departmentsInMem[dpt_name].Courses[course_num].CourseSections[course_uuid]);
                                    }
                                }

                                if (operation == "GT") {
                                    if (elementz > value) {
                                        courseSectionObjAry.push(departmentsInMem[dpt_name].Courses[course_num].CourseSections[course_uuid]);
                                    }
                                }

                                if (operation == "LT") {
                                    if (departmentsInMem[dpt_name].Courses[course_num].CourseSections[course_uuid][element] < value) {
                                        courseSectionObjAry.push(departmentsInMem[dpt_name].Courses[course_num].CourseSections[course_uuid]);
                                    }
                                }
                            }

                            if (isNot == true) {

                                if (operation == "EQ") {
                                    if (departmentsInMem[dpt_name].Courses[course_num].CourseSections[course_uuid][element] != value) {
                                        courseSectionObjAry.push(departmentsInMem[dpt_name].Courses[course_num].CourseSections[course_uuid]);
                                    }
                                }

                                if (operation == "GT") {
                                    if (departmentsInMem[dpt_name].Courses[course_num].CourseSections[course_uuid][element] <= value) {
                                        courseSectionObjAry.push(departmentsInMem[dpt_name].Courses[course_num].CourseSections[course_uuid]);
                                    }
                                }

                                if (operation == "LT") {
                                    if (departmentsInMem[dpt_name].Courses[course_num].CourseSections[course_uuid][element] >= value) {
                                        courseSectionObjAry.push(departmentsInMem[dpt_name].Courses[course_num].CourseSections[course_uuid]);
                                    }
                                }
                            }
                        });
                        if (escapeLoop === true) return;
                    });
                    if (escapeLoop === true) return;
                });
                return courseSectionObjAry;
            }

            function performMC_Rooms(element: any, value: any, operation: any) {
                var roomObjAry: any = [];
                var escapeLoop: boolean = false;
                var buildingsInMem: {[building_name: string]: Building} = that.dataSetManager.dataSet[neededDataset].Buildings;

                Object.keys(buildingsInMem).forEach(function (building_name) {
                    Object.keys(buildingsInMem[building_name].Rooms).forEach(function (room_name) {
                        let elementz: any = buildingsInMem[building_name].Rooms[room_name][element]
                        if (isNot == false) {

                            if (operation == "EQ") {
                                if (buildingsInMem[building_name].Rooms[room_name][element] == value) {
                                    roomObjAry.push(buildingsInMem[building_name].Rooms[room_name]);
                                }
                            }

                            if (operation == "GT") {
                                if (elementz > value) {
                                    roomObjAry.push(buildingsInMem[building_name].Rooms[room_name]);
                                }
                            }

                            if (operation == "LT") {
                                if (buildingsInMem[building_name].Rooms[room_name][element] < value) {
                                    roomObjAry.push(buildingsInMem[building_name].Rooms[room_name]);
                                }
                            }
                        }

                        if (isNot == true) {

                            if (operation == "EQ") {
                                if (buildingsInMem[building_name].Rooms[room_name][element] != value) {
                                    roomObjAry.push(buildingsInMem[building_name].Rooms[room_name]);
                                }
                            }

                            if (operation == "GT") {
                                if (buildingsInMem[building_name].Rooms[room_name][element] <= value) {
                                    roomObjAry.push(buildingsInMem[building_name].Rooms[room_name]);
                                }
                            }

                            if (operation == "LT") {
                                if (buildingsInMem[building_name].Rooms[room_name][element] >= value) {
                                    roomObjAry.push(buildingsInMem[building_name].Rooms[room_name]);
                                }
                            }
                        }
                        if (escapeLoop === true) return;
                    });
                    if (escapeLoop === true) return;
                });
                return roomObjAry;
            }

            function getNeededDatasets(): string {
                var neededDatasets: any = [];
                Object.keys(query.OPTIONS["COLUMNS"]).forEach(function (index) {
                    let curDatasetId: Array<string> = query.OPTIONS["COLUMNS"][index].split("_");
                    if (!neededDatasets.includes(curDatasetId[0])) {
                        neededDatasets.push(curDatasetId[0]);
                    }
                });
                if (insideArray(neededDatasets)) {
                    let ind: any = neededDatasets.indexOf("courses");
                    if (ind == -1) {
                        ind = neededDatasets.indexOf("rooms")
                    }
                    return neededDatasets[ind];
                } else {
                    neededDatasets = ["DOESNT_EXIST"];
                    return neededDatasets;
                }
            }

            function insideArray(array: any) {
                for (var i = 0; i < array.length; i++) {
                    if (array[i].toLowerCase() == "courses") {
                        return true;
                    }
                    if (array[i].toLowerCase() == "rooms") {
                        return true;
                    }
                }
                return false;
            }

            function validateQuery(): Object {

                if (isNullOrUndefined(query.OPTIONS) || isNullOrUndefined(query.OPTIONS["COLUMNS"])
                    || Object.keys(query.OPTIONS).length < 1 || Object.keys(query.OPTIONS["COLUMNS"]).length < 1) {
                    return ({"success": false, "error": "Query format is wrong"});
                }

                let madeUp: any = undefined;

                if (query.TRANSFORMATIONS != undefined) {
                    madeUp = query.TRANSFORMATIONS["APPLY"];

                    for (var o = 0; o < madeUp.length; o++) {
                        let namee = Object.keys(madeUp[o])[0];
                        if (namee.includes("_")) {
                            return ({"success": false, "error": "Cannot Contain _"});
                        }
                        if (listOfName.includes(namee)) {
                            return ({"success": false, "error": "Cannot Contain same name"});
                        }
                        else {
                            listOfName.push(namee);
                        }
                    }
                }

                for (var i = 0; i < query.OPTIONS["COLUMNS"].length; i++) {
                    if (typeof query.OPTIONS["COLUMNS"][i] != "string") {
                        return ({"success": false, "error": "Need to be strings"});
                    }

                    let element = query.OPTIONS["COLUMNS"][i];

                    let roomsSC = element == "rooms_fullname" || element == 'rooms_shortname' || element == 'rooms_number' || element == 'rooms_name' || element == 'rooms_address' || element == 'rooms_type' || element == 'rooms_furniture' || element == 'rooms_href';
                    let roomsMC = element == 'rooms_lat' || element == 'rooms_lon' || element == 'rooms_seats';
                    let coursesMC = element == "courses_avg" || element == 'courses_pass' || element == 'courses_fail' || element == "courses_audit" || element == "courses_year";
                    let coursesSC = element == "courses_dept" || element == "courses_id" || element == "courses_instructor" || element == "courses_title" || element == "courses_uuid";

                    if (roomsMC || roomsSC || coursesMC || coursesSC || listOfName.includes(element)) {
                    } else {
                        return ({"success": false, "error": "Invalid Selection"});
                    }
                }

                if (isNullOrUndefined(query.OPTIONS["FORM"]) || Object.keys(query.OPTIONS["FORM"]).length < 1) {
                    return ({"success": false, "error": "FORM doesn't exist"});
                }

                if (query.OPTIONS["FORM"] != "TABLE") {
                    return ({"success": false, "error": "FORM does not equal TABLE"});
                }

                return ({"success": true});
            }
        });
    }
    //require list of rooms
    //takes list and loops
    //creates empty slots {key: x(M or T), value: empty, room: , size: }
    //returns (list of M, list of T)
    //M is Monday, Wednesday, Friday (9 slots)
    //T is Tuesday, Thursday (6 slots)
    async createEmptySlot(roomQuery: QueryRequest, numberOf: any) {
        let that = this;
        let roomSlots: any = [];

        let listOfRooms: any = await that.pushRoomsQuery(roomQuery);

        let total: any = listOfRooms.body.result.length;
        let mCount: any = 9;
        let tCount: any = 6;

        let mC: any = 9;
        let tC: any = 6;

        if ((total * mCount) + (total * tCount) < numberOf) {
            while ((total * mC++) + (total * tC++) < numberOf) {
                mCount = mCount + 1;
                tCount = tCount + 1;
            }
        }


        let listRooms: any = [];
        listRooms["building"] = [];
        let listName: any = [];

        for (var i = 0; i < listOfRooms.body.result.length; i++) {
            let roomsOne = listOfRooms.body.result[i];

            let newRoom: any = [];

            for (var M = 0; M < mCount; M++) {
                if (M == 0) {
                    newRoom["key"] = "M";
                    newRoom["value"] = [];
                }
                newRoom["value"].push({
                    slot: M,
                    course: undefined,
                    section: undefined,
                    room: roomsOne["rooms_name"],
                    size: roomsOne["rooms_seats"],
                });
            }

            roomSlots.push(newRoom);
            newRoom = [];

            for (var T = 0; T < tCount; T++) {
                if (T == 0) {
                    newRoom["key"] = "T";
                    newRoom["value"] = [];
                }
                newRoom["value"].push({
                    slot: T,
                    course: undefined,
                    section: undefined,
                    room: roomsOne["rooms_name"],
                    size: roomsOne["rooms_seats"],
                });
            }

            roomSlots.push(newRoom);

            if(listName.indexOf(roomsOne["rooms_fullname"]) == -1) {
                listRooms["building"].push({
                    title: roomsOne["rooms_fullname"],
                    lat: roomsOne["rooms_lat"],
                    lng: roomsOne["rooms_lon"]
                });
                listName.push(roomsOne["rooms_fullname"]);
            }

        }


        let finalResponse: any = [];
        finalResponse["buildings"] = listRooms;
        finalResponse["result"] = roomSlots;

        return finalResponse;
    }

    async parseCourses(coursesQuery: QueryRequest) {
        let that = this;

        let listOfCourses: any = await that.pushCoursesQuery(coursesQuery);

        let getCourses: any = [];

        let gCourses: any = listOfCourses.body.result;

        let nCourses: any = gCourses;

        for (var i = 0; i < gCourses.length; i++) {
            if (i > 0) {
                nCourses = gCourses[i - 1];
            }

            if (gCourses[i]["courses_id"] != nCourses["courses_id"]) {
                let count = 1;
                for (var g = 0; g < gCourses[i]["courses_fail"]; g ++) {
                    getCourses.push({
                        key: gCourses[i]["courses_dept"] + " " + gCourses[i]["courses_id"],
                        section: count,
                        size: gCourses[i]["courses_pass"]
                    });
                    count = count + 1;
                }
            }
        }
        return getCourses;
    }

    //requires (list of M, list of T)
    //requires list of Courses
    //add value to list
    //checkQuality before finalizing
    //return schedule
    async performSchedule(roomQuery: any, courseQuery: any) {
        let that = this;

        var resultBST: FinalResponseBST = new FinalResponseBST;
        resultBST.setSortByKeys(["size"]);
        resultBST.setDirection("DOWN");


        let getCourses: any = await that.parseCourses(courseQuery);
        let numberOf: any = getCourses.length;
        let rSlots: any = await that.createEmptySlot(roomQuery, numberOf);

        let finalBuilding: any = rSlots["buildings"]["building"];
        let roomSlots: any = rSlots["result"];
        let finalSlots: any = [];

        var finalResponse: {[key: string]: any} = {};
        finalResponse["quality"] = 100 + "%";
        finalResponse["body"] = {};

        // roomSlots.sort(function (a: any, b: any) {
        //     return b.size - a.size;
        // });
        //
        // getCourses.body.result.sort(function (a: any, b: any) {
        //     return b.size - a.size;
        // });

        let checkArray: any = [];
        let counter: any = 0;
        let keyColumn = Object.keys(getCourses[0]);

        for (var curCourseIndex = 0; curCourseIndex < getCourses.length; curCourseIndex++) {
            let subResult: {[key: string]: any} = {};
            for (var columnIndex = 0; columnIndex < keyColumn.length; columnIndex++) {
                let columnKey: string = keyColumn[columnIndex];
                let curCourse = getCourses[curCourseIndex];

                let curCourseVal = undefined;

                curCourseVal = curCourse[columnKey];


                subResult[columnKey] = curCourseVal;
            }
            resultBST.insert(subResult);
        }

        getCourses = resultBST.getFinalResult();

        for (let i = 0; i < roomSlots.length; i++) {
            for (let v = 0; v < roomSlots[i]["value"].length; v++) {
                for (let g = 0; g < getCourses.length; g++) {
                    let courseSlots: any = getCourses[g];
                    let courses_course = courseSlots["key"];
                    if (courseSlots["size"] <= roomSlots[i]["value"][v]["size"]) {
                        if (roomSlots[i]["value"][v]["course"] == undefined) {
                            if (compareArray(courses_course, roomSlots[i]["value"][v]["slot"] + roomSlots[i]["key"])) {
                                if ((roomSlots[i]["value"][v]["slot"] > 9 && roomSlots[i]["key"] == 'M') || (roomSlots[i]["value"][v]["slot"] > 6 && roomSlots[i]["key"] == 'T')) {
                                    counter = counter + 1;
                                }

                                roomSlots[i]["value"][v]["course"] = courses_course;
                                roomSlots[i]["value"][v]["section"] = courseSlots["section"];
                                roomSlots[i]["value"][v]["size"] = courseSlots["size"];
                                roomSlots[i]["value"][v]["key"] = roomSlots[i]["key"];

                                var indexCourses = getCourses.indexOf(courseSlots);

                                if (indexCourses > -1) {
                                    getCourses.splice(indexCourses, 1);
                                }

                                break;
                            } else {
                                let find = v;
                                while (roomSlots[i]["value"][v]["course"] == undefined) {
                                    find = find + 1;
                                    if (compareArray(courses_course, roomSlots[i]["value"][find]["slot"] + roomSlots[i]["key"])) {
                                        if ((roomSlots[i]["value"][find]["slot"] > 9 && roomSlots[i]["key"] == 'M') || (roomSlots[i]["value"][find]["slot"] > 6 && roomSlots[i]["key"] == 'T')) {
                                            counter = counter + 1;
                                        }

                                        let courseS: any = getCourses[find];

                                        let rS: any = roomSlots[i]["value"][find];
                                        rS["course"] = courses_course;
                                        rS["section"] = courseSlots["section"];
                                        rS["size"] = courseSlots["size"];
                                        rS["key"] = roomSlots[i]["key"];


                                        var indexCourses = getCourses.indexOf(courseS);

                                        if (indexCourses > -1) {
                                            getCourses.splice(indexCourses, 1);
                                        }

                                        break;
                                    }
                                }
                            }
                        } else {
                            break;
                        }
                    }
                }
            }
            finalSlots.push(roomSlots[i]["value"]);
        }

        let quality = ((counter + getCourses.length)/numberOf) * 100;
        quality = Math.round(100 - quality);

        finalResponse["quality"] = quality + "%";
        finalResponse["listOfBuildings"] = finalBuilding;
        finalResponse["body"]['nonmatching'] = getCourses;
        finalResponse["body"]["result"] = this.parseSchedule(finalSlots);

        return finalResponse;

        function compareArray(course: any, key: any) {
            //check course with course
            //check if rooms = rooms
            //if = return false
            //if != return true

            let cCourseVal: any = [];

            cCourseVal.push(course);

            if (checkArray.hasOwnProperty(cCourseVal)) {
                if (checkArray[cCourseVal].indexOf(key) > -1) {
                    return false;
                } else {
                    checkArray[cCourseVal].push(key);
                }
            } else {
                checkArray[cCourseVal] = [];
                checkArray[cCourseVal].push(key);
            }

            return true;
        }
    }


    parseSchedule(finalSlots: any) {
        // {
        //     id: "id1",
        //     description: "George brings projector for presentations.",
        //     location: "",
        //     subject: "Quarterly Project Review Meeting",
        //     calendar: "Room 1",
        //     start: new Date(2016, 10, 23, 9, 0, 0),
        //     end: new Date(2016, 10, 23, 16, 0, 0)
        // }

        let finalfinalSlot: any = [];
        finalfinalSlot["appointment"] = [];

        for (var T = 0; T < finalSlots.length; T++) {
            for (var M = 0; M < finalSlots[T].length; M++) {
                if (finalSlots[T][M]["course"] != undefined) {
                    if (finalSlots[T][M]["key"] == 'M') {
                        let startTime: any = 8 * 1 + finalSlots[T][M]["slot"];
                        let endTime: any = startTime + 1;

                        let count: any = 21;

                        for (var i = 0; i < 3; i++) {
                            count = count + 2;
                            let startDate = new Date(2016, 10, count, startTime, 0, 0);
                            var startD = startDate.getTime();
                            let endDate = new Date(2016, 10, count, endTime, 0, 0);
                            var endD = endDate.getTime();

                            finalfinalSlot["appointment"].push({
                                id: "id" + T + M + i,
                                description: "Section: " + finalSlots[T][M]["section"] + ", Size: " + finalSlots[T][M]["size"] + ", Slot: " + finalSlots[T][M]["slot"],
                                location: "",
                                subject: finalSlots[T][M]["course"] + " (Room: " + finalSlots[T][M]["room"] + ")",
                                calendar: finalSlots[T][M]["room"].slice(0, 4),
                                start: startD,
                                end: endD
                            });
                        }
                    }
                    if (finalSlots[T][M]["key"] == 'T') {
                        let startTime: any = Math.floor(8 * 1.5 + finalSlots[T][M]["slot"]);
                        let startDTime: any = 0;
                        let endDTime: any = 0;

                        if (startTime % 1 != 0) {
                            startDTime = 5;
                        }
                        let endTime: any = Math.floor(startTime + 1.5);

                        if (endTime % 1 != 0) {
                            endDTime = 5;
                        }

                        let count: any = 22;

                        for (var i = 0; i < 2; i++) {
                            count = count + 2;
                            let startDate = new Date(2016, 10, count, startTime, startDTime, 0);
                            var startD = startDate.getTime();
                            let endDate = new Date(2016, 10, count, endTime, endDTime, 0);
                            var endD = endDate.getTime();

                            finalfinalSlot["appointment"].push({
                                id: "id" + T + M + i,
                                description: "Section: " + finalSlots[T][M]["section"] + ", Size: " + finalSlots[T][M]["size"],
                                location: "",
                                subject: finalSlots[T][M]["course"] + " (Room: " + finalSlots[T][M]["room"] + ")",
                                calendar: finalSlots[T][M]["room"].slice(0, 4),
                                start: startD,
                                end: endD
                            });
                        }
                    }
                }
            }
        }
    }


    // parseSchedule(finalSlots: any) {
    //     // {
    //     //     id: "id1",
    //     //     description: "George brings projector for presentations.",
    //     //     location: "",
    //     //     subject: "Quarterly Project Review Meeting",
    //     //     calendar: "Room 1",
    //     //     start: new Date(2016, 10, 23, 9, 0, 0),
    //     //     end: new Date(2016, 10, 23, 16, 0, 0)
    //     // }
    //
    //     let finalfinalSlot: any = [];
    //     finalfinalSlot["appointment"] = [];
    //
    //     for (var T = 0; T < finalSlots.length; T++) {
    //         for (var M = 0; M < finalSlots[T].length; M++) {
    //             if (finalSlots[T][M]["course"] != undefined) {
    //                 if (finalSlots[T][M]["key"] == 'M') {
    //                     let startTime: any = 8 * 1 + finalSlots[T][M]["slot"];
    //                     let endTime: any = startTime + 1;
    //
    //                     let count: any = 21;
    //
    //                     for (var i = 0; i < 3; i++) {
    //                         count = count + 2;
    //                         let startDate = new Date(2016, 10, count, startTime, 0, 0);
    //                         var startD = startDate.getTime();
    //                         let endDate = new Date(2016, 10, count, endTime, 0, 0);
    //                         var endD = endDate.getTime();
    //
    //                         finalfinalSlot["appointment"].push({
    //                             id: "id" + T + M + i,
    //                             description: "Section: " + finalSlots[T][M]["section"] + ", Size: " + finalSlots[T][M]["size"] + ", Slot: " + finalSlots[T][M]["slot"],
    //                             location: "",
    //                             subject: finalSlots[T][M]["course"] + " (Room: " + finalSlots[T][M]["room"] + ")",
    //                             calendar: finalSlots[T][M]["room"].slice(0, 4),
    //                             start: new Date(startD),
    //                             end: new Date(endD)
    //                         });
    //                     }
    //                 }
    //                 if (finalSlots[T][M]["key"] == 'T') {
    //                     let startTime: any = Math.floor(8 * 1.5 + finalSlots[T][M]["slot"]);
    //                     let startDTime: any = 0;
    //                     let endDTime: any = 0;
    //
    //                     if (startTime % 1 != 0) {
    //                         startDTime = 5;
    //                     }
    //                     let endTime: any = Math.floor(startTime + 1.5);
    //
    //                     if (endTime % 1 != 0) {
    //                         endDTime = 5;
    //                     }
    //
    //                     let count: any = 22;
    //
    //                     for (var i = 0; i < 2; i++) {
    //                         count = count + 2;
    //                         let startDate = new Date(2016, 10, count, startTime, startDTime, 0);
    //                         var startD = startDate.getTime();
    //                         let endDate = new Date(2016, 10, count, endTime, endDTime, 0);
    //                         var endD = endDate.getTime();
    //
    //                         finalfinalSlot["appointment"].push({
    //                             id: "id" + T + M + i,
    //                             description: "Section: " + finalSlots[T][M]["section"] + ", Size: " + finalSlots[T][M]["size"],
    //                             location: "",
    //                             subject: finalSlots[T][M]["course"] + " (Room: " + finalSlots[T][M]["room"] + ")",
    //                             calendar: finalSlots[T][M]["room"].slice(0, 4),
    //                             start: new Date(startD),
    //                             end: new Date(endD)
    //                         });
    //                     }
    //                 }
    //             }
    //         }
    //     }
    //
    // }


    //require department AND/OR course number, year is default
    //function is to push perform query to REST
    //order by size
    //return
    //The 'size' of course number of pass + fail students in its largest section (max) that is not an overall section.
    //The number of sections = number of sections in 2014 divided by three and rounded up
    //return course number, size, section number
    async pushCoursesQuery(query: any) {
        let that = this;

        query.OPTIONS = {
            "COLUMNS": [
                "courses_dept",
                "courses_id",
                "courses_pass",
                "courses_fail",
                "courses_year"
            ],
            "ORDER": {
                "dir": "UP",
                "keys": ["courses_dept", "courses_id"]
            },
            "FORM": "TABLE"
        };

        query.SCHEDULING = {"TRUE": "yes"};

        console.log(JSON.stringify(query));


        let v = await that.performQuery(query);

        return v;
    }






    //require building name AND/OR distance from building X
    //function is to push perform query to REST
    //return Room_Names and Room_Seats
    async pushRoomsQuery(query: QueryRequest) {
        let that = this;


        query.OPTIONS = {
            "COLUMNS": [
                "rooms_name",
                "rooms_fullname",
                "rooms_lat",
                "rooms_lon",
                "rooms_seats"
            ],
            "ORDER": {
                "dir": "DOWN",
                "keys": ["rooms_seats", "rooms_name"]
            },
            "FORM": "TABLE"
        };

        let v = await that.performQuery(query);
        return v;
    }

    //require original point (building) get latlon
    //haversine formula
    //return list of buildings
    async perfromDistanceCheck(list: any, distance: any) {
        let that = this;
        let testRoom: any = {
            "WHERE": {

            }
        };
        testRoom["OPTIONS"] = {
            "COLUMNS": [
                "rooms_shortname",
                "rooms_lat",
                "rooms_lon"
            ],
            "ORDER": {
                "dir": "DOWN",
                "keys": ["rooms_shortname"]
            },
            "FORM": "TABLE"
        };
        testRoom["SCHEDULING"] = {"LatLon": list, "Distance": distance};

        let v = await that.performQuery(testRoom);

        return v;
    }

    //require schedule size (length)
    //require overflow schedule
    //divide overflow number by size
    //return
    performQuality() {

    }

    //propose adding new field for performQuery
    //to run calculations on that side over overwriting the function


}