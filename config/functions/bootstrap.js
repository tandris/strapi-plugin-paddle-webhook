"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const const_1 = require("../../const");
module.exports = () => {
    const paddleService = strapi.plugins[const_1.PLUGINS.PADDLE_WEBHOOK].services[`strapi-plugin-${const_1.PLUGINS.PADDLE_WEBHOOK}`];
    paddleService.loadPublicKey();
};
