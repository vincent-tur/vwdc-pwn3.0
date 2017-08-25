import UserStories from "../UserStories";

export default class UStorySource2 extends UserStories {
    constructor(){
        super();
        this.dataUrlBase = 'https://v.tpondemand.com/api/v2/UserStory';
    }
}