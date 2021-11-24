const jwt = require("jsonwebtoken");

const HandleToken = (data) => {
  const token = jwt.sign(data, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "120s",
  });
  const refreshToken = jwt.sign(data, process.env.REFRESH_TOKEN_SECRET);
  return [token, refreshToken];
};

module.exports = HandleToken;
