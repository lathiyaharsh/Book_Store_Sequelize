const con = require("../config/sequelize");

(async () => {
  try {
    await con.sync();
    console.log("Tables synchronized successfully.");
  } catch (error) {
    console.error("Error synchronizing tables: ", error);
  }
})();

module.exports = con;
