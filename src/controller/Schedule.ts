// import InsightFacade from "./InsightFacade";
// import  {IInsightFacade, InsightResponse, QueryRequest} from "./IInsightFacade";
// import DataSetManager from "./DataSetManager";
//
//
// /**
//  * Created by darrenlow on 2017-03-23.
//  */
//
//
// export default class Schedule extends InsightFacade{
//
//     dataSetManager: DataSetManager;
//
//     //require list of rooms
//     //takes list and loops
//     //creates empty slots {key: x(M or T), value: empty, room: , size: }
//     //returns (list of M, list of T)
//     //M is Monday, Wednesday, Friday (9 slots)
//     //T is Tuesday, Thursday (6 slots)
//     async createEmptySlot(roomQuery: QueryRequest, extra: string) {
//         let that = this;
//
//         let listOfRooms: any = await that.pushRoomsQuery(roomQuery);
//
//         let roomSlots: any = [];
//
//         for (var i = 0; i < listOfRooms.body.result.length; i++) {
//             let roomsOne = listOfRooms[i];
//             for (var M = 0; M < 9; M++) {
//                 roomSlots.push({
//                     key: M + "M",
//                     value: undefined,
//                     room: roomsOne,
//                     size: roomsOne
//                 });
//             }
//
//             for (var T = 0; T < 6; T++) {
//                 roomSlots.push({
//                     key: T + "T",
//                     value: undefined,
//                     room: roomsOne,
//                     size: roomsOne
//                 });
//             }
//         }
//
//         return roomSlots;
//     }
//
//     //requires (list of M, list of T)
//     //requires list of Courses
//     //add value to list
//     //checkQuality before finalizing
//     //return schedule
//     async performSchedule(roomQuery: QueryRequest, courseQuery: QueryRequest) {
//         let that = this;
//
//         let roomSlots: any = await that.createEmptySlot(roomQuery, "N");
//         let getCourses: any = await that.pushCoursesQuery(courseQuery);
//         let fulfilled = "F";
//
//         let courseSlots: any = getCourses.body.result;
//
//         // roomSlots.sort(function (a: any, b: any) {
//         //     return b.size - a.size;
//         // });
//         //
//         // getCourses.body.result.sort(function (a: any, b: any) {
//         //     return b.size - a.size;
//         // });
//
//         let checkArray = [];
//
//         for (let i = 0; i < roomSlots.length; i++) {
//             for (let g = 0; g < courseSlots.length; g++) {
//                 if (roomSlots[i].value = undefined && courseSlots[g].size < roomSlots[i].size && compareArray(checkArray, roomSlots[i].key, courseSlots[g].courses_course)) {
//                     roomSlots[i].value = courseSlots[g].courses_course;
//
//                     checkArray.push(roomSlots[i].key, courseSlots[g].courses_course);
//
//                     var indexCourses = courseSlots.indexOf(courseSlots[g]);
//
//                     if (indexCourses > -1) {
//                         courseSlots.splice(indexCourses, 1);
//                     }
//
//                     fulfilled = "T";
//                 } else {
//                     if (fulfilled = "F") {
//                         roomSlots.push(this.createEmptySlot(roomQuery, "Y"));
//                     }
//                 }
//             }
//         }
//
//         function compareArray(array: any, rooms: any, course: any) {
//             //check course with course
//             //check if rooms = rooms
//             //if = return false
//             //if != return true
//
//             for (var i = 0; i < array.length; i++) {
//                 let checkElement = array[i];
//                 if (checkElement[1] = course) {
//                     if (checkElement[2] = rooms) {
//                         return false;
//                     }
//                 }
//             }
//
//             return true;
//         }
//     }
//
//
//     //require department AND/OR course number, year is default
//     //function is to push perform query to REST
//     //order by size
//     //return
//     //The 'size' of course number of pass + fail students in its largest section (max) that is not an overall section.
//     //The number of sections = number of sections in 2014 divided by three and rounded up
//     //return course number, size, section number
//     async pushCoursesQuery(query: QueryRequest) {
//         let that = this;
//
//         query.SCHEDULING = {trueFalse: "T"};
//
//         let v = await that.performQuery(query);
//         return v;
//     }
//
//     //require building name AND/OR distance from building X
//     //function is to push perform query to REST
//     //return Room_Names and Room_Seats
//     async pushRoomsQuery(query: QueryRequest) {
//         let that = this;
//
//         let v = await that.performQuery(query);
//         return v;
//     }
//
//     //require list of courses that went to overflow rooms
//     //require number of courses
//     //divide overflow number by number of courses
//     //return
//     performQuality() {
//
//     }
//
//     //propose adding new field for performQuery
//     //to run calculations on that side over overwriting the function
//
//
// }
