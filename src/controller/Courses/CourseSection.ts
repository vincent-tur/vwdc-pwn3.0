

export default class CourseSection{
    [key: string]: any;
    courses_uuid: string;

    courses_avg: number;
    courses_instructor: string;
    courses_pass: number;
    courses_fail: number;
    courses_audit: number;

    courses_dept: string;
    courses_title: string;
    courses_id: string;

    courses_year: number;
    constructor(){
    }

    saveDatasetToDisk(): {[property: string] : any} {
        var tempJson: {[property: string] : any} = {};
        for(var propertyName in this) {
            tempJson[propertyName] = this[propertyName];
        }
        return tempJson;
    }
}