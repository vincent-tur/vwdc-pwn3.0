import TargetProcess from "../TargetProcess";
import {Datasource} from "../../Datasource";

export default class UserStories extends TargetProcess{

    iterableObjs: Array<UserStories>;

    constructor(){
        super();

        // this.iterableObjs.push(new Datasource('https://v.tpondemand.com/api/v1/UserStories'));
        // this.iterableObjs.push(new UStorySource('https://v.tpondemand.com/api/v2/UserStory'));
    }
}