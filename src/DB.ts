import Database from 'better-sqlite3';
import path from 'path';

export class DB{
    public static db: Database.Database;
    constructor(){
        DB.db = new Database(path.join(__dirname, 'database.db'));
        if(!DB.checkIfDatabaseInitialised()){
            DB.init();
        }
    }

    // Create table preference with user id, group info and sub group info
    public static init(){
        DB.db.prepare(`CREATE TABLE IF NOT EXISTS preference (
            id INTEGER PRIMARY KEY,
            filiere VARCHAR(150) NOT NULL,
            groupe VARCHAR(150) NOT NULL
          );`).run();
    }

    public static checkIfDatabaseInitialised(){
        try{
            if(DB.db.prepare(`SELECT * FROM preference`).get()){
                return true;
            } else {
                return false;
            }
        } catch(e) {
            console.log("Created database!");
            return false;
        }
    }

    public static checkIfUserExists(id: string){
        try {
            return DB.db.prepare(`SELECT * FROM preference WHERE id = ?`).get(id) !== undefined;
        } catch (e) {
            console.log(e);
            return false;
        }
    }

    public static addUser(id: string, group: string, subgroup: string){
        try{
            if(DB.checkIfUserExists(id)){
                return false;
            } else {
                return DB.db.prepare(`INSERT INTO preference VALUES (?, ?, ?)`).run(id, group, subgroup).changes;
            }
        } catch(e){
            console.log(e);
            return false;
        }
    }

    public static removeUser(id: string){
        try{
            DB.db.prepare(`DELETE FROM preference WHERE id = ?`).run(id).changes;
        } catch(e){
            console.log(e);
            return false;
        }
        return true;
    }

    public static getUser(id: string){
        try{
            return DB.db.prepare(`SELECT * FROM preference WHERE id = ?`).get(id);
        } catch(e){
            console.log(e);
            return false;
        }
    }


}

export default DB;