const { DataTypes } = require("sequelize");
const con = require("../config/sequelize");
const { user } = require("./user");

const book = con.define("book", {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [3, 30],
    },
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [3, 200],
    },
  },
  no_of_page: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 10,
    },
  },
  author: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [3, 30],
    },
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [3, 30],
    },
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  released_year: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1500,
    },
  },
  status: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
});

book.belongsTo(user, { onDelete: "CASCADE", foreignKey: "userId" });

module.exports = book;
