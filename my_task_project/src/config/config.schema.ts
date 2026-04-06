import * as joi from '@hapi/joi';

export const configValidationSchema = joi.object({
  DATABASE_HOST: joi.string().required(),
  DATABASE_PORT: joi.number().default(5432).required(),
  DATABASE_USERNAME: joi.string().required(),
  DATABASE_PASSWORD: joi.string().required(),
  DATABASE_NAME: joi.string().required(),

  JWT_SECRET: joi.string().required(),
  PORT: joi.number().default(3000),
});
