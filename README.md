
## 安装【YPack】
安装【YPack】之前，请先安装最新版【nodejs \^7.9.0】环境。

``` sh
# 将项目【clone】到本地
$ git clone git@git.mysoft.com.cn:community/ypack.git

# 切到项目目录
$ cd ypack

# 安装依赖包，推荐【yarn】命令
$ npm install
```

## 安装【webpack】
【YPack】依赖【webpack】全局命令，已经安装的可跳过

``` sh
# 全局安装【webpack】，已经安装的请跳过
$ npm install -g webpack
```

## 配置项目文件
在需要打包的项目下创建配置文件【ypck.json】，【YPack】工具需基于【git】版本管理工具，可将配置文件纳入版本管理中，方便共享。

``` json
{

    /**
     * 项目信息设置
     */
    "name": "yf", // 项目简称，用于【aliyun】创建热更新文件目录
    "code": "AppMobileCheckRoom", // 项目全称，用于写入热更新【sql: app_code】字段
    "version": "3.0.0", // 热更新基准版本号，可在打包运行时指定
    "hash": "1974dfe012e7f3826c018eb37a65739a9baa2078", // 热更新基准【Hash】码，用于提取需要热更新的文件


    /**
     * 打包环境配置
     * 开发环境下只提取热更新文件到临时文件夹，不做后续处理
     */
    "env": "dist", // 打包环境变量，可选："dev", "dist"。 默认："dist"。


    /**
     * 打包设置
     */
    "zipFile": false, // 是否保留本地生成的【zip】更新包文件，默认：false
    "zipFolder": false, // 是否保留本地生成的临时打包文件夹，默认：false
    "sqlFile": true, // 是否生成热更新的【sql】文件，默认：true


    /**
     * 热更新的目录，将作为查找文件的上下文
     */
    "dir": "./www",


    /**
     * 指定需要包含进来的文件
     */
    "include": [
        "css/style.css"
    ],


    /**
     * 指定需要排除在外的文件或文件夹（以"/*"结束）
     */
    "exclude": [
        "js/*",
        "css/*",
        "cordova-js-src/*",
        "test/*",
        "test-old/*",
        "build.js",
        "cordova.js",
        "cordova_plugins.js",
        "gulpfile.js",
        "package.json",
        "README",
        "variable.js"
    ]
}
```
