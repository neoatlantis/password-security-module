const fs = require("fs");
const path = require('path');



module.exports = (env)=>{
    const basepath = __dirname;
    const srcpath = path.join(basepath, "src");
    const is_dev = (env.production === undefined);

    let ret = [];


    ret.push({
        entry: path.join(srcpath, "index.js"),
        mode: (
            is_dev
            ?'development'
            :'production'
        ),
        watch: true,
        output: {
            filename: "psm.js",
            path: path.join(basepath, "dist"),
            globalObject: 'this',
            library: {
                name: 'psm',
                type: 'umd',
            }
        },
        resolve: {
            alias: {
                app: srcpath,
            },
            fallback: {
                "fs": false,
                "crypto": false,
            }
        },
    });

    return ret;
};