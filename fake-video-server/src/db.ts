import { Database, DataTypes, Model, SQLite3Connector } from "../deps.ts";

const connector = new SQLite3Connector({
  filepath: "./database.sqlite",
});
const db = new Database(connector);

export class Clienthost extends Model {
  static table = "clienthosts";
  static timestamps = true;
  static fields = {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    host: DataTypes.TEXT,
  };
}

db.link([Clienthost]);
db.sync();
