const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
// const {exec} = require('child_process');


/* GET users listing. */
router.get('/', function (req, res, next) {
    let result = {};
    result.files = [];//存放所有文件
    result.folders = [];//存放所有文件夹
    // const filePath = path.dirname(req.query.path);
    result.project_path = path.resolve(req.query.path);//绝对路径
    fileDisplay(result.project_path);
    res.jsonp(JSON.stringify(result));
    // res.send(req.query.path);
    function fileDisplay(filePath){
        let files ;
        try{
            files=fs.readdirSync(filePath);
        }catch(err){
            console.warn(err.message);
            return ;
        }
        files.forEach(function(filename){
            //获取当前文件的绝对路径
            let filedir = path.join(filePath,filename);
            let stats=fs.statSync(filedir);
            let isFile = stats.isFile();//是文件
            let isDir = stats.isDirectory();//是文件夹
            if(isFile){
                // console.log(filedir);
                if(/\.(txt|html)$/.exec(filedir)){
                    result.files.push(filedir);
                }
            }
            if(isDir&&!/(\/|\\)\./.exec(filedir)&&!/(\/|\\)(img|js|css)(\/|\\|$)/.exec(filedir)){
                result.folders.push(filedir);
                fileDisplay(filedir);//递归，如果是文件夹，就继续遍历该文件夹下面的文件
            }
        })
    }
});



module.exports = router;
