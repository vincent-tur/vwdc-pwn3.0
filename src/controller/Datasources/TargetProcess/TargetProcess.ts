import {Datasource} from "../Datasource";
import {isNullOrUndefined} from "util";

export default class TargetProcess extends Datasource{
    dataObj: any;
    dataUrlParams: {[paramName: string] : string};
    dataUrlBase: string;

    iterableUserStories: Array<Datasource>;
    iterableTasks: Array<Datasource>;

    constructor(){
        super();

        this.iterableUserStories = [];
        this.iterableTasks = [];
        this.dataObj.Tasks = [];
        this.dataObj.UserStories = {};
        this.addDatasources();
    }

    getURL(): {}{
        let urlObj = {
            url: this.dataUrlBase + "?access_token=" + this.dataUrlParams["access_token"] + "&select=" + this.dataUrlParams["select"] + "&take=" + this.dataUrlParams["take"],
        };
        return urlObj;
    }

    getData(): any{
        var that = this;
        return that.getTasks().then(function (){
            return  that.getUserStories().then(function (){
               console.log("Done getting TargetProcess Data");
            });
        });
    }

    getTasks(){

        return Promise.all(this.iterableTasks.map(function (datasourceObj){
            return datasourceObj.getData();
        })).then(values => {
           this.parseTasks(values);

        }, reason => {

            console.log('Failure [TargetProc Tasks GET]: ' + reason);
        });
    }

    parseTasks(taskSources: Array<{}>){
        var newValues: any = taskSources;
        var firstItemset: any = newValues[0].data.items;
        var secondItemset: any = newValues[1].data.items;
        if (isNullOrUndefined(firstItemset)){
            firstItemset = newValues[0].data.Items;
        }else if(isNullOrUndefined(secondItemset)){
            secondItemset = newValues[1].data.Items;
        }

        var returnItemset: any = [];
        if (firstItemset.length < secondItemset.length){
            //Must do this because the final return array will only have as much items as the firstItemset
            var tempItemset = firstItemset;
            firstItemset = secondItemset;
            secondItemset = tempItemset;
        }
        var counter = 0;
        var tempTracker: any = firstItemset.slice(0);
        Object.keys(firstItemset).forEach(function (keyFirst){
            if(counter <= secondItemset.length){
                Object.keys(secondItemset).forEach(function (keySecond){
                    var firstId = firstItemset[keyFirst].Id;
                    var secondId = secondItemset[keySecond].Id;
                    if(isNullOrUndefined(firstId)){
                        firstId = firstItemset[keyFirst].id;
                    }else if(isNullOrUndefined(secondId)){
                        secondId = secondItemset[keySecond].id;
                    }
                    // if(isNullOrUndefined(firstItemset.Id) == false &&  isNullOrUndefined(secondItemset.Id) == false){
                    if(firstId == secondId){

                        var curItem: any = {};
                        Object.keys(firstItemset[keyFirst]).forEach(function(propKeyItem1){
                            curItem[propKeyItem1] = firstItemset[keyFirst][propKeyItem1];
                        });
                        Object.keys(secondItemset[keySecond]).forEach(function(propKeyItem2){
                            curItem[propKeyItem2] = secondItemset[keySecond][propKeyItem2];
                        });
                        returnItemset.push(curItem);

                        // tempTracker.splice(parseInt(keyFirst), 1);

                    }
                    // }

                });
            }else{
                returnItemset.push(tempTracker[keyFirst]);
            }

            if(counter == 11){
                console.log('here');
            }
            counter++;
        });

        this.dataObj.Tasks = returnItemset;
    }
    getUserStories(){
        var that = this;
        return Promise.all(this.iterableUserStories.map(function (datasourceObj){
            return datasourceObj.getData();
        })).then(values => {
            var newValues: any = values;
            var firstItemset: any = newValues[0].data.items;
            var secondItemset: any = newValues[1].data.items;
            if (isNullOrUndefined(firstItemset)){
                firstItemset = newValues[0].data.Items;
            }else if(isNullOrUndefined(secondItemset)){
                secondItemset = newValues[1].data.Items;
            }
            var userStoriesAry: any  = firstItemset.concat(secondItemset);
            that.dataObj.UserStories = userStoriesAry;
        }, reason => {
            console.log('Failure [TargetProc UserStories GET]: ' + reason);
        });
    }
    addDatasources() {
        var buildUrl = require('build-url');
        var dataUrlParams: {[paramName: string] : string} = {};
        dataUrlParams['access_token'] = 'MTpPcWtkaEVpaVZJQjhraXREUVc1UWRyRHdYWS9KOGdnUWFBT1pjSzJJd29FPQ==';
        var dataSourcesJSON: Array<any> = [];

        //*****************
        //<UserStories>
        //*****************
        dataSourcesJSON.push({
            baseUrl: 'https://v.tpondemand.com/api/v1/UserStories',
            type: 'UserStories',
            queryParams: {
                access_token: 'MTpPcWtkaEVpaVZJQjhraXREUVc1UWRyRHdYWS9KOGdnUWFBT1pjSzJJd29FPQ==',
                where: 'project.program.name%20eq%20%27Academic%27',
                include: '[id,description]',
                format: 'json'
            }
        });
        dataSourcesJSON.push({
            baseUrl: 'https://v.tpondemand.com/api/v2/UserStory',
            type: 'UserStories',
            queryParams: {
                access_token: 'MTpPcWtkaEVpaVZJQjhraXREUVc1UWRyRHdYWS9KOGdnUWFBT1pjSzJJd29FPQ==',
                select: '{id:Id,focus:CustomValues.Get("Focus%20level").value,topic_hardness:CustomValues.Get("Topic%20hardness").value,study_importance:CustomValues.get("Importance%20to%20study").value,first_encounter:CustomValues["First%20encounter"]}',
                take: '5000'
            }
        });

        //*****************
        //</UserStories Sources>
        //<Tasks Sources>
        //*****************
        dataSourcesJSON.push({
            baseUrl: 'https://v.tpondemand.com/api/v1/Tasks',
            type: 'Tasks',
            queryParams: {
                access_token: 'MTpPcWtkaEVpaVZJQjhraXREUVc1UWRyRHdYWS9KOGdnUWFBT1pjSzJJd29FPQ==',
                where: 'project.program.name%20eq%20%27Academic%27',
                include: '[id,description]',
                format: 'json'
            }
        });

        dataSourcesJSON.push({
            baseUrl: 'https://v.tpondemand.com/api/v2/Tasks',
            type: 'Tasks',
            queryParams: {
                access_token: 'MTpPcWtkaEVpaVZJQjhraXREUVc1UWRyRHdYWS9KOGdnUWFBT1pjSzJJd29FPQ==',
                select: '{id:Id,focus:CustomValues.Get("Focus%20level").value,topic_hardness:CustomValues.Get("Topic%20hardness").value,study_importance:CustomValues.get("Importance%20to%20study").value,first_encounter:CustomValues["First%20encounter"]}',
                take: '5000'
            }
        });

        //*****************
        //</Tasks Sources>
        //*****************
        var that = this;
        for(var i = 0; i < dataSourcesJSON.length; i++){
            var curLink = buildUrl(dataSourcesJSON[i].baseUrl, {queryParams: dataSourcesJSON[i]['queryParams']});
            if(dataSourcesJSON[i].type == 'Tasks'){
                that.iterableTasks.push(new Datasource(curLink));
            }else if (dataSourcesJSON[i].type == 'UserStories'){
                that.iterableUserStories.push(new Datasource(curLink));
            }else{
                console.log("Invalid dataSourceJSON type");
            }

        }


    }



}