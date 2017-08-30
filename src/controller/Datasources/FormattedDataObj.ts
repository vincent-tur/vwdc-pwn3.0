import {isNullOrUndefined} from "util";

export default class FormattedDataObj {
    dataObj: {[key: string] : any};

    constructor(){
        this.dataObj = {};
    }

    insert(entry: any){

        var entryId = entry.id;
        if(entryId == null){
            entryId = entry.Id;
        }

        if(isNullOrUndefined(this.dataObj[entryId])){
            this.dataObj[entryId] = entry;
        }else{
            Object.keys(entry).forEach(prop => {
                var formattedProp = prop.toLowerCase();
                // if(prop != 'Id' && prop != 'id'){
                    this.dataObj[entryId][formattedProp] = entry[prop];
                // }
            });
        }
    }


    getItemset(){
        return Object.keys(this.dataObj).map(key => {
            return this.dataObj[key];
        });
    }
}