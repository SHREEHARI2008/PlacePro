package com.campus.placement.config;

import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.util.Properties;

public class AppConfig {
    public static int SERVER_PORT = 8080;
    public static String DB_HOST = "localhost";
    public static int DB_PORT = 3306;
    public static String DB_NAME = "campus_placement_db";
    public static String DB_USER = "root";
    public static String DB_PASS = "root";

    static {
        loadProperties();
    }

    private static void loadProperties() {
        Properties props = new Properties();
        File propFile = new File("backend/db.properties");
        if (!propFile.exists()) {
            propFile = new File("db.properties");
        }

        if (propFile.exists()) {
            try (InputStream in = new FileInputStream(propFile)) {
                props.load(in);
                DB_HOST = props.getProperty("db.host", DB_HOST);
                DB_PORT = Integer.parseInt(props.getProperty("db.port", String.valueOf(DB_PORT)));
                DB_NAME = props.getProperty("db.name", DB_NAME);
                DB_USER = props.getProperty("db.user", DB_USER);
                DB_PASS = props.getProperty("db.password", DB_PASS);
                SERVER_PORT = Integer.parseInt(props.getProperty("server.port", String.valueOf(SERVER_PORT)));
                System.out.println("Loaded database configuration from: " + propFile.getAbsolutePath());
            } catch (Exception e) {
                System.err.println("Could not load db.properties, using defaults: " + e.getMessage());
            }
        }

        // Support environment variable overrides for container/cloud deployment
        if (System.getenv("DB_HOST") != null) DB_HOST = System.getenv("DB_HOST");
        if (System.getenv("DB_PORT") != null) {
            try { DB_PORT = Integer.parseInt(System.getenv("DB_PORT")); } catch (Exception ignored) {}
        }
        if (System.getenv("DB_NAME") != null) DB_NAME = System.getenv("DB_NAME");
        if (System.getenv("DB_USER") != null) DB_USER = System.getenv("DB_USER");
        if (System.getenv("DB_PASS") != null) DB_PASS = System.getenv("DB_PASS");
        if (System.getenv("DB_PASSWORD") != null) DB_PASS = System.getenv("DB_PASSWORD");
        if (System.getenv("PORT") != null) {
            try { SERVER_PORT = Integer.parseInt(System.getenv("PORT")); } catch (Exception ignored) {}
        }
    }

    public static String getDbUrl() {
        return "jdbc:mysql://" + DB_HOST + ":" + DB_PORT + "/" + DB_NAME + "?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC";
    }

    public static String getDbUrlNoDb() {
        return "jdbc:mysql://" + DB_HOST + ":" + DB_PORT + "/?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC";
    }
}
