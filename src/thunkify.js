'use strict';


/**
 ***************************************
 * 定义【thunkify】方法
 ***************************************
 */
function thunkify(handler) {
    return function (...args) {
        return new Promise((resolve, reject) => {
            handler.bind(this)(
                ...args,
                (err, data) => err ? reject(err) : resolve(data)
            );
        });
    };
}


/**
 ***************************************
 * 输出接口
 ***************************************
 */
module.exports = thunkify;
