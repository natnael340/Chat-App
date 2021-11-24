const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const HandleToken = require("../components/HandleToken");
const { validator } = require("../components/validator");
const authenticate = require("../middlewares/authenticate");

const router = express.Router();
router.use(authenticate);
const user = (database) => {
  router.get("/info", async (req, res) => {
    const user = await database.getUser(req.user.username);
    if (user) {
      return res.status(200).json({
        success: true,
        data: {
          id: user[0].id,
          username: user[0].username,
          email: user[0].email,
        },
      });
    }
    res.sendStatus(400);
  });
  router.get("/messages", async (req, res) => {
    const messages = await database.getMessages(req.user.id);
    if (messages) {
      return res.status(200).json({
        success: true,
        data: [...messages],
      });
    }
    res.sendStatus(200);
  });
  router.get("/messages/:id", async (req, res) => {
    const { id } = req.params;
    console.log(id, req.user.id);
    const messages = await database.getMessage([id, req.user.id]);
    if (messages) {
      return res.status(200).json({
        success: true,
        data: [...messages],
      });
    }
    res.sendStatus(200);
  });
  router.post("/message", async (req, res) => {
    const { cid, sender, reciver, message } = req.body;
    if (!cid || !sender || !reciver || !message) return res.sendStatus(400);
    await database.newMessage({
      cid,
      sender,
      reciver,
      message,
      uid: req.user.id,
    });
    return res.sendStatus(200);
  });

  return router;
};

module.exports = user;
