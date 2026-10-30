package com.campus.placement.config;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

/**
 * Singleton Database Connection Manager implementing JDBC connection pooling & handling.
 */
public class DBConnectionManager {
    private static DBConnectionManager instance;

    static {
        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
        } catch (ClassNotFoundException e) {
            System.err.println("MySQL JDBC Driver not found in classpath: " + e.getMessage());
        }
    }

    private DBConnectionManager() {}

    public static synchronized DBConnectionManager getInstance() {
        if (instance == null) {
            instance = new DBConnectionManager();
        }
        return instance;
    }

    public Connection getConnection() throws SQLException {
        return DriverManager.getConnection(AppConfig.getDbUrl(), AppConfig.DB_USER, AppConfig.DB_PASS);
    }

    public Connection getRootConnection() throws SQLException {
        return DriverManager.getConnection(AppConfig.getDbUrlNoDb(), AppConfig.DB_USER, AppConfig.DB_PASS);
    }
}
