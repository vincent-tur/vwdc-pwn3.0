import UserStories from "UserStories";

export default class UStorySource extends UserStories {
    constructor(dataUrlBase: string){
        super();
        super.dataUrlBase = dataUrlBase;
    }
}