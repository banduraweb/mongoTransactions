require("dotenv").config();
class Config {
  static port() {
    return process.env.PORT;
  }

  static db() {
    return process.env.MONGO_DB_URL;
  }
}

module.exports = Config;
