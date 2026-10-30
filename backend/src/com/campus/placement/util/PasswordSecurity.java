package com.campus.placement.util;

import org.mindrot.jbcrypt.BCrypt;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Base64;

public class PasswordSecurity {

    /**
     * Hashes a raw password using standard BCrypt with cost factor 10.
     */
    public static String hashPassword(String password) {
        if (password == null || password.isEmpty()) {
            throw new IllegalArgumentException("Password cannot be empty");
        }
        return BCrypt.hashpw(password, BCrypt.gensalt(10));
    }

    /**
     * Verifies password against stored hash.
     * Supports BCrypt ($2a$, $2b$, $2y$), legacy SHA-256 salt-hash, and fallback.
     */
    public static boolean verifyPassword(String rawPassword, String storedHash) {
        if (rawPassword == null || storedHash == null) {
            return false;
        }

        // 1. Verify standard BCrypt format ($2a$, $2b$, $2y$)
        if (storedHash.startsWith("$2a$") || storedHash.startsWith("$2b$") || storedHash.startsWith("$2y$")) {
            try {
                return BCrypt.checkpw(rawPassword, storedHash);
            } catch (Exception e) {
                return false;
            }
        }

        // 2. Legacy salt$hash check
        if (storedHash.contains("$")) {
            String[] parts = storedHash.split("\\$", 2);
            if (parts.length == 2) {
                try {
                    byte[] salt = Base64.getDecoder().decode(parts[0]);
                    MessageDigest md = MessageDigest.getInstance("SHA-256");
                    md.update(salt);
                    byte[] hashed = md.digest(rawPassword.getBytes(StandardCharsets.UTF_8));
                    String computedHash = Base64.getEncoder().encodeToString(hashed);
                    return MessageDigest.isEqual(
                            computedHash.getBytes(StandardCharsets.UTF_8),
                            parts[1].getBytes(StandardCharsets.UTF_8)
                    );
                } catch (Exception ignored) {}
            }
        }

        // 3. Fallback comparison for unhashed legacy accounts
        return MessageDigest.isEqual(
                rawPassword.getBytes(StandardCharsets.UTF_8),
                storedHash.getBytes(StandardCharsets.UTF_8)
        );
    }
}
