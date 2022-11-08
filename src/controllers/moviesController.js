const path = require("path");
const db = require("../database/models");
const sequelize = db.sequelize;
const { Op } = require("sequelize");
const moment = require("moment");
const { getUrl, getUrlBase } = require("../helpers");

//Aqui tienen otra forma de llamar a cada uno de los modelos

const moviesController = {
  list: async (req, res) => {
    const { limit, order, offset } = req.query;
    const fields = ["title", "rating", "release_date", "length", "awards"];

    try {
      if (order && !fields.includes(order)) {
        throw createError(
          400,
          `Solo se ordenan los campos por ${fields.join(", ")}`
        );
      }

      let total = await db.Movie.count();
      let movies = await db.Movie.findAll({
        attributes: {
          exclude: ["created_at", "updated_ad"],
        },
        include: [
          {
            association: "genre",
            attributes: {
              exclude: ["created_at", "updated_at"],
            },
          },
          {
            association: "actors",
            attributes: {
              exclude: ["created_at", "updated_at"],
            },
          },
        ],
        limit: limit ? +limit : 5,
        offset: offset ? +offset : 0,
        order: [order ? order : "id"],
      });

      movies.forEach((movie) => {
        movie.setDataValue("link", `${getUrl(req)}/${movie.id}`);
      });

      return res.status(200).json({
        ok: true,
        meta: {
          status: 200,
        },
        data: {
          items: movies.length,
          total,
          movies,
        },
      });
    } catch (error) {
      console.log(error);
      return res.status(error.status || 500).json({
        ok: false,
        status: error.status || 500,
        msg: error.message,
      });
    }
  },
  getById: async (req, res) => {
    const { id } = req.params;

    try {
      if (isNaN(id)) {
        throw createError(400, "El ID debe ser un número");
      }
      const movie = await db.Movie.findByPk(req.params.id, {
        include: [
          {
            association: "genre",
            attributes: {
              exclude: ["created_at", "update_at"],
            },
          },
          {
            association: "actors",
            attributes: {
              exclude: ["created_at", "updated_at"],
            },
          },
        ],
        attributes: ["created_at", "update_at", "genre_id"],
      });
      if (!movie) {
        throw createError(404, "No hay una pelicula con ese ID");
      }

      movie.release_date = moment(movie.release_date).format();
      return res.status(200).json({
        ok: true,
        meta: {
          status: 200,
        },
        data: {
          movie,
        },
      });
    } catch (error) {
      console.log(error);

      return res.status(error.status || 500).json({
        ok: false,
        status: error.status || 500,
        msg: error.message,
      });
    }
  },
  newest: async (req, res) => {
    const { limit } = req.query;
    const options = {
      include: [
        {
          association: "genre",
          attributes: {
            exclude: ["created_at", "update_at"],
          },
        },
        {
          association: "actors",
          attributes: {
            exclude: ["created_at", "updated_at"],
          },
        },
      ],
      attributes: ["created_at", "update_at", "genre_id"],

      limit: limit ? +limit : 5,
      order: [["release_date", "DESC"]],
    };

    try {
      const movies = db.Movie.findAll(options);
      const moviesModify = movies.map((movie) => {
        return {
          ...movie.dataValues,
          link: `${getUrlBase(req)}/${movie.id}`,
        };
      });

      return res.status(200).json({
        ok: true,
        meta: {
          status: 200,
        },
        data: {
          moviesModify,
        },
      });
    } catch (error) {
      console.log(error);

      return res.status(error.status || 500).json({
        ok: false,
        status: error.status || 500,
        msg: error.message,
      });
    }
  },
  recomended: async (req, res) => {
    const { limit } = req.query;

    const ops = {
      where: { rating: { [db.Sequelize.Op.gte]: 8 } },
      order: [["rating", "DESC"]],
      include: [
        {
          association: "genre",
          attributes: { exclude: ["created_at", "updated_at"] },
        },
        {
          association: "actors",
          attributes: { exclude: ["created_at", "updated_at"] },
        },
      ],
      attributes: { exclude: ["created_at", "updated_at", "genre_id"] },
      limit: limit ? +limit : 5,
    };

    try {
      const movies = await db.Movie.findAll(ops);

      movies.forEach((movie) => {
        movie.setDataValue("link", `${helpers.getUrl(req)}/${movie.id}`);
      });

      return res.status(200).json({
        ok: true,
        meta: {
          status: 200,
        },
        data: {
          movies,
        },
      });
    } catch (error) {
      console.log(error);

      return res.status(error.status || 500).json({
        ok: false,
        msg: error.message,
      });
    }
  },
  //Aqui dispongo las rutas para trabajar con el CRUD

  create: async (req, res) => {
    const { title, rating, awards, release_date, length, genre_id } = req.body;
    let errors = [];

    try {
      for (const key in req.body) {
        if (!req.body[key]) {
          errors = [
            ...errors,
            {
              field: key,
              msg: `El campo ${key} es requerido`,
            },
          ];
        }
      }

      // console.log(errors);
      if (errors.length) {
        throw createError(404, "Ups, hay errores!");
      }

      const movie = await db.Movie.create({
        title: title?.trim(),
        rating,
        awards,
        release_date,
        length,
        genre_id,
      });

      return res.status(201).json({
        ok: true,
        meta: {
          status: 201,
        },
        data: {
          movie,
        },
      });
    } catch (error) {
      console.log(error);

      return res.status(error.status || 500).json({
        ok: false,
        status: error.status || 500,
        msg: error.message,
      });
    }
  },
  update: function (req, res) {
    let movieId = req.params.id;
    Movies.update(
      {
        title: req.body.title,
        rating: req.body.rating,
        awards: req.body.awards,
        release_date: req.body.release_date,
        length: req.body.length,
        genre_id: req.body.genre_id,
      },
      {
        where: { id: movieId },
      }
    )
      .then(() => {
        return res.redirect("/movies");
      })
      .catch((error) => res.send(error));
  },
  destroy: function (req, res) {
    let movieId = req.params.id;
    Movies.destroy({ where: { id: movieId }, force: true }) // force: true es para asegurar que se ejecute la acción
      .then(() => {
        return res.redirect("/movies");
      })
      .catch((error) => res.send(error));
  },
};

module.exports = moviesController;
