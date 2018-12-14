const express = require('express');
const router = express.Router();
const {exec} = require('child_process');
const fs = require('fs');
const path = require('path');

let txts=[];

// const { execFile } = require('child_process');


/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {title: 'Express'});
});

router.get('/command', function (req, res, next) {
    const target = req.query.target;
    let data = {code: 0, target};
    let p = new Promise((rsolve, reject) => {
        exec(target, 'ANSI', function (error, stdout, stderr) {
            if (error) {
                console.error(`执行出错: ${error}`);
                data = {code: 0, error};
                reject('失败');
                return;
            }
            data.code = 1;
            data.stdout = stdout;
            data.stderr = stderr;
            rsolve('执行成功');
        })
    })
    p.then(() => {
        res.send(data)
    });
});

router.post('/seek', function (req, res, next) {
    let folderPath = path.resolve(req.body.path);//绝对路径
    let {word} =req.body;
    function readDirRecur(folder, callback) {
        fs.readdir(folder, function (err, files) {
            if(err){
                res.send({code: 0, err:'路径错误'});
            }
            let count = 0;
            let checkEnd = function () {
                ++count == files.length && callback()
            }
            files.forEach(function (file) {
                let fullPath = path.join(folder,file);
                fs.stat(fullPath, function (err, stats) {
                    if (stats.isDirectory() && !/(\/|\\)\./.exec(fullPath) && !/(\/|\\)(img|js|css)(\/|\\|$)/.exec(fullPath)) {
                        return readDirRecur(fullPath, checkEnd);
                    } else {
                        /*not use ignore files*/
                        if (/\.txt$/.exec(fullPath)) {
                            let data=fs.readFileSync(fullPath).toString();
                            let reg=new RegExp(word,'i');
                            if (reg.exec(data)) {
                                let name=fullPath.slice(fullPath.lastIndexOf('\\') + 1);
                                fileList.push({name,path:fullPath});
                            }
                        }
                        checkEnd()
                    }
                })
            })
//为空时直接回调
            files.length === 0 && callback()
        })
    }
    if(txts.length){

    }
    let fileList = [];
    readDirRecur(folderPath, function () {
        res.send({code: 1, fileList});
    })
})

router.post('/exportJson', function (req, res, next) {
	let folderPath = path.resolve(req.body.target);//绝对路径
    let {jsonData} =req.body;    
    fs.writeFile(folderPath,jsonData,{flag:'w'} , function (err) {
		if(!err){
			res.send({code:1,txt:'写入成功,文件路径：\n'+folderPath,jsonData})
		}else{
			res.send({code:0,err})
		}
	});
})
module.exports = router;
