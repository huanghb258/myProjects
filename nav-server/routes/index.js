const express = require('express');
const router = express.Router();
const {exec} = require('child_process');
// const { execFile } = require('child_process');


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/command', function (req, res, next){
    const target=req.query.target;
    let data={code:0,target};
    let p=new Promise((rsolve,reject)=>{
        exec(target,'utf-8',function (error,stdout,stderr) {
            if (error) {
                console.error(`执行出错: ${error}`);
                data={code:0,error};
                reject('失败');
                return;
            }
            console.log(`stdout: ${stdout}`);
            console.log(`stderr: ${stderr}`);
            data.code=1;
            data.stdout=stdout;
            data.stderr=stderr;
            rsolve('执行成功');
        })
    })
    p.then(()=>{ res.send(data)});
})
module.exports = router;
