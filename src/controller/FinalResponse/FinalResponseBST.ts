import FinalResponseNode from "./FinalResponseNode";
import {isNullOrUndefined} from "util";
import {isNull} from "util";

/**
 * Created by V on 2017-02-05.
 */
export default class FinalResponseBST {

    root: FinalResponseNode = null;
    sortByKey: any;
    direction: string;
    finalResult: Array<any>;


    constructor(sortByKey: string = "NONE", direction: any = "UP"){
        this.root = null;
        this.finalResult = [];
        this.sortByKey = sortByKey;
        this.direction = direction;
    }

    setDirection(dir: string){
        if(!isNullOrUndefined(dir)){
            this.direction = dir;
        }
    }
    setSortByKeys(keys: any){
        this.sortByKey = keys;
    }

    insert(subResult: {[key: string] : any} = {}){
        if(this.sortByKey == "NONE"){
            this.finalResult.push(subResult);
        }else{
            if (isNullOrUndefined(this.root)){
                this.root = new FinalResponseNode(subResult);
            }else{
                var newNode = new FinalResponseNode(subResult);
                this.insertHelper(this.root, newNode);
            }
        }
    }

    insertHelper(checkNode: FinalResponseNode, newNode: FinalResponseNode){
        let checkNodeValue = checkNode.subResult[this.sortByKey];
        let newNodeValue = newNode.subResult[this.sortByKey];

        if (typeof this.sortByKey == "object") {
            let fulfilled: any = false;

            if (this.direction == "UP") {
                if (checkNode.subResult[this.sortByKey[0]] > newNode.subResult[this.sortByKey[0]]) {
                    if (!isNull(checkNode.left)) {
                        this.insertHelper(checkNode.left, newNode);
                    } else {
                        checkNode.left = newNode;
                    }
                }
                else {
                    if (checkNode.subResult[this.sortByKey[0]] == newNode.subResult[this.sortByKey[0]]) {
                        if (1 == this.sortByKey.length) {
                            if (!isNull(checkNode.right)) {
                                this.insertHelper(checkNode.right, newNode);
                            } else {
                                checkNode.right = newNode;
                            }
                        }

                        for (var i = 1; i < this.sortByKey.length; i++) {
                            if (fulfilled == false) {
                                if (checkNode.subResult[this.sortByKey[i]] > newNode.subResult[this.sortByKey[i]]) {
                                    if (!isNull(checkNode.left)) {
                                        this.insertHelper(checkNode.left, newNode);
                                        fulfilled = true;
                                    } else {
                                        checkNode.left = newNode;
                                        fulfilled = true;
                                    }
                                }
                                if (checkNode.subResult[this.sortByKey[i]] < newNode.subResult[this.sortByKey[i]]) {
                                    if (!isNull(checkNode.right)) {
                                        this.insertHelper(checkNode.right, newNode);
                                        fulfilled = true;
                                    } else {
                                        checkNode.right = newNode;
                                        fulfilled = true;
                                    }
                                }
                            }
                            if (checkNode.subResult[this.sortByKey[i]] == newNode.subResult[this.sortByKey[i]]) {
                                if (i + 1 == this.sortByKey.length) {
                                    if (!isNull(checkNode.right)) {
                                        this.insertHelper(checkNode.right, newNode);
                                    } else {
                                        checkNode.right = newNode;
                                    }
                                    fulfilled = true;
                                }
                                fulfilled = false;
                            }
                        }
                    }
                    if (checkNode.subResult[this.sortByKey[0]] < newNode.subResult[this.sortByKey[0]]) {
                        if (!isNull(checkNode.right)) {
                            this.insertHelper(checkNode.right, newNode);
                        } else {
                            checkNode.right = newNode;
                        }
                    }
                }
            }
            if (this.direction == "DOWN") {
                if (checkNode.subResult[this.sortByKey[0]] > newNode.subResult[this.sortByKey[0]]) {
                    if (!isNull(checkNode.right)) {
                        this.insertHelper(checkNode.right, newNode);
                    } else {
                        checkNode.right = newNode;
                    }
                }
                else {
                    if (checkNode.subResult[this.sortByKey[0]] == newNode.subResult[this.sortByKey[0]]) {
                        if (1 == this.sortByKey.length) {
                            if (!isNull(checkNode.right)) {
                                this.insertHelper(checkNode.right, newNode);
                            } else {
                                checkNode.right = newNode;
                            }
                        }

                        for (var i = 1; i < this.sortByKey.length; i++) {
                            if (fulfilled == false) {
                                if (checkNode.subResult[this.sortByKey[i]] > newNode.subResult[this.sortByKey[i]]) {
                                    if (!isNull(checkNode.right)) {
                                        this.insertHelper(checkNode.right, newNode);
                                        fulfilled = true;
                                    } else {
                                        checkNode.right = newNode;
                                        fulfilled = true;
                                    }
                                }
                                if (checkNode.subResult[this.sortByKey[i]] < newNode.subResult[this.sortByKey[i]]) {
                                    if (!isNull(checkNode.left)) {
                                        this.insertHelper(checkNode.left, newNode);
                                        fulfilled = true;
                                    } else {
                                        checkNode.left = newNode;
                                        fulfilled = true;
                                    }
                                }
                            }
                            if (checkNode.subResult[this.sortByKey[i]] == newNode.subResult[this.sortByKey[i]]) {
                                if (i + 1 == this.sortByKey.length) {
                                    if (!isNull(checkNode.right)) {
                                        this.insertHelper(checkNode.right, newNode);
                                    } else {
                                        checkNode.right = newNode;
                                    }
                                    fulfilled = true;
                                }
                                fulfilled = false;
                            }
                        }
                    }
                    if (checkNode.subResult[this.sortByKey[0]] < newNode.subResult[this.sortByKey[0]]) {
                        if (!isNull(checkNode.left)) {
                            this.insertHelper(checkNode.left, newNode);
                        } else {
                            checkNode.left = newNode;
                        }
                    }
                }
            }
        }
        if (typeof this.sortByKey == "string") {
            if (this.direction == "UP") {
                if (checkNode.subResult[this.sortByKey] > newNode.subResult[this.sortByKey]) {
                    if (!isNull(checkNode.left)) {
                        this.insertHelper(checkNode.left, newNode);
                    } else {
                        checkNode.left = newNode;
                    }
                }
                else {
                    if (!isNull(checkNode.right)) {
                        this.insertHelper(checkNode.right, newNode);
                    } else {
                        checkNode.right = newNode;
                    }
                }
            }
            if (this.direction == "DOWN") {
                if (checkNode.subResult[this.sortByKey] > newNode.subResult[this.sortByKey]) {
                    if (!isNull(checkNode.right)) {
                        this.insertHelper(checkNode.right, newNode);
                    } else {
                        checkNode.right = newNode;
                    }
                }
                else {
                    if (!isNull(checkNode.left)) {
                        this.insertHelper(checkNode.left, newNode);
                    } else {
                        checkNode.left = newNode;
                    }
                }
            }
        }


        /*function checkLeftRight(checkNode: any) {
            let trueFalse = false;
            if (checkNode.left != null) {
                if (checkNode.left.subResult != newNode.subResult) {
                    trueFalse = true;
                } else {
                    trueFalse = false;
                }
            }
            if (checkNode.right != null) {
                if (checkNode.right.subResult != newNode.subResult) {
                    trueFalse = true;
                } else {
                    trueFalse = false;
                }
            }
            return trueFalse;
        }*/
    }

    /*doComparison(greaterValueNode: FinalResponseNode, lesserValueNode: FinalResponseBST){

    }*/
    getFinalResult(){
        if(this.sortByKey != "NONE"){
            this.sortResults();
        }
        return this.finalResult;
    }

    sortResults (){
        this.sortResultsHelper(this.root);
    }
    sortResultsHelper(node: FinalResponseNode){
        if(node == null)
            return;
        this.sortResultsHelper(node.left);
        this.finalResult.push(node.subResult);
        this.sortResultsHelper(node.right);
    }
}