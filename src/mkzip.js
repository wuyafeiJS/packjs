"use strict";

/**
 ***************************************
 * 加载依赖模块
 ***************************************
 */
const fs = require("fs"),
  path = require("path"),
  sh = require("shelljs"),
  archiver = require("archiver"),
  std = require("./std"),
  stat = require("./stat"),
  mkdir = require("./mkdir"),
  entry = require("./entry"),
  thunkify = require("./thunkify");

/**
 ***************************************
 * 定义移动文件函数
 ***************************************
 */
async function moveToTempDir(src, dist, file) {
  let dir = path.resolve(dist, file.replace(src, "."));

  (await mkdir(path.dirname(dir))) && sh.cp(file, dir);
  console.log(file);
  return dir;
}

/**
 ***************************************
 * 生成【ZIP】打包文件
 ***************************************
 */
async function archiverZip(dir) {
  let fileList = await thunkify(fs.readdir)(dir),
    zipDir = dir + ".zip",
    ws = fs.createWriteStream(zipDir),
    archive = archiver("zip"),
    rs = [];

  // 获取文件列表
  await Promise.all(
    fileList.map(file => {
      let src = path.resolve(dir, file);

      return stat(src).then(stats =>
        rs.push({
          src,
          dist: file,
          isDirectory: stats.isDirectory()
        })
      );
    })
  );

  await new Promise((resolve, reject) => {
    // 添加完成事件
    ws.on("close", function() {
      std.log("Dir: " + zipDir);
      std.log("Size: " + archive.pointer() + " bytes!");
      return resolve(zipDir);
    });

    // 添加错误事件
    archive.on("error", reject);

    // 形如传输数据
    archive.pipe(ws);

    // 添加压缩文件
    for (let file of rs) {
      file.isDirectory
        ? archive.directory(file.src, file.dist)
        : archive.file(file.src, { name: file.dist });
    }

    // 完成压缩
    archive.finalize();
  });

  return zipDir;
}

/**
 ***************************************
 * 抛出接口
 ***************************************
 */
module.exports = async (opt, diffs) => {
  let cwd = opt.cwd,
    src = (opt.src = path.resolve(opt.dir)),
    tempDir = (opt.tempDir = path.resolve(`hot-update-${opt.timeStamp}`)),
    zipDir;

  // 创建临时目录
  if (!(await mkdir(tempDir))) {
    std.log("Create temp folder Error!");
  }

  // 打印临时目录信息
  std.info("Create temp dir!");
  std.log(`Dir: ${tempDir}`);

  // 打印移动文件信息
  std.info("Start move file to temp dir!");

  // 复制更新文件
  for (let diff of diffs) {
    await moveToTempDir(src, tempDir, path.resolve(cwd, diff));
  }

  // 复制包含的文件
  if (opt.include) {
    for (let file of opt.include) {
      await moveToTempDir(src, tempDir, path.resolve(src, file));
    }
  }

  // 复制入口文件
  //   std.info("Start webpack javascript!");

  //   await entry(opt);

  // 如果是开发环境，直接退出
  opt.env === "dev" && process.exit(1);

  // 压缩临时文件夹
  std.info("Start zip temp dir!");
  zipDir = await archiverZip(tempDir);
  // 删除临时文件夹
  opt.zipFolder || sh.rm("-rf", tempDir);

  // 返回压缩包路径
  return zipDir;
};
