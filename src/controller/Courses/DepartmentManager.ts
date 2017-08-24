import Course from "./Course";
import Department from "./Department";
import {isNullOrUndefined} from "util";
import DataSetManager from "../DataSetManager";
import {InsightResponse} from "../IInsightFacade";

export default class DepartmentManager {

    Departments: {[dept_name: string] : Department};
    currentMemoryId: string = null;

    constructor(currentMemoryId: string) {
        this.Departments = {};
        this.currentMemoryId = currentMemoryId;
    }


    getMemoryFolder(idToGet: string = this.currentMemoryId): string{
        return DataSetManager.baseMemoryFolder + "/" + idToGet + "/";
    }
    clearDataSetInMemory(){
        this.Departments = {};
    }

    receivedActualContent(): boolean {
        return (Object.keys(this.Departments).length > 0);
    }
    saveDatasetToDisk(id: string, content: string){

        var that = this;
        var dir2: string = this.getMemoryFolder(id);

        Object.keys(that.Departments).forEach(function (dept_name: string) {
            that.Departments[dept_name].saveDatasetToDiskHelper(dir2);
        });
    }

    addCourse(courseObj: Course){

        //  Check if Department has already been added.
        //  If doesn't exist, add it and then add course to it.
        //  Otherwise add to existing department obj
        if (this.Departments === null || Object.keys(this.Departments).indexOf(courseObj.courses_dept) === -1) {
            this.addDepartment(courseObj.courses_dept);
        }
        this.Departments[courseObj.courses_dept].addCourse(courseObj);

    }
    addDepartment(dept_name: string) {
        this.Departments[dept_name] = new Department(dept_name);
    }

    convertDataToObject(fileData: string): Promise<any>{
        var that = this;
        return new Promise(function (fulfill, reject){
            Promise.resolve(JSON.parse(fileData)).then(function (fileDataJSON: any) {
                //Checks if file contents are {"result":[],"rank":0} and is valid
                if (isNullOrUndefined(fileDataJSON.result) || fileDataJSON.result == 0) {
                    reject("Valid JSON but contains no contents");
                    return;
                }

                var resultToExtract = fileDataJSON.result[0];


                var courseObj = new Course(resultToExtract.Subject, resultToExtract.Title, resultToExtract.Course);

                Object.keys(fileDataJSON.result).forEach(function (objectKey: string){
                    resultToExtract = fileDataJSON.result[objectKey];
                    courseObj.addNewCourseSection(resultToExtract);

                });

                that.addCourse(courseObj);
                fulfill('added course');
                return;
            });


        });

    }




}