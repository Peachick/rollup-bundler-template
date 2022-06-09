import { isEmtry } from "./utils"
export * from "./utils"
import "reflect-metadata";

const app = "sdad"
export default app

function logger(target: object, key: string, descriptor: PropertyDescriptor) {
  const origin = descriptor.value;
    descriptor.value = async function(...args: any[]) {
      try {
        const start = +new Date
        const rs = await origin.call(this, ...args)
        const end = +new Date
        console.log("@logger: 接口埋点...", `${end - start}ms.`)
        return rs
      } catch (err) {
        console.log(err)
      }
    }
}

class LoginService {
  @logger
  postLogin(username: string) {
    const time = Math.floor(Math.random() * 10 * 1000)
    console.log(`api need time ${time}`)
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.floor(Math.random() * 26) % 10) {
          console.log("login...", username)
          resolve("true")
        } else {
          reject("error")
        }
      }, time)
    })
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
