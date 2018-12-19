"use strict";

/**
 ***************************************
 * 加载依赖模块
 ***************************************
 */
const cwd = process.cwd(),
  fs = require("fs"),
  path = require("path"),
  sh = require("shelljs"),
  args = require("./args"),
  std = require("./std"),
  stat = require("./stat"),
  diff = require("./diff"),
  mkzip = require("./mkzip"),
  upload = require("./upload"),
  thunkify = require("./thunkify"),
  sql = require("./sql");

/**
 ***************************************
 * 定义工具函数
 ***************************************
 */

/* 格式化时间 */
function formatTime(timeStamp) {
  let d = new Date(timeStamp);

  return [
    d.getFullYear(),
    formatNumber(d.getMonth() + 1),
    formatNumber(d.getDate()),
    formatNumber(d.getHours()),
    formatNumber(d.getMinutes()),
    formatNumber(d.getSeconds())
  ].join("");
}

/* 格式化数字 */
function formatNumber(n) {
  return n < 10 ? `0${n}` : n;
}

/**
 ***************************************
 * 输出接口
 ***************************************
 */
module.exports = async () => {
  // 输出打包信息
  std.info("Start pack app hot update!");

  // 获取配置文件信息
  let dir = path.resolve(cwd, "ypack.json"),
    stats = await stat(dir),
    options,
    diffs,
    zipDir,
    zipUrl,
    sqlStr;
  // 不存在配置文件时直接退出
  if (!stats) {
    console.error('==> Cannot find config file "ypack.json"!\n');
    return process.exit(1);
  }

  // 获取打包配置
  options = require(dir);
  options.cwd = cwd;
  options.timeStamp = +new Date();
  options.updateInfo = args.key("m", "message") || args.find(/[^\d\.]/) || "";
  options.version =
    args.key("v", "version") || args.find(/^[\d\.]+$/) || options.version;
  debugger;
  // 打印打包版本号
  std.log(`==> App: ${cwd}`);
  std.log(`==> Code: ${options.code}`);
  std.log(`==> Version: ${options.version}`);
  std.log(`==> TimeStamp: ${options.timeStamp}`);
  std.split();

  // 获取更新列表
  diffs = diff(options);

  // 生成打包文件
  zipDir = await mkzip(options, diffs);

  // 上传【aliyun】服务器
  std.info("Start upload aliyun!");
  zipUrl = await upload(options, zipDir);
  std.log(`Url: ${zipUrl}`);

  // 输出【sql】
  std.info("Update SQL");
  console.log((sqlStr = sql(zipUrl, options)));

  // 默认生成【sql】文件
  if (options.sqlFile !== false) {
    // 定义文件名：cjs-2.0.2-hot-update-20170425113125.sql
    let time = formatTime(options.timeStamp),
      sqlName = `${options.name}-${options.version}-hot-update-${time}.sql`,
      sqlDir = path.resolve(options.cwd, sqlName);

    // 写入【sql】文件
    await thunkify(fs.writeFile)(sqlDir, sqlStr);
  }

  // 移除生成的打包文件
  options.zipFile || sh.rm(zipDir);
};
