'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const const_1 = require("../const");
module.exports = {
    webhook: async (ctx) => {
        try {
            const verified = await strapi.plugins[const_1.PLUGINS.PADDLE_WEBHOOK].services[`strapi-plugin-${const_1.PLUGINS.PADDLE_WEBHOOK}`].addOrder(ctx.request.body);
            if (verified) {
                return ctx.send('OK');
            }
            else {
                return ctx.response.badImplementation('invalid signature');
            }
        }
        catch (err) {
            strapi.log.error('paddle webhook call failed', {
                err: err.message,
                stack: err.stack
            });
            return ctx.response.badImplementation(err);
        }
    }
};
