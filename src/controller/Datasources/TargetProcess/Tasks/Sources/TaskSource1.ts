import Tasks from "../Tasks";

export default class TaskSource1 extends Tasks{

    constructor(){
        super();
        this.dataUrlBase = 'https://v.tpondemand.com/api/v1/Tasks';
    }
}