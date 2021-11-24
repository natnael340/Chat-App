const mysql = require("mysql");
const dotenv = require("dotenv");

const query = (connection, querys, params) => {
  return new Promise((resolve, reject) => {
    connection.query(querys, [...params], (err, res) => {
      if (err) reject(err);
      else resolve(res);
    });
  });
};

function DB() {
  connection = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE,
  });
  this.connect = () => {
    connection.connect((error) => {
      if (error) {
        console.log(error);
      } else {
        console.log("Database Connected");
      }
    });
  };
  this.authenticate = (u, p) => {
    return query(
      connection,
      "SELECT id, password FROM users WHERE username = ? and is_active = 1;",
      [u]
    );
  };
  this.check = (u) => {
    return query(connection, "SELECT id FROM users WHERE username = ?", [u]);
  };
  this.register = (u, e, p) => {
    return query(
      connection,
      "INSERT INTO users(username,email,password, is_active) VALUES (?,?,?,1);",
      [u, e, p, u]
    );
  };
  this.storeRefreshToken = (t, u) => {
    return query(
      connection,
      "INSERT INTO refreshToken(token, username) values (?,?);",
      [t, u]
    );
  };
  this.getRefreshToken = (t) => {
    return query(
      connection,
      "SELECT token FROM refreshToken WHERE token = ?;",
      [t]
    );
  };
  this.removeRefreshToken = (u) => {
    return query(connection, "DELETE FROM refreshToken WHERE username = ?", [
      u,
    ]);
  };
  this.getUser = (u) => {
    return query(
      connection,
      "SELECT id, username, email FROM users WHERE username = ? ",
      [u]
    );
  };
  this.getMessages = (u) => {
    return query(
      connection,
      "SELECT CASE WHEN c.creator_id = ? THEN c.title ELSE( SELECT username FROM users WHERE id = creator_id ) END AS title, c.last_message, c.created_at, c.unseen, c.id FROM conversations AS c JOIN participants AS p ON c.id = p.conversation_id WHERE p.user_id = ? ORDER BY c.created_at DESC",
      [u, u]
    );
  };
  this.getMessage = (u) => {
    return query(
      connection,
      "SELECT m.message, u.username as sender, m.created_at FROM messages as m JOIN users as u on m.sender_id = u.id WHERE m.conversation_id=? and (SELECT p.conversation_id FROM participants as p WHERE p.user_id = ? LIMIT 1) = ? ORDER BY m.created_at ASC;",
      [u[0], u[1], u[0]]
    );
  };
  this.newMessage = (u) => {
    if (u.cid) {
      query(
        connection,
        "UPDATE conversations SET last_message = ? WHERE id = ?",
        [u.message, u.cid, u.cid, u.uid, u.message]
      );
      return query(
        connection,
        "INSERT INTO messages(conversation_id, sender_id, message_type, message,guid) values (?,?,'text',?,'5f6cab4c-29b8-4c93-81ad-26faf91d8a4a');",
        [u.cid, u.uid, u.message]
      );
    }
  };
}
module.exports = { DB };
