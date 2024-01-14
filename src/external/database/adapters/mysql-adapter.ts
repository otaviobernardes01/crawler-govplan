import mysql from "mysql2";

export class MysqlAdapter {
    mysql: any;

    constructor() {
        this.mysql = mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            decimalNumbers: true,
        })
    }

    async query(statement: string): Promise<any> {
        return new Promise((resolve, reject) => {
            this.mysql.query(statement,
                (err: any, result: any) => {
                    if (err) reject(err)
                    resolve(result)
                }
            );
        });
    }
}