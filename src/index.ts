import { isEmtry } from "./utils"
export * from "./utils"
import "reflect-metadata";

const app = "sdad"
export default app

class LoginService {
  postLogin(username: string) {
    console.log('login...', username)
  }
}

function Service(target: any, key: string) {
  target[key] = new (Reflect.getMetadata("design:type", target, key))
}

class LoginPage {
  @Service
  public service: LoginService;

  public toLogin(username: string) {
    this.service.postLogin(username)
  }
}

export {
    app,
    LoginPage,
    isEmtry
}
