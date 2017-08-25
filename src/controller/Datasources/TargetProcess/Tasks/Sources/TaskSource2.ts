import Tasks from "../Tasks";

export default class TaskSource2 extends Tasks{

    constructor(){
        super();
        this.dataUrlBase = 'https://v.tpondemand.com/api/v2/Tasks';
    }
}