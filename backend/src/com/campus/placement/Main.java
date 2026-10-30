package com.campus.placement;

import com.campus.placement.config.AppConfig;
import com.campus.placement.controller.ApiRouter;
import com.campus.placement.util.DatabaseInitializer;
import com.sun.net.httpserver.HttpServer;

import java.net.InetSocketAddress;
import java.util.concurrent.Executors;

public class Main {
    public static void main(String[] args) {
        System.out.println("==================================================================");
        System.out.println("    CAMPUS PLACEMENT MANAGEMENT SYSTEM - JAVA BACKEND SERVER     ");
        System.out.println("==================================================================");

        try {
            // 1. Initialize Database Schema & Seed Data via JDBC
            DatabaseInitializer.initializeDatabase();

            // 2. Start HTTP Server
            HttpServer server = HttpServer.create(new InetSocketAddress(AppConfig.SERVER_PORT), 0);
            server.createContext("/api", new ApiRouter());
            server.setExecutor(Executors.newFixedThreadPool(12));
            server.start();

            System.out.println(">>> Server successfully started on http://localhost:" + AppConfig.SERVER_PORT + "/api");
            System.out.println(">>> Health Check: http://localhost:" + AppConfig.SERVER_PORT + "/api/health");
            System.out.println("==================================================================");
        } catch (Exception e) {
            System.err.println("Fatal error starting server: " + e.getMessage());
            e.printStackTrace();
            System.exit(1);
        }
    }
}
