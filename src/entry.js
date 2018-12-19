'use strict';

/**
 ***************************************
 * 加载依赖模块
 ***************************************
 */
const
    fs = require('fs'),
    path = require('path'),
    sh = require('shelljs'),
    thunkify = require('./thunkify');


/**
 ***************************************
 * 抛出接口
 ***************************************
 */
module.exports = async opt => {
    let entry = path.resolve(opt.src, 'index.html'),
        code = await thunkify(fs.readFile)(entry),
        jsDir = `dist/app-${opt.timeStamp}.js`,
        writeFile = thunkify(fs.writeFile),
        webpackOptions = {
            context: opt.src,
            output: {
                path: opt.tempDir,
                filename: jsDir
            }
        },
        webpackOptionsDir = path.resolve(opt.tempDir, 'webpack.config.js'),
        list = [];


    // 替换入口源码
    code = code
        .toString()
        .replace(/<script src="(js\/.+?)"><\/script>\s*/g, (patt, $1) => {
            list.push('./' + $1.replace(/\?v=\d+$/, ''));
            return '';
        })
        .replace('</head>', '<script src="' + jsDir + '"></script>\n</head>')
        .replace(/\?v=\d+/g, `?v=${opt.timeStamp}`);



    // 替换包含的文件
    if (opt.include) {
        opt.include.forEach(file => {
            code = code.replace(`${file}?v=${opt.timeStamp}`, patt => {
                let ext = path.extname(file),
                    dist = `${file.replace(ext, '')}-${opt.timeStamp}${ext}`,
                    res = sh.mv(path.resolve(opt.tempDir, file), path.resolve(opt.tempDir, dist));

                return res.code ? patt : dist;
            });
        });
    }


    // 输出入口文件
    await writeFile(path.resolve(opt.tempDir, 'index.html'), code);


    // 输入【webpack】打包配置
    webpackOptions.entry = list;
    await writeFile(webpackOptionsDir, `module.exports=${JSON.stringify(webpackOptions, undefined, 4)}`);

    // 打包【js】代码
    if (sh.exec(`webpack -p --config ${webpackOptionsDir}`).code) {
        throw new Error('Webpack javascript error!');
    }

    // 移出【webpack】配置文件
    sh.rm(webpackOptionsDir);

    return true;
};
