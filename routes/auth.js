const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const HandleToken = require("../components/HandleToken");
const { validator } = require("../components/validator");

const router = express.Router();
const valid = new validator();
const SALT_ROUND = 10;

const auth = (database) => {
  router.post("/login", async (req, res) => {
    const { username, password } = req.body;

    if (username && password) {
      try {
        const auth = await database.authenticate(username, password);
        if (auth.length > 0) {
          let match = await bcrypt.compare(password, auth[0].password);
          if (match) {
            const [token, refreshToken] = HandleToken({
              username,
              id: auth[0].id,
            });
            await database.storeRefreshToken(refreshToken, username);
            res.cookie(
              "refreshToken",
              Buffer.from(refreshToken).toString("base64"),
              {
                httpOnly: true,
                path: "/api/auth/token",
              }
            );
            return res.status(200).json({ success: true, data: { token } });
          } else
            return res
              .status(403)
              .json({ success: false, data: "Wrong Credentials" });
        } else
          return res
            .status(403)
            .json({ success: false, data: "Wrong Credentials" });
      } catch (error) {
        console.log(error);
      }
    }
    res.status(400).send("Bad Request");
  });

  router.post("/register", async (req, res) => {
    const { username, email, password } = req.body;
    if (username && email && password) {
      if (
        !(
          valid.checkinput(username) ||
          valid.checkemail(email) ||
          valid.chckPassword(password)
        )
      )
        res.status(400).json({ success: false, data: "Bad Request" });
      try {
        const check = await database.check(username);
        if (check.length > 0)
          return res
            .status(200)
            .json({ success: false, data: "Username exists" });
        let hash = await bcrypt.hash(password, SALT_ROUND);
        if (hash) {
          const reg = await database.register(username, email, hash);
          if (reg?.insertId) {
            return res.redirect(302, "../login");
          }

          return res
            .status(200)
            .json({ success: false, data: "Registeration failed" });
        }
      } catch (error) {
        console.log(error);
        return res.sendStatus(500);
      }
    }
    res.status(400).json({ success: false, data: "Bad Request" });
  });

  router.get("/token", (req, res) => {
    let { refreshToken } = req.cookies;
    if (refreshToken) {
      refreshToken = Buffer.from(refreshToken, "base64").toString("ascii");
      jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        (err, user) => {
          if (err) return res.sendStatus(403);
          database
            .getRefreshToken(refreshToken)
            .then((r) => {
              [tk, _] = HandleToken({ username: user.username, id: user.id });
              res.json({ success: true, data: { token: tk } });
            })
            .catch((err) => res.sendStatus(500));
        }
      );
    } else {
      res.sendStatus(403);
    }
  });
  return router;
};
module.exports = auth;
