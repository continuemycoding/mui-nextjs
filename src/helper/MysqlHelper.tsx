import * as mysql from 'mysql';

export default class MysqlHelper {

    private static pool = mysql.createPool({
        connectionLimit: 100,
        connectTimeout: 100000,
        acquireTimeout: 100000,
        host: 'localhost',
        user: 'root',
        password: 'afbc32f5-198e-4005-a8f5-372ed9dc4525',
        database: 'gamedb',
        port: 3306
    });

    public static async query(sql: string, args:any[] = []): Promise<any> {

        return new Promise((resolve, reject) => {
            let mysql = sql;

            for (let i = 0; i < args.length; i++) {
                let index = mysql.indexOf("?");
                let v = typeof args[i] == "undefined" ? "null" : (typeof args[i] == "string" ? "\"" + args[i] + "\"" : args[i]);
                if (v && v.__proto__ == Date.prototype)
                    v = "\"" + v.toLocaleString() + "\"";
                mysql = mysql.substring(0, index) + v + mysql.substring(index + 1);
            }

            console.log(mysql);

            this.pool.getConnection(function (err, connection) {

                if (err) {
                    console.error(err);
                    connection && connection.destroy();
                    resolve(err);
                    return;
                }

                connection.query(sql, args, function (error, results, fields) {

                    if (error) {
                        console.error("--------------------------------------------------");
                        console.error("sql:\t" + mysql);
                        console.error(error);
                        console.error("--------------------------------------------------");
                    }

                    resolve(error || results);

                    connection.release();
                });
            });
        });
    }
}
