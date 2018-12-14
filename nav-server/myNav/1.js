const fs = require('fs');
const path = require('path');
//  let word ='css';
//     function readDirRecur(folder, callback) {
//         fs.readdir(folder, function (err, files) {
//             if(err){
//                 res.send({code: 0, err:'路径错误'});
//             }
//             let count = 0;
//             let checkEnd = function () {
//                 ++count == files.length && callback()
//             }
//             files.forEach(function (file) {
//                 let fullPath = path.join(folder,file);
//                 fs.stat(fullPath, function (err, stats) {
//                     if (stats.isDirectory() && !/(\/|\\)\./.exec(fullPath) && !/(\/|\\)(img|js|css)(\/|\\|$)/.exec(fullPath)) {
//                         return readDirRecur(fullPath, checkEnd);
//                     } else {
//                         /*not use ignore files*/
//                         if (/\.txt$/.exec(fullPath)) {
//                             let data=fs.readFile(fullPath);
//                             fileList.push(fullPath)
//                             let reg=new RegExp(word,'i');
//                             // if (reg.exec(data)) {
//                             //     let name=fullPath.slice(fullPath.lastIndexOf('\\') + 1);
//                             //     fileList.push({name,path:fullPath});
//                             // }
//                         }
//                         checkEnd()
//                     }
//                 })
//             })
// //为空时直接回调
//             files.length === 0 && callback()
//         })
//     }
  
//     let fileList = [];
//     readDirRecur('H:\\myProjects\\nav-server\\myNav\\myJsNote', function () {
//        console.log({code: 1, fileList});
//     })
let data=fs.readFileSync("H:\\myProjects\\nav-server\\myNav\\myJsNote\\移动端\\rem适配及视口适配\\viewport适配.txt");
console.log(data.toString())