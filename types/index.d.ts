import { isEmtry } from "./utils";
export * from "./utils";
import "reflect-metadata";
declare const app = "sdad";
export default app;
declare class LoginService {
    postLogin(username: string): void;
}
declare class LoginPage {
    service: LoginService;
    toLogin(username: string): void;
}
export { app, LoginPage, isEmtry };
