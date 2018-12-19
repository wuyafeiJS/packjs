'use strict';


/**
 ***************************************
 * 加载依赖模块
 ***************************************
 */
const
    fs = require('fs'),
    path = require('path'),
    stat = require('./stat'),
    thunkify = require('./thunkify');

/**
 ***************************************
 * 定义创建文件目录函数
 ***************************************
 */
async function mkdir(dir) {

    let stats = await stat(dir);

    // 目录已经存在
    if (stats) {

        if (stats.isDirectory()) {
            return true;
        }

        throw new Error('Dir is exsits as file!');
    }

    // 获取父目录
    let parent = path.dirname(dir);

    // 判断是否为根目录
    if (parent === dir) {
        throw new Error('Cannot create a root dir!');
    }

    await mkdir(parent) && await thunkify(fs.mkdir)(dir);
    return true;
}


/**
 ***************************************
 * 抛出接口
 ***************************************
 */

module.exports = mkdir;
