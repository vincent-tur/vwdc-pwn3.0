export default class Room {
    [key: string]: any;
    rooms_fullname: string;
    rooms_shortname: string;

    rooms_address: string;
    rooms_number: string; //The room number. Not always a number, so represented as a string.
    rooms_name: string; //The room id; should be rooms_shortname+"_"+rooms_number.
    rooms_lat: number; //The latitude of the building. Instructions for getting this field are below.
    rooms_lon: number; //The longitude of the building. Instructions for getting this field are below.
    rooms_seats: number; //The number of seats in the room.
    rooms_type: string; //The room type (e.g., "Small Group").
    rooms_furniture: string; //The room type (e.g., "Classroom-Movable Tables & Chairs").
    rooms_href: string; //The link to full details online (e.g., "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/DMP-201").

    constructor(){

    }
}