"use strict";

/**
 ***************************************
 * 加载依赖模块
 ***************************************
 */
const sh = require("shelljs"),
  std = require("./std");

/**
 ***************************************
 * 输出接口
 ***************************************
 */
module.exports = opt => {
  // 获取配置
  let { hash: head, dir = "./", exclude = [] } = opt;

  // 查看是否定义了基础版本
  if (!head) {
    throw new Error("Cannot find git base hash!");
  }

  // 获取最新代码
  std.info("Pull branch!");

  // 执行获取最新代码
  if (sh.exec("git pull").code) {
    throw new Error("Run diff pull error!");
  }

  // 执行打包
  if (sh.exec("npm run build").code) {
    throw new Error("打包失败!");
  }
  // 打印命令信息
  std.info(
    "Get update file list!",
    "---",
    "Command: git diff",
    `Base: ${head}`,
    `Dir: ${dir}`
  );

  // 执行命令
  let cmd = `git diff --name-only HEAD ${head} ${dir}`,
    res = sh.exec(cmd),
    diffs;

  // 运行【diff】命令失败
  if (res.code) {
    throw new Error("Run diff command error!");
  }

  // 获取更新文件列表
  diffs = res.stdout.split("\n");

  // 过滤更新文件列表
  if (diffs.length && exclude.length) {
    // 获取文件夹目录
    dir = dir.replace(/\.+\//, "").replace(/\/?$/, "/");

    // 遍历过滤列表
    exclude.forEach(ex => {
      // 获取过滤路径
      ex = dir + ex;

      // 过滤文件夹
      if (ex.slice(-2) === "/*") {
        ex = ex.replace("/*", "/");
        return (diffs = diffs.filter(diff => diff.indexOf(ex) !== 0));
      }

      // 过滤文件
      diffs = diffs.filter(diff => diff && diff !== ex);
    });
  }

  // 没有更新文件时退出
  if (!diffs.length) {
    return std.log("No update!") || process.exit(1);
  }

  // 返回更新文件列表
  return diffs;
};
