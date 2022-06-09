export * from "./common"

export const isEmtry = (param: any) => param == undefined || param == null || (typeof param === "string" && !param.length)
