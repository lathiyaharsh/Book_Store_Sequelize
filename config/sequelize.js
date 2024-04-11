const sequelize = require("sequelize");

const con = new sequelize(
  process.env.DATABASE,
  process.env.USERNAMEDB,
  process.env.PASSWORD,
  {
    host: process.env.HOST,
    dialect: process.env.DIALECT,
    logging: false,
  }
);

(async () => {
  try {
    await con.authenticate();
    console.log("Connection with database has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
})();

module.exports = con;
