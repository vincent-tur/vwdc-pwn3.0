import {Datasource} from "../Datasource";

export default class TargetProcess extends Datasource{
    dataObj: {};
    dataUrlParams: {[paramName: string] : string};
    dataUrlBase: string;

    iterableDatasources: Array<Datasource>;

    constructor(){
        super();
        this.iterableDatasources = [];
        this.addDatasources();
    }

    getURL(): {}{
        let urlObj = {
            url: this.dataUrlBase + "?access_token=" + this.dataUrlParams["access_token"] + "&select=" + this.dataUrlParams["select"] + "&take=" + this.dataUrlParams["take"],
        };
        return urlObj;
    }

    getData(): any{
        var getDatasources = Promise.all(this.iterableDatasources.map(function (datasourceObj){
            return datasourceObj.getData();
        })).then(values => {
            this.dataObj = values;
        }, reason => {

            console.log(reason);
        });
       return getDatasources;

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
            queryParams: {
                access_token: 'MTpPcWtkaEVpaVZJQjhraXREUVc1UWRyRHdYWS9KOGdnUWFBT1pjSzJJd29FPQ==',
                where: 'project.program.name%20eq%20%27Academic%27',
                include: '[id,description]',
                format: 'json'
            }
        });
        dataSourcesJSON.push({
            baseUrl: 'https://v.tpondemand.com/api/v2/UserStory',
            queryParams: {
                access_token: 'MTpPcWtkaEVpaVZJQjhraXREUVc1UWRyRHdYWS9KOGdnUWFBT1pjSzJJd29FPQ==',
                select: '{id,focus:CustomValues.Get("Focus%20level").value,topic_hardness:CustomValues.Get("Topic%20hardness").value,study_importance:CustomValues.get("Importance%20to%20study").value,first_encounter:CustomValues["First%20encounter"]}',
                take: '5000'
            }
        });

        //*****************
        //</UserStories Sources>
        //<Tasks Sources>
        //*****************
        dataSourcesJSON.push({
            baseUrl: 'https://v.tpondemand.com/api/v1/Tasks',
            queryParams: {
                access_token: 'MTpPcWtkaEVpaVZJQjhraXREUVc1UWRyRHdYWS9KOGdnUWFBT1pjSzJJd29FPQ==',
                where: 'project.program.name%20eq%20%27Academic%27',
                include: '[id,description]',
                format: 'json'
            }
        });

        dataSourcesJSON.push({
            baseUrl: 'https://v.tpondemand.com/api/v2/Tasks',
            queryParams: {
                access_token: 'MTpPcWtkaEVpaVZJQjhraXREUVc1UWRyRHdYWS9KOGdnUWFBT1pjSzJJd29FPQ==',
                select: '{id,focus:CustomValues.Get("Focus%20level").value,topic_hardness:CustomValues.Get("Topic%20hardness").value,study_importance:CustomValues.get("Importance%20to%20study").value,first_encounter:CustomValues["First%20encounter"]}',
                take: '5000'
            }
        });

        //*****************
        //</Tasks Sources>
        //*****************
        var that = this;
        for(var i = 0; i < dataSourcesJSON.length; i++){
            var curLink = buildUrl(dataSourcesJSON[i].baseUrl, {queryParams: dataSourcesJSON[i]['queryParams']});
            that.iterableDatasources.push(new Datasource(curLink));
        }


    }


}