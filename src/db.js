const mysql = require('mysql');
const dotenv = require('dotenv');

dotenv.config();

class DB {
  constructor() {
    this.connection = null;
    this.pool = mysql.createPool({
      host: process.env.HOST,
      user: process.env.USER_NAME,
      password: process.env.PASSWORD,
      database: process.env.DATABASE,
      ...(process.env.NODE_ENV !== 'PRODUCTION' && {
        socketPath: process.env.SOCKET_PATH,
      }),
    });
  }

  query = ({ query, data, isArray }) =>
    new Promise((resolve, reject) => {
      this.pool.getConnection((connError, connection) => {
        this.connection = connection;

        if (connError) {
          connection.release();
          reject(connError);
        }

        connection.query(query, data, (queryError, result) => {
          connection.release();
          if (queryError) {
            reject(queryError);
          } else {
            resolve(isArray === false ? result[0] : result);
          }
        });
      });
    });
}

module.exports = DB;
