'use strict';


/**
 ***************************************
 * 加载依赖模块
 ***************************************
 */
const
    fs = require('fs');


/**
 ***************************************
 * 定义获取目录信息函数
 ***************************************
 */
async function stat(dir) {

    // 返回【Promise】对象
    return await new Promise(resolve => {

        // 获取目录信息
        fs.lstat(dir, (err, stats) => resolve(err ? null : stats));
    });
}


/**
 ***************************************
 * 输出接口
 ***************************************
 */
module.exports = stat;

