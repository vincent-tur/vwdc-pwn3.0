export class KanbanUpdater {
    // ID 133: Today
    // ID 135: Tomorrow
    // ID 137: Week
    // ID 198: Future
    // ID 136: Backlog
    // ID 195: Done

    getItemsNeededLink(curId: string){
        return 'https://v.tpondemand.com/api/v1/UserStories?&include=[Id,PlannedEndDate]&where=(PlannedEndDate gte \'2017-09-01\')and(EntityState.Id eq ' + curId + ')&access_token=MTpPcWtkaEVpaVZJQjhraXREUVc1UWRyRHdYWS9KOGdnUWFBT1pjSzJJd29FPQ==';
    }

    getUpdateStateLink(entityId: string, newStateId: string){
        //TODO: POST to /api/v1/userstories/194 payload {EntityState:{Id:82}}
        // return 'https://v.tpondemand.com/api/v1/UserStories/' + entityId + '?access_token=MTpPcWtkaEVpaVZJQjhraXREUVc1UWRyRHdYWS9KOGdnUWFBT1pjSzJJd29FPQ==';

    }

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