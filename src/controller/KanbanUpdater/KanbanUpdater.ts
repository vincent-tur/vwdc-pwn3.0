export class KanbanUpdater {
    // ID 133: Today
    // ID 135: Tomorrow
    // ID 137: Week
    // ID 198: Future
    // ID 136: Backlog
    // ID 195: Done

    getItemsNeededLink(curId: string) {
        return "https://v.tpondemand.com/api/v1/UserStories?&include=[Id,PlannedStartDate]&where=(PlannedStartDate gte '2017-09-01')and(EntityState.Id eq " + curId + ")&access_token=MTpPcWtkaEVpaVZJQjhraXREUVc1UWRyRHdYWS9KOGdnUWFBT1pjSzJJd29FPQ==";
    }

    getUpdateStateLink(entityId: string, newStateId: string) {
        //TODO: POST to /api/v1/userstories/194 payload {EntityState:{Id:82}}
        // return 'https://v.tpondemand.com/api/v1/UserStories/' + entityId + '?access_token=MTpPcWtkaEVpaVZJQjhraXREUVc1UWRyRHdYWS9KOGdnUWFBT1pjSzJJd29FPQ==';

    }

    //TODO
    //var timeUntil = item.plannedStartDate - today
    //if(week <= timeUntil <= month){
    //  updateState(itemId, newStateId)
    //}

    getItemsNeedingUpdate(){
        // ID 133: Today
        // ID 135: Tomorrow
        // ID 137: Week
        // ID 198: Future
        // ID 136: Backlog
        // ID 195: Done
        var aryIds: {[id: string] : string} = { '133': 'TODAY',
                                                '135': 'TOMORROW',
                                                '137': 'WEEK',
                                                '<X>': 'MONTH',
                                                '198': 'FUTURE' };

        /*
        var aryIds2: {[id: string] : string} = [ {'id': '133', 'minMinutes': '0', 'maxMinutes': '1439'}, //TODAY (0-1.99 days)
                                                  {'id': '135', 'minMinutes': '1440', 'maxMinutes': '10079'}, //TOMORROW (2-3 days)
                                                   {'id': '137', 'minMinutes': '10080', 'maxMinutes': '43199'}, //WEEK (1-1.99 weeks)
                                                     {'id': 'X', 'minMinutes': '43200', 'maxMinutes': '86399'}, //MONTH (gets all time between 1-2 months. 1.99 months is considered in 1 month category
                                                        {'id': '198', 'minMinutes': '86400'}]; //FUTURE: GREATER THAN 2.0 MONTHS];
        */

        var that = this;
        return new Promise(function (fulfill, reject) {
            var request = require('request');

            //TODO: Convert to promise.all thing.
            for(let curId in aryIds){
                let link = that.getItemsNeededLink(curId);

                request(link, function(error: any, response: any, body: any){

                });
            }

        });
    }

    updateStates(entities: any){
        //entities: {[entityId: string] : string}
        //entities object: {[entityId: string] : newStateId}
        var that = this;
        return Promise.all(entities.map(function (entity: any) {
            return that.updateState(entity.id, entity.newStateId);
        }));
    }

    updateState(entityId: string, newStateId: string){
        var request = require('request');
        var that = this;

        return new Promise(function (fulfill, reject) {

            let link = that.getUpdateStateLink(entityId, newStateId);

            //TODO: MUST BE A POST!!! NOT GET.
            request(link, function (error: any, response: any, body: any) {

            });
        });
    }
}