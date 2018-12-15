$(function () {
    const path = './myNav/myJsNote';//向服务器请求myJsNote的相对路径，即以相对于app.js
    const newPath = 'myJsNote'; //index.html相对myjsnote的路径
    const noteList = $('#noteList');
    const txtView = $('#txt-view');
    const serverUrl = '/fsReaddir';
    const menu = $('#contextmenu');//右键菜单


    let AP = '';  //存放myJsNote的绝对路径
    window.localSearchTargetArr={files:[],folders:[]};

    //请求数据并初始化列表
    function init() {
        let fragment = document.createDocumentFragment();

        function reqAjax(type, data, url) {
            $.ajax({
                type,
                data,
                url,
                // timeout:600,
                dataType: 'jsonp',
                success(data) {
                    done(JSON.parse(data));
                },
                error(XMLHttpRequest, textStatus, errorThrown) {
                    // console.log(XMLHttpRequest);
                    showHint();
                }
            })
        }

        //请求myJsNote失败后调用
        function showHint() {
            let hint = noteList.siblings('.local-hint');
            debugger
            hint.show();
            hint.on('click', 'a.load-html', function (e) {
                e = e || event;
                e.preventDefault();

                noteList.load('data/htmlFragment.html',function (response,status,xhr) {
                    console.log(response);
                })
                // noteList.show();
            })
        }
        //成功后的回调函数
        function done(data) {
            let newData = classify(data);
            // console.log(newData);
            createRoot(newData);
            createSubDir(newData, 1);
            noteList.html('');
            noteList[0].appendChild(fragment);
            noteList.find('ul.sublist-0 li>a').siblings().slideUp();
            noteList.show();
        }

        //给返回的数组划分层级
        function classify(data) {
            let basePath = data.project_path;
            let baseLen = data.project_path.length;
            let filesLen = data.files.length;
            let foldersLen = data.folders.length;
            let len = filesLen > foldersLen ? filesLen : foldersLen;
            // console.log(len);
            let result = {files: [], folders: []};

            for (let i = 0, x; i < len; i++) {
                if (i < filesLen) {
                    //截取绝对路径后面部分
                    let f = data.files[i].slice(baseLen);
                    //检测有多个'\',一个'\'代表一层目录
                    x = f.match(/\\/g).length - 1;//最少有一个'\',不考虑匹配不到的问题
                    result.files[x] === undefined && (result.files[x] = []);
                    result.files[x].push(f);
                }
                if (i < foldersLen) {
                    let f = data.folders[i].slice(baseLen);
                    x = f.match(/\\/g).length - 1;
                    result.folders[x] === undefined && (result.folders[x] = []);
                    result.folders[x].push(f);
                }
            }
            AP = result.project_path = basePath;
            return result;
        }

        //首次生成html，根目录的文件
        function createRoot(data) {
            let
                ulNode = document.createElement('ul'),
                basePath = data.project_path,
                folder = data.folders[0],
                files = data.files[0],
                html = '';
            if (folder) {
                for (let i = 0, len = folder.length; i < len; i++) {
                    // '\'在匹配时容易出错，先把它替换成$
                    let select = folder[i].replace(/\\/g, '##');
                    let href=basePath + folder[i];
                    html +=
                        `<li class="dir" data-fname="${select}">
                    <a href="${href}" id="${href.replace(/[\\:\.\(\)]/g,'_')}">
                        <i class="folder-close"></i>
                        <i class="iconfont icon-wenjianjia"></i>
                        <span>${folder[i].slice(1)}</span>
                    </a>  
                      <ul class="sublist-1"></ul>                  
                </li>`;
                    localSearchTargetArr.folders.push({path:basePath + folder[i],name:folder[i].slice(1)})
                }
            }

            if (files) {
                for (let i = 0, len = files.length; i < len; i++) {
                    let type = files[i].slice(files[i].lastIndexOf('.') + 1);
                    let href=basePath + files[i];
                    html +=
                        `<li class="${type}">
                    <a href="${href}" id="${href.replace(/[\\:\.\(\)]/g,'_')}">
                        <span>${files[i].slice(1)}</span>
                    </a>
                </li>`;
                    localSearchTargetArr.files.push({path:basePath + files[i],name:files[i].slice(1)});
                }
            }

            $(ulNode).addClass('sublist-0').html(html);
            fragment.appendChild(ulNode);
        }
        //生成后面的子目录
        function createSubDir(data, index) {

            //<ul class="sublist-${1}  data-parentNode="${select}"></ul>
            let
                basePath = data.project_path,
                folder = data.folders[index],
                files = data.files[index];

            if (folder) {
                for (let i = 0, len = folder.length; i < len; i++) {
                    // '\'在匹配时容易出错，先把它替换成##
                    let parentPath = folder[i].slice(0, folder[i].lastIndexOf('\\')).replace(/\\/g, '##');
                    let select = 'li[data-fName="' + parentPath + '"]';
                    let parentLi = fragment.querySelector(select);
                    let html = '';
                    let href=basePath + folder[i];
                    let content=folder[i].slice(folder[i].lastIndexOf('\\') + 1);
                    html +=
                        `<li class="dir" data-fname="${folder[i].replace(/\\/g, '##')}">
                    <a href="${href}" id="${href.replace(/[\\:\.\(\)]/g,'_')}">
                        <i class="folder-close"></i>
                        <i class="iconfont icon-wenjianjia"></i>
                        <span>${content}</span>
                    </a>  
                    <ul class="sublist-${index + 1}"></ul>                  
                </li>`;
                    localSearchTargetArr.folders.push({path:href,name:content})
                    let ulNode = parentLi.querySelector('.sublist-' + (index));
                    $(ulNode).html($(ulNode).html() + html);
                    parentLi.appendChild(ulNode);
                }
            }
            if (files) {
                for (let i = 0, len = files.length; i < len; i++) {
                    let type = files[i].slice(files[i].lastIndexOf('.') + 1);
                    let parentPath = files[i].slice(0, files[i].lastIndexOf('\\')).replace(/\\/g, '##');
                    let select = 'li[data-fName="' + parentPath + '"]';
                    let liNode = document.createElement('li');
                    let href=basePath + files[i];
                    let html = '';
                    html +=
                        `
                <a href="${href}" id="${href.replace(/[\\:\.\(\)]/g,'_')}">
                    <span>${files[i].slice(files[i].lastIndexOf('\\') + 1)}</span>
                </a>
               `;
                    localSearchTargetArr.files.push({path:basePath + files[i],name:files[i].slice(files[i].lastIndexOf('\\') + 1)});
                    $(liNode).addClass(type).html(html);
                    fragment.querySelector(select).appendChild(liNode);
                }
            }

            //如果还有文件就执行递归调用
            let maxLen = data.files.length > data.folders.length ? data.files.length : data.folders.length;
            index + 1 < maxLen && createSubDir(data, index + 1);

        }

        //发送请求
        reqAjax('GET', {path}, serverUrl);
    }

    init();

    //事件绑定
    function on() {
        let old = null;//存放上一次点击的a,如果重复点击就不做那么多操作了
        let nowMenu = null;//保存当前右击的元素
        let clickTimer = null;  //双击延时
        let upTxtTime=null;     //更新文档延时
        let isClickUp=true;     //控制一定时间内不能再点

        //右击事件
        noteList.on('click',function (e) {
            e=e||event;
            e.stopPropagation();
            $("#searchResult").hide();
        })
            .on('contextmenu', 'li>a', function (e) {
            e = e || event;
            event.preventDefault();
            e.stopPropagation();
            nowMenu = $(this);
            let offsetX = $('aside.l-aside').offset().left;
            let offsetY = $('aside.l-aside').offset().top;
            menu[0].style.left = event.pageX - offsetX + "px";
            menu[0].style.top = event.pageY - offsetY + "px";
            menu.show();
            document.addEventListener('contextmenu', function () {
                menu.hide();
            });
            document.addEventListener('click', function () {
                menu.hide();
            });
        })
            .on('contextmenu', 'li.dir>a', function (e) {
                console.log(111);
                menu.find('.open-txt').addClass('disabled');
            })
            .on('contextmenu', 'li.txt>a', function (e) {
                menu.find('.open-txt').removeClass('disabled');
            })

            //点击文件夹事件
            .on('click', 'li.dir>a', function (e) {
                e = e || event;
                e.preventDefault();
                $(this).children('i:first-child').toggleClass('folder-open')
                    .toggleClass('folder-close');
                $(this).siblings().slideToggle(200);
                $(this).toggleClass('open')
            })

            //点击文本
            .on('click', 'li.txt>a', function (e) {
                e = e || event;
                e.preventDefault();
                //新增本地搜索提示
                $('#local-list').hide();
                // clearTimeout(clickTimer);
                // clickTimer=setTimeout(()=>{
                let href = $(this).attr('href');
                let url = href.replace(AP, newPath);
                let http = window.location.origin;
                if (/\..+\./.exec(href)) {
                    console.warn('文件名不带点（非后缀的点）');
                    return;
                }
                if (http.slice(0, 4) !== 'http') {
                    window.open(http + href);
                } else if (href == old && txtView.hasClass('show-txt')) {
                    hideTxt();
                } else {
                    old = href;
                    txtActive($(this));
                    $.ajax({url, success: showTxt, error: err});
                }
                // } ,250);
            })

            //双击打开（取消了）开启双击要使单击延时
            // .on('dblclick', 'li.txt>a', function (e) {
            //     clearTimeout(clickTimer);
            //     //打开文件：start /normal H:/1.txt
            //     //打开目录：start /dpatch H:
            //     const target='start /normal '+$(this).attr('href');
            //     $.ajax({
            //         type:'GET',
            //         data:{target},
            //         url:'/command',
            //         success(data){
            //             console.log(data);
            //         },
            //         error(xhr,txt){
            //             console.error(xhr);
            //         }
            //     })
            // })
            .on('click', 'li.html>a', function (e) {
                e = e || event;
                e.preventDefault();
                let href = $(this).attr('href');
                let url = href.replace(AP, newPath);
                window.open(url);
            })

        //右键菜单
        menu.on('click', function (e) {
            e = e || event;
            e.stopPropagation();
        })
            .on('click', 'li.open-txt', function () {
                menu.hide();
                if ($(this).hasClass('disabled')) {
                    return false
                }
                const target = 'start /normal ' + nowMenu.attr('href');
                command(target);
            })
            .on('click', 'li.open-folder', function () {
                menu.hide();
                let dis = nowMenu.attr('href').slice(0, nowMenu.attr('href').lastIndexOf('\\'));
                const target = 'start /dpatch ' + dis;
                command(target);
            })

            //控制文本内容框的菜单列表
        $('.l-aside .menu-list').on('click', function (e) {
            e = e || event;
            e.preventDefault();
        })
            .on('selectstart', () => false)
            .on('click', 'a.colse', function () {
                hideTxt();
            })
            .on('click', 'a.toTop', function () {
                $(document).scrollTop(0);
            })
            .on('click', 'a.toBottom', function () {
                $(document).scrollTop(txtView.outerHeight());
            })
            .on('click', 'a.upTxt', function () {
                if(isClickUp){
                    util();
                    isClickUp=false;
                    setTimeout(()=>{
                        isClickUp=true;
                    },1200);
                }
                function util(){
                    txtView.removeClass('show-txt');
                    txtView.one('transitionend', function () {
                        console.log('transitionEnd');
                        let url = old.replace(AP, newPath);
                        $.ajax({url, success: showTxt, error: err});
                    })
                }

            })
            .on('click', 'a.alert', function () {
                const target = 'start /normal ' + old;
                command(target);
            })

        //git push上传
        $('.git-btn .gitPush').on('click', function (e){
            const target='start /normal ' + '\\myProjects\\nav-server\\myNav\\bat\\push.bat';
            const w=$('#cmdWindow');

            w.show();
            // let i=1;
            // let t=setInterval(()=>{
            //     let float=Array(i).join('。。。')
            //     i++;
            //     i>3&&(i=1);
            //     w.children('.data-txt').html('执行中'+float);
            // },500)
            command(target);
            function callback(data) {
                clearTimeout()
                w.children('.data-txt').html(data)
            }
        })
        //git pull 下拉
        $('.git-btn .gitPull').on('click', function (e){
            alert('pull还是手动吧,打开目录');
            const target = 'start /dpatch ' + '\\myProjects';
            command(target);
        })


        //隐藏
        function hideTxt() {
            txtView.removeClass('show-txt');
            txtView.children('pre').hide();
            $('.l-aside .menu-list').hide();
            // txtView.on('transitionend',function () {
            //     $(this).hide();
            // });
        }

        //显示
        function showTxt(data) {
            let {arr, regArr} = regAll();

            let reg = new RegExp(arr.join('|'), 'ig');
            data = data.replace(reg, function () {
                let arg = arguments;
                let result = '';
                // debugger
                for (let i = 0; i < regArr.length; i++) {
                    let r = new RegExp(regArr[i].reg, 'i');
                    if (r.exec(arg[0])) {
                        result = regArr[i].method(arg);
                        break;
                    }
                }
                return result;
            });
            txtView.children('pre').html(data);
            txtView.children('pre').show();
            txtView.addClass('show-txt');
            $('.l-aside .menu-list').show();
        }

        function txtActive(el) {
            noteList.find('li.txt>a.active').removeClass('active');
            el.addClass('active');
        }

        //错误
        function err(xhr, txt) {
            hideTxt();
            console.log(txt);
        }

        //执行cmd命令
        function command(target,callback){
            $.ajax({
                type: 'GET',
                data: {target},
                url: '/command',
                success(data) {
                    if(callback&&typeof callback=='function'){
                        callback(data);
                    }else{
                        // console.log('cmd命令执行成功：',data);
                    }
                },
                error(xhr, txt) {
                    console.warn('cmd命令执行失败：',xhr);
                }
            })
        }
    }

    on();

    //
    function regAll() {
        let arr = [];
        let regArr = [//存放所有要匹配的正则
            {
                reg: '(?:\n(.{1,35}[:：])(\r|\n))',
                count: 2,//分组个数
                indexs: [1, 2],//要给method传的分组,从1开始数
                method(arg) {
                    return `\n<mark>${arg[this.indexs[0]]}</mark>${arg[this.indexs[1]]}\r`;
                }
            }
        ];
        arr.push(regArr[0].reg);

        //添加规则，参考regArr[0]别忘了括号，注意在arr.push之前添加
        function addReg(data) {
            let {reg, count, method} = data;
            let indexs = [];
            let c = regArr[regArr.length - 1].count; //每一个count是之前的总和
            for (let i = 0; i < count; i++) {
                indexs[i] = c + i + 1;
            }
            count += c;
            regArr.push({reg, count, indexs, method});
            arr.push(reg);
        }
        //所有匹配里可能再出现<>的method里都应该调用
        function _escape(str){
            return str.replace(/[<>]/g,function (a) {
             return a==='<'?'&#60;':'&#62;';
            })
        }

        addReg({
            reg: '(([\t {2,20}]\/\/.+)[\r\n])', count: 2,
            method(arg) {
                return `\t<span class="color-green">${_escape(arg[this.indexs[0]])}</span>\r`;
            }
        });
        addReg({
            reg: '(###a (.{1,30}) *(http.+);)', count: 3,
            method(arg) {
                return `<a href="${arg[this.indexs[2]]}">${arg[this.indexs[1]].replace(/[:：]/g, '')}</a>`;
            }
        });
        addReg({
            reg: '([<>])', count: 1,
            method(arg) {
                return _escape(arg[0]);
            }
        });
        //可以匹配代码高亮
        //a.replace(/(.|\s)+#end[\t\n]?/g,555);
        return {arr, regArr};
    }

})