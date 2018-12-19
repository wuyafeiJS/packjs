'use strict';


/**
 ***************************************
 * 输出接口
 ***************************************
 */
module.exports = {
    split: () => console.log('='.repeat(80)),
    log: message => console.log(message),
    error: message => console.error(message),
    info: function (...args) {
        console.log('\n');
        this.split();
        args.forEach(message => {
            /^-+$/.test(message) ? this.split() : console.log('==>', message);
        });
        this.split();
    }
};
