require('babel-core/register')
require('./server')
require("babel-core").transform("code", {
     plugins: ["transform-runtime"]
 })