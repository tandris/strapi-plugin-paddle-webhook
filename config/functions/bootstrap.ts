import {PaddleService} from "../../services/strapi-plugin-paddle-webhook";
import {PLUGINS} from "../../const";

module.exports = () => {
  const paddleService = strapi.plugins[PLUGINS.PADDLE_WEBHOOK].services[`strapi-plugin-${PLUGINS.PADDLE_WEBHOOK}`] as PaddleService;
  paddleService.loadPublicKey();
}