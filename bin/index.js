#!/usr/bin/env node

'use strict';


/**
 ***************************************
 * 加载依赖模块
 ***************************************
 */
const
    ypack = require('../src');


/**
 ***************************************
 * 启动打包流程
 ***************************************
 */
ypack().catch(err => console.error(err));
