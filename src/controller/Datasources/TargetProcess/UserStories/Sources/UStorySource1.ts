import UserStories from "../UserStories";

export default class UStorySource1 extends UserStories {
    constructor(){
        super();
        this.dataUrlBase = 'https://v.tpondemand.com/api/v1/UserStories';
    }
}