const Joi = require('joi');

const SongPayloadSchema = Joi.object({
  title: Joi.string().required(),
  performer: Joi.string(),
  genre: Joi.string().required(),
  duration: Joi.number(),
  year: Joi.number().integer().min(1900).max(2021).required(),
});

module.exports = SongPayloadSchema;
