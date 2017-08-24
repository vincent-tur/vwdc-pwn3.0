import Course from "./Course";
export default class Department {
    courses_dept: string;
    Courses: {[course_name: string] : Course};

    constructor(courses_dept: string) {
        this.Courses = {};
        this.courses_dept = courses_dept;
    }

    saveDatasetToDiskHelper(memoryFolder: string){
        var fs = require('fs');
        var dir: string = memoryFolder + this.courses_dept;
        if (!fs.existsSync(dir)){ fs.mkdirSync(dir); }

        var that = this;
        Object.keys(this.Courses).forEach(function (course_name: string) {
            that.Courses[course_name].saveDatasetToDiskHelper(memoryFolder);
        });
    }

    addCourse(courseObj: Course){
        this.Courses[courseObj.courses_id] = courseObj;
    }
}