"use strict";

/**
 ***************************************
 * 加载依赖模块
 ***************************************
 */
const fs = require("fs"),
  aliyun = require("aliyun-sdk"),
  thunkify = require("./thunkify");

/**
 ***************************************
 * 抛出接口
 ***************************************
 */
module.exports = async (opt, zipDir) => {
  var code = await thunkify(fs.readFile)(zipDir),
    oss = new aliyun.OSS({
      accessKeyId: opt.accessKeyId,
      secretAccessKey: opt.secretAccessKey,
      endpoint: "http://oss-cn-shenzhen.aliyuncs.com",
      apiVersion: "2013-10-15" // 这是 oss sdk 目前支持最新的 api 版本, 不需要修改
    }),
    key = `mobilecheckroom/${opt.name}/hot-update-${opt.timeStamp}.zip`,
    url = `http://oss-cn-shenzhen.aliyuncs.com/yunshequ/${key}`,
    params = {
      Bucket: "yunshequ",
      Key: key, // 注意, Key 的值不能以 / 开头, 否则会返回错误.
      Body: code,
      AccessControlAllowOrigin: "*",
      ContentType: "application/octet-stream",
      CacheControl: "no-cache", // 参考: http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.9
      ContentDisposition: "", // 参考: http://www.w3.org/Protocols/rfc2616/rfc2616-sec19.html#sec19.5.1
      ContentEncoding: "utf-8", // 参考: http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.11
      ServerSideEncryption: "AES256",
      Expires: null // 参考: http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.21
    };

  // 上传数据
  await new Promise((resolve, reject) => {
    oss.putObject(params, err => {
      return err ? reject(err) : resolve(url);
    });
  });

  return url;
};
