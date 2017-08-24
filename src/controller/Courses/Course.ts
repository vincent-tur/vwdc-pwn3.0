import CourseSection from "./CourseSection";
import {isNullOrUndefined} from "util";

export default class Course {

	CourseSections: {[course_uuid: string] : CourseSection}

	courses_dept: string;
	courses_title: string;
	courses_id: string;
	

	constructor(courses_dept: string, courses_title: string, courses_id: string) {
		this.courses_dept = courses_dept; //resultToExtract.Subject;
		this.courses_title = courses_title; //resultToExtract.Course;
		this.courses_id = courses_id; //resultToExtract.Title;
		this.CourseSections = {};
	}

    saveDatasetToDiskHelper(memoryFolder: string){
        var fs =require('fs');
        var that = this;
        var memoryPath: string = memoryFolder + that.courses_dept + "/" + that.courses_id + ".json";
        Object.keys(that.CourseSections).forEach(function (course_uuid: string){
            let tempJson: {[property: string] : any}  = that.CourseSections[course_uuid].saveDatasetToDisk();
            tempJson["courses_dept"] = that.courses_dept;
            tempJson["courses_title"] = that.courses_title;
            tempJson["courses_id"] = that.courses_id;

            let stringJson: string = JSON.stringify(tempJson);

            fs.appendFileSync(memoryPath, stringJson);
        });
    }

	addNewCourseSection(resultToExtract: any){
		var courseSecObj: CourseSection = new CourseSection();
		courseSecObj.courses_dept = resultToExtract.Subject;
		courseSecObj.courses_title = resultToExtract.Title;
		courseSecObj.courses_id = resultToExtract.Course;

		courseSecObj.courses_avg = resultToExtract.Avg;
		courseSecObj.courses_instructor = resultToExtract.Professor;

		courseSecObj.courses_pass = resultToExtract.Pass;
		courseSecObj.courses_fail = resultToExtract.Fail;
		courseSecObj.courses_audit = resultToExtract.Audit;
		courseSecObj.courses_uuid = resultToExtract.id;

		if(!isNullOrUndefined(resultToExtract.Section) && resultToExtract.Section == "overall"){
			courseSecObj.courses_year = 1900;
		}else{
			courseSecObj.courses_year = resultToExtract.Year;
		}

		this.CourseSections[courseSecObj.courses_uuid] = courseSecObj;
	}
}