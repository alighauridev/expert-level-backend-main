import { Router } from "express";
import users from "./users.route";
import { rateLimiter } from "../utils/rateLimiter";

const routes = Router();

routes.use(rateLimiter);
routes.use("/users", users);

export default routes;
