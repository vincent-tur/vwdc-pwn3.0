import {Datasource} from "../Datasource";

export default class TargetProcess extends Datasource{
    dataObj: {};
    dataUrlParams: {[paramName: string] : string};
    dataUrlBase: string;

    constructor(){
        super();


        this.dataUrlParams['access_token'] = 'MTpPcWtkaEVpaVZJQjhraXREUVc1UWRyRHdYWS9KOGdnUWFBT1pjSzJJd29FPQ==';
        this.dataUrlParams['select'] = '{id,focus:CustomValues.Get(%22Focus%20level%22).value,topic_hardness:CustomValues.Get(%22Topic%20hardness%22).value,study_importance:CustomValues.get(%22Importance%20to%20study%22).value,first_encounter:CustomValues[%22First%20encounter%22]}';
        this.dataUrlParams['take'] = '5000';

    }

    getURL(): {}{
        let urlObj = {
            url: this.dataUrlBase + "?access_token=" + this.dataUrlParams["access_token"] + "&select=" + this.dataUrlParams["select"] + "&take=" + this.dataUrlParams["take"],
        };
        return urlObj;
    }


}