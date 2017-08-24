import Room from "./Room";
export default class Building {
    [key: string]: any;
    Rooms: {[rooms_number: string] : Room};
    rooms_shortname: string;

    constructor(name: string) {
        this.Rooms = {};
        this.rooms_shortname = name;
    }

    addRoom(roomObj: Room){
        this.Rooms[roomObj.rooms_name] = roomObj;
    }
}