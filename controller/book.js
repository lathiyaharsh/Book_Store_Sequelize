const book = require("../models/book");
const { bookMassage } = require("../config/message");
const { bookDetails } = require("../config/config");
const { user } = require("../models/user");
const { Op } = require("sequelize");

module.exports.create = async (req, res) => {
  try {
    if (!req.body)
      return res.status(400).json({ message: bookMassage.error.fillDetails });

    const { id } = req.user.data;

    const {
      name,
      description,
      no_of_page,
      author,
      category,
      price,
      released_year,
      userId = id,
    } = req.body;

    if (released_year > new Date().getFullYear())
      return res.status(400).json({ message: bookMassage.error.year });

    const newBookData = {
      name,
      description,
      no_of_page,
      author,
      category,
      price,
      released_year,
      userId,
    };

    const newBook = await book.create(newBookData);
    if (!newBook)
      return res.status(400).json({ message: bookMassage.error.add });

    return res.status(201).json({ message: bookMassage.success.add });
  } catch (error) {
    if (error.name === "SequelizeValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ errors });
    }
    console.log(error);
    return res.status(500).json({ message: bookMassage.error.genericError });
  }
};

module.exports.list = async (req, res) => {
  try {
    const { page, search, limit } = req.query;
    if (search && search.trim()) {
      const searchResults = await book.findAll({
        where: {
          name: {
            [Op.like]: `%${search}%`,
          },
        },
      });

      return res.status(200).json({
        message: bookMassage.success.fetch,
        searchResults,
      });
    }
    const pageCount = page || bookDetails.pageCount;
    const limitDoc = parseInt(limit) || parseInt(bookDetails.limitDoc);
    const totalBooks = await book.count({ where: { status: true } });
    const maxPage =
      totalBooks <= limitDoc ? 1 : Math.ceil(totalBooks / limitDoc);

    if (pageCount > maxPage)
      return res
        .status(400)
        .json({ message: `There are only ${maxPage} page` });

    const skip = parseInt((pageCount - 1) * limitDoc);

    const bookList = await book.findAll({
      where: { status: true },
      offset: skip,
      limit: limitDoc,
    });

    return res.status(200).json({
      message: bookMassage.success.fetch,
      bookList,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: bookMassage.error.genericError });
  }
};

module.exports.findOne = async (req, res) => {
  try {
    const { id } = req.params;
    const bookDetails = await book.findByPk(id, {
      include: [
        {
          model: user,
          attributes: ["name"],
        },
      ],
    });

    if (!bookDetails)
      return res.status(404).json({ message: bookMassage.error.notFound });

    return res.status(200).json({
      message: bookMassage.success.fetch,
      bookDetails,
    });
  } catch (error) {
    return res.status(500).json({ message: bookMassage.error.genericError });
  }
};

module.exports.update = async (req, res) => {
  try {
    const { id } = req.params;

    const editBookDetails = await book.update(req.body, {
      where: { id },
      runValidators: true,
    });

    if (!editBookDetails)
      return res.status(400).json({
        message: bookMassage.error.update,
      });

    return res.status(200).json({
      message: bookMassage.success.update,
    });
  } catch (error) {
    if (error.name === "SequelizeValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ errors });
    }
    console.log(error);
    return res.status(500).json({ message: bookMassage.error.genericError });
  }
};

module.exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    const deleteBook = await book.destroy({ where: { id } });
    if (!deleteBook)
      return res.status(400).json({ message: bookMassage.error.delete });

    return res.status(200).json({
      message: bookMassage.success.delete,
      deleteBook: deleteBook,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: bookMassage.error.genericError });
  }
};
