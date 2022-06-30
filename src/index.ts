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

const services: Map<Constructor, Constructor> = new Map();
type Constructor = { new (...args: any): any }
function Inject<T extends Constructor>(target: T) {
  services.set(target, target);
}

function Service(target: Record<string|symbol, any>, key: string | symbol) {
  const service = services?.get(Reflect.getMetadata("design:type", target, key));
  service && (target[key] = new service());
}

@Inject
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

class LoginPage {
  @Service
  public service: LoginService;

  public toLogin(username: string) {
    this.service?.postLogin(username)
  }
}

export {
    app,
    LoginPage,
    UserPage,
    isEmtry
}

// 用户相关接口
@Inject
class UserService {
  public getUser() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          name: "张三",
          age: 18,
          address: "北京",
          phone: "123456789",
          email: "zhangsan@qq.com"
        })
      }, 2000)
    })
  }
}

class UserPage {
  @Service
  public service: UserService;

  public getUser() {
    console.log(this.service)
    return this.service?.getUser()
  }
}

