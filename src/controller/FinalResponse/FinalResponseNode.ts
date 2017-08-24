/**
 * Created by V on 2017-02-05.
 */
export default class FinalResponseNode {
    [key: string]: any;
    subResult: {[key: string] : any};
    left: FinalResponseNode;
    right: FinalResponseNode;

    constructor(subResult: {[key: string] : any}){
        this.subResult = subResult;
        this.left = null;
        this.right = null;
    }
}