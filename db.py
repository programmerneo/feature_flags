from flask_pymongo import PyMongo
import pyodbc

mongo = PyMongo()


class SQL_DB:

    def __init__(self):
        self.sql_conn_info = 'DRIVER={ODBC Driver 17 for SQL Server};SERVER=10.164.0.245;DATABASE=AssetManager;UID=gaiello;PWD=streaming'
        self.sql_conn = None
        self.sql_cursor = None

    def get_connection(self):
        if not self.sql_conn:
            self.sql_conn = pyodbc.connect(self.sql_conn_info)
        return self.sql_conn

    def get_cursor(self):
        if not self.sql_conn:
            self.get_connection()

        if not self.sql_cursor:
            sql_conn = self.get_connection()
            self.sql_cursor = sql_conn.cursor()
        return self.sql_cursor

    def execute(self, sql):
        sql_cursor = self.get_cursor()
        return sql_cursor.execute(sql)

    def close_cursor(self):
        self.sql_cursor.close()

    def close_connection(self):
        self.sql_conn.close()

    def close(self):
        self.close_cursor()
        self.close_connection()
