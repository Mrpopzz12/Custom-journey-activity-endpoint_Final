"use strict";

// Deps
var express = require("express");
var router = express.Router();

/*
 * GET Home Page
 * This loads your UI (index.html / view)
 */
exports.index = function (req, res) {
    try {
        console.log("Loading Journey Builder UI");

        return res.render("index", {
            title: "Journey Builder Custom Activity"
        });

    } catch (error) {
        console.error("❌ Error rendering index:", error);
        return res.status(500).send("Error loading UI");
    }
};

/*
 * LOGIN (Optional - for SFMC handshake, safe fallback)
 */
exports.login = function (req, res) {
    try {
        console.log("Login request received:", req.body);

        return res.status(200).json({
            success: true,
            message: "Login successful"
        });

    } catch (error) {
        console.error("❌ Login error:", error);
        return res.status(500).json({
            success: false
        });
    }
};

/*
 * LOGOUT (Optional)
 */
exports.logout = function (req, res) {
    try {
        console.log("Logout request received");

        return res.status(200).json({
            success: true
        });

    } catch (error) {
        console.error("❌ Logout error:", error);
        return res.status(500).json({
            success: false
        });
    }
};
