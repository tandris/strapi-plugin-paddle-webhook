'use strict';

/**
 * strapi-plugin-paddle-webhook.js controller
 *
 * @description: A set of functions called "actions" of the `strapi-plugin-paddle-webhook` plugin.
 */

import {PaddleService} from "../services/strapi-plugin-paddle-webhook";
import {PLUGINS} from "../const";

module.exports = {

  webhook: async (ctx: IControllerContext) => {
    try {
      const verified = await (strapi.plugins[PLUGINS.PADDLE_WEBHOOK].services[`strapi-plugin-${PLUGINS.PADDLE_WEBHOOK}`] as PaddleService).addOrder(ctx.request.body);
      if (verified) {
        return ctx.send('OK');
      } else {
        return ctx.response.badImplementation('invalid signature');
      }
    } catch (err) {
      strapi.log.error('paddle webhook call failed', {
        err: err.message,
        stack: err.stack
      });
      return ctx.response.badImplementation(err);
    }
  }
};
