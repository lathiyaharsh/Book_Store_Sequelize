const book = require("../models/book");
const { bookMassage } = require("../config/message");
const { bookDetails } = require("../config/config");
const { user } = require("../models/user");
const { Op, where } = require("sequelize");

module.exports.create = async (req, res) => {
  try {
    if (!req.body)
      return res.status(400).json({ message: bookMassage.error.fillDetails });

    const { id } = req.user.data;

    const {
      name,
      description,
      noOfPage,
      author,
      category,
      price,
      releasedYear,
      userId = id,
    } = req.body;

    if (releasedYear > new Date().getFullYear())
      return res.status(400).json({ message: bookMassage.error.year });

    const newBookData = {
      name,
      description,
      noOfPage,
      author,
      category,
      price,
      releasedYear,
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
    const {
      page,
      search,
      limit,
      year,
      year1,
      sort,
      order,
      authorName,
      pages_gte,
      pages_lte,
      pages_ne,
      pages_eq,
    } = req.query;
    let whereCondition = {};
    let orderCondition = [];
    let orderType = "ASC";
    if (order) {
      if (order == "true") {
        orderType = "ASC";
      }
      if (order == "false") {
        orderType = "DESC";
      }
    }
    if (sort) {
      if (sort == "id") {
        orderCondition = ["id", orderType];
      } else if (sort == "name") {
        orderCondition = ["name", orderType];
      } else if (sort == "author") {
        orderCondition = ["author", orderType];
      } else if (sort == "releasedYear") {
        orderCondition = ["releasedYear", orderType];
      } else if (sort == "price") {
        orderCondition = ["price", orderType];
      } else if (sort == "noOfPage") {
        orderCondition = ["noOfPage", orderType];
      } else if (sort == "description") {
        orderCondition = ["description", orderType];
      } else if (sort == "category") {
        orderCondition = ["category", orderType];
      }
    } else {
      orderCondition = ["createdAt", "ASC"];
    }

    if ( authorName && authorName.trim() && authorName != 'undefined') {
      whereCondition.name = {
        [Op.like]: `%${search}%`,
      };
      whereCondition.author = {
        [Op.like]: `%${authorName}%`,
      };
    }
    if (search && search.trim() && search != 'undefined') {
      whereCondition.name = {
        [Op.like]: `%${search}%`,
      };
    }
    if (pages_eq) {
      whereCondition.noOfPage = {
        [Op.eq]: parseInt(pages_eq),
      };
    }
    if (pages_gte) {
      whereCondition.noOfPage = {
        [Op.gte]: parseInt(pages_gte),
      };
    }
    if (pages_lte) {
      whereCondition.noOfPage = {
        [Op.lte]: parseInt(pages_lte),
      };
    }
    if (pages_gte && pages_lte) {
      whereCondition.noOfPage = {
        [Op.lte]: parseInt(pages_lte),
        [Op.gte]: parseInt(pages_gte),
      };
    }
    if (pages_gte && pages_lte && pages_ne) {
      whereCondition.noOfPage = {
        [Op.lte]: parseInt(pages_lte),
        [Op.gte]: parseInt(pages_gte),
        [Op.ne]: parseInt(pages_ne),
      };
    }
    if (year && year1) {
      whereCondition.releasedYear = {
        [Op.or]: [{ [Op.eq]: parseInt(year) }, { [Op.eq]: parseInt(year1) }],
      };
    }

    if (Object.keys(whereCondition).length > 0) {
      const pageCount = page || bookDetails.pageCount;
      const limitDoc = parseInt(limit) || parseInt(bookDetails.limitDoc);
      const totalBooks = await book.count({
        where: whereCondition,
      });
      const maxPage =
        totalBooks <= limitDoc ? 1 : Math.ceil(totalBooks / limitDoc);

      if (pageCount > maxPage)
        return res
          .status(400)
          .json({ message: `There are only ${maxPage} page` });

      const skip = parseInt((pageCount - 1) * limitDoc);

      const bookList = await book.findAll({
        where: whereCondition,
        order: [orderCondition],
        offset: skip,
        limit: limitDoc,
      });
      return res.status(200).json({
        message: bookMassage.success.fetch,
        bookList,
        maxPage,
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
      order: [orderCondition],
      offset: skip,
      limit: limitDoc,
    });

    return res.status(200).json({
      message: bookMassage.success.fetch,
      bookList,
      maxPage,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: bookMassage.error.genericError });
  }
};

module.exports.findOne = async (req, res) => {
  try {
    const { bookName, author ,bookAuthor } = req.query;
    const { id } = req.params;
    console.log(id);
    let whereCondition = {};

    if (id != 0) {
      whereCondition.id = {
        [Op.eq]: parseInt(id),
      };
    } else if (bookName && bookName.trim()) {
      whereCondition.name = {
        [Op.like]: `%${bookName}%`,
      };
    } else if (author && author.trim()) {
      whereCondition.author = {
        [Op.like]: `%${author}%`,
      };
    } else if (bookName && bookName.trim() && author && author.trim()) {
      whereCondition.name = {
        [Op.like]: `%${bookName}%`,
      };
      whereCondition.author = {
        [Op.like]: `%${author}%`,
      };
    }

    console.log(whereCondition);
    const bookDetails = await book.findOne({
      where: whereCondition,
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
    console.log(error);
    return res.status(500).json({ message: bookMassage.error.genericError });
  }
};

module.exports.update = async (req, res) => {
  try {
    console.log(req.body);
    const { bookName, author } = req.query;
    const { id } = req.params;
    let whereCondition = {};
    if (id != 0) {
      whereCondition.id = {
        [Op.eq]: parseInt(id),
      };
    } else if (bookName && bookName.trim()) {
      whereCondition.name = {
        [Op.like]: `%${bookName}%`,
      };
    } else if (author && author.trim()) {
      whereCondition.author = {
        [Op.like]: `%${author}%`,
      };
    } else if (bookName && bookName.trim() && author && author.trim()) {
      whereCondition.name = {
        [Op.like]: `%${bookName}%`,
      };
      whereCondition.author = {
        [Op.like]: `%${author}%`,
      };
    }

    const editBookDetails = await book.update(req.body, {
      where: whereCondition,
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
    const { bookName, bookAuthor, bookDescription, bookCategory } = req.query;
    const { id } = req.params;
    let whereCondition = {};
    if (bookName && bookName.trim()) {
      whereCondition.name = bookName;
    }
    if (id != 0) {
      whereCondition.id = id;
    }
    if (bookAuthor && bookAuthor.trim()) {
      whereCondition.author = bookAuthor;
    }
    if (bookDescription && bookDescription.trim()) {
      whereCondition.description = bookDescription;
    }
    if (bookCategory && bookCategory.trim()) {
      whereCondition.category = bookCategory;
    }

    const deleteBook = await book.destroy({ where: whereCondition, limit: 1 });
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
