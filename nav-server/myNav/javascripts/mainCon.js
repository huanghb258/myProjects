$(function () {

    let oftenUseUrlJson = null;   //本地JOSN数据，如果cookie里没有数据，将使用JOSN备用数据
    let isReqJson=false;    //如果为true表示没有cookie,需要去请求json数据


    //常用网站，列表生成，事件绑定都在这
    var often = {
        URLS: [],
        INDEX: -1,//记录当前点击‘×’号所在的index
        oldUrl: '',//记录更改前的url
        on() {
            var that = this;
            var box = $('#alertBox');
            var addUrl = $('#alertBox .js-addUrl');
            var autoIco = $('#alertBox .js-autoIco');
            var end = $('#alertBox .js-end');
            var del = $('#alertBox .js-del');
            var addEnd = $('#alertBox .js-addEnd');

            function errUrl() {
                clearTimeout(t);
                addUrl.removeClass('warnBorder').addClass('warnBorder');
                var t = setTimeout(function () {
                    addUrl.removeClass('warnBorder');
                    // addUrl.stylesheets('border', '1px solid #488ee7');
                    addUrl.attr('placeholder', 'url不合法');
                    addUrl.focus();
                    end.attr('disabled', true);
                }, 3000);
            }

            function updateUrl(rest) {
                var val = addUrl.val().trim();
                var forms = box.serializeArray();
                var url = forms[0].value;
                //检测有没http
                !(/https?/i).exec(url) && (url = 'http://' + url);

                var data = {
                    url: url,
                    txt: forms[2].value || '没写',
                    ico: forms[1].value,//原先html排在txt上面ico，改完后位置是[1]
                    order: forms[3].value || 999
                };

                if (!val) {
                    errUrl();
                    return this;
                } else if (val == that.oldUrl) {
                    rest(data);
                    return this;
                }
                var host = $.getHost(addUrl.val());
                if (!host) {
                    errUrl();
                } else {
                    rest(data);
                }
            };
            box.on('selectstart', () => false)
                .find('.title i').on('click', function () {
                that.hideBox();
            });
            addEnd.on('click', function () {
                function rest1(data) {
                    that.URLS.push(data);
                    that.URLS.sort((a, b) => a.order - b.order);
                    $.setStorage('oftenUrl', that.URLS);
                    that.showList();
                    that.hideBox();
                };
                updateUrl(rest1);
            });
            addUrl.on('blur', '', function (e) {
                if (this.value) {
                    var host = $.getHost(this.value);
                    // console.log(this.value)
                    if (!host) {
                        errUrl();
                    } else {
                        this.style.border = '1px solid #ddd';
                        if (this.value !== that.oldUrl) {
                            var reg = /https?:\/\//i;
                            var ico = '';
                            reg.exec(host) || (ico += 'http://');
                            ico += host + '/favicon.ico';
                            $('.js-autoIco').val(ico).select();
                        }
                    }
                } else {
                    errUrl();
                }
            });
            end.on('click', function () {
                function rest(data) {
                    that.URLS[that.INDEX].url = data.url;
                    that.URLS[that.INDEX].txt = data.txt;
                    that.URLS[that.INDEX].ico = data.ico;
                    that.URLS[that.INDEX].order = data.order;
                    that.URLS.sort((a, b) => a.order - b.order);
                    $.setStorage('oftenUrl', that.URLS);
                    that.showList();
                    that.hideBox();
                }

                updateUrl(rest);
            });
            del.on('click', '', () => {
                that.URLS.splice(that.INDEX, 1);
                console.log(that.INDEX);
                that.hideBox();
                $.setStorage('oftenUrl', that.URLS);
                that.showList();
            });
        },
        alert() {
            var that = this;
            var often = $('#often');
            often.one('click', 'i,.addItem', () => {
                this.on();
            })
                .on('click', 'i', function (e) {
                    var box = $('#alertBox');
                    var addUrl = $('#alertBox .js-addUrl');
                    var autoIco = $('#alertBox .js-autoIco');
                    var title = $('#alertBox .js-urlName');
                    var urlOrder = $('#alertBox .js-urlOrder');
                    var end = $('#alertBox .js-end');
                    var index = that.INDEX = $(this).parent('li').index();

                    that.oldUrl = that.URLS[index].url;
                    addUrl.val(that.oldUrl);
                    autoIco.val(that.URLS[index].ico);
                    title.val(that.URLS[index].txt);
                    urlOrder.val(that.URLS[index].order);
                    end.attr('disabled', false);
                    that.showBox($('#alertBox .js-rOrDel'));
                }).on('click', '.addItem', function () {
                that.showBox($('#alertBox .js-addList'));

            })
        },
        showBox(el) {
            $('.js-setBox').hide();
            $('#alertBox').css({'display': 'block', opacity: 1, top: 'px', left: '50%', zIndex: 999});
            $('#alertBox').find('.js-addUrl').focus();
            el.css('display', 'block');
            $('#modalBox').css({display: 'block'});
        },
        hideBox() {
            $('#alertBox').hide();
            $('#alertBox').find('input').val('');
            $('#alertBox .js-rOrDel').hide();
            $('#alertBox .js-addList').hide();
            $('#modalBox').css({display: 'none'});
        },
        showList() {
            var arr = this.URLS;
            var lis = '<ul>';
            for (var i = 0; i < arr.length && i < 12; i++) {
                lis += `
				<li>
					<i title="删除或修改">×</i>
					<a href="${arr[i].url}">
						<div class="list">
							<div class='ico'><img src="${arr[i].ico}"></div>
							<p>
								${arr[i].txt}
							</p>
						</div>
						
					</a>
				</li>`

            }
            if (arr.length < 12) {
                lis += `<li>							
						<div class="list">
							<div class='addItem'>+
							</div>
						</div>
					</li>`
            }
            lis += '</ul>';
            $('#often').html(lis);
        },
        //初始化
        init() {
            function reqUrls(that){
                return new Promise((resolve, reject) => {
                    that.URLS = $.getStorage('oftenUrl') || [];
                    if (that.URLS.length > 0) {
                        resolve('localStorage');
                    }else{
                        $.ajax({url: 'data/oftenUseUrl.json', success, error});
                        function success(data) {
                            oftenUseUrlJson = data;
                            that.URLS=oftenUseUrlJson.often;
                            isReqJson = true;
                            resolve('JSON');
                        }
                        function error(xhr, txt) {
                            reject('请求失败');
                            console.warn(txt);
                        }
                    }
                })
        }

            reqUrls(this).then(()=>{
                if(this.URLS.length==0){return;}
                this.URLS.sort((a, b) => a.order - b.order)
                // this.updateUrl();
                // this.on();
                this.showList();
                this.alert();
            })

        }
    }
    often.init();//初始化

    //前端专用导航初始数据
    class DocsJson {
        constructor(el,key) {
            this.el = el;
            this.urls = this.getStorageUrls(key);
        }
        getStorageUrls(key) {
            let urls = $.getStorage(key);
            if (!urls &&Array.isArray(urls)&&urls.length > 0) {
                return urls;
            } else if(oftenUseUrlJson){
                return oftenUseUrlJson[key];
            }else{
                isReqJson=true;
                return null;
            }
        }
    }
    let docsJson = {
        jsDocs: new DocsJson($('#group-docs .js-jsDocs'),'jsDocs'),
        jsVaried: new DocsJson($('#group-docs .js-jsVaried'),'jsVaried'),
        cssDocs: new DocsJson($('#group-docs .js-cssDocs'),'cssDocs'),
        cssVaried: new DocsJson($('#group-docs .js-cssVaried'),'cssVaried'),
    };

    function reqOftenJson() {
        return new Promise(function (resolve,reject) {
            if(!isReqJson){
                resolve('localStorage');
            }else{
                $.ajax({url: 'data/oftenUseUrl.json', success, error});
                function success(data) {
                    oftenUseUrlJson = data;
                    for(let k in docsJson){
                        docsJson[k].urls ||  (docsJson[k].urls=oftenUseUrlJson[k])
                    }
                    isReqJson=false;
                    resolve(oftenUseUrlJson)
                }
                function error(xhr) {
                    console.warn(xhr.statusText);
                    isReqJson=false;
                    resolve(false)
                }
            }
        })
    }

    reqOftenJson().then((state)=>{
        //前端专用导航，生成列表构造函数
        function createNavList(el, urls) {
            if ($(el).length <= 0) {
                console.warn('找不到el元素');
                return;
            }
            this.el = el;
            this.urls = urls;
            this.NavList = () => {
                var el = this.el;
                var urls = this.urls;
                if (urls.length == 0 || !Array.isArray(urls)) {
                    el.html('<li>被你删光了</li>');
                    return false;
                }
                urls.sort((a, b) => a.order - b.order);
                var lis = '';
                for (var i = 0; i < urls.length && i < 9; i++) {
                    lis += `
					<li><a href="${urls[i].url}">${urls[i].title}</a></li>
				`;
                }
                if (urls.length > 9) {
                    var li = '<li><a href="javascript:;" class="toggle">更多&gt;&gt;</a>';
                    var ol = ' <ol class="more" style="display: none;">'
                    for (var i = 9; i < urls.length; i++) {
                        ol += `
						<li><a href="${urls[i].url}">${urls[i].title}</a></li>
					`;
                    }
                    ol += '</ol>';
                    li += ol + '</li>';
                    lis += li;
                }
                el.html(lis);
            };
        }
        var jsDocs = new createNavList(docsJson.jsDocs.el, docsJson.jsDocs.urls);
        var jsVaried = new createNavList(docsJson.jsVaried.el, docsJson.jsVaried.urls);
        var cssDocs = new createNavList(docsJson.cssDocs.el, docsJson.cssDocs.urls);
        var cssVaried = new createNavList(docsJson.cssVaried.el, docsJson.cssVaried.urls);

        //生成导航列表
        jsDocs.NavList();
        jsVaried.NavList();
        cssDocs.NavList();
        cssVaried.NavList();


        //导航增删改
        !function (labels) {
            var delList = [];//删除记录
            var urls;//缓存
            var label = '';//当前属性名
            var oldVal = '';//保存旧value值，好知道value是否改变
            var group = $('#group-docs');
            var examine = $('#examine');
            var ulItem = examine.children('.item');

            var methods = {}; //公共方法
            //更新/生成列表
            methods.updateList = function (label) {
                //复制一份
                urls = urls && urls.length > 0 ? urls : labels[label].urls.slice(0, labels[label].urls.length);
                var lis = '';
                if (!Array.isArray(urls) || !urls.length) {
                    lis = `<li>
                            <h3 style="height: 30px;padding:30px 0;text-align: center;">
                                没有数据
                            </h3>
                        </li>`;
                    return;
                }
                //生成列表
                for (var i = 0; i < urls.length; i++) {
                    lis += `<li>
                        <a href="javascript:;">删除 ${urls[i].order + 1.}</a>                       
                        <input name="url" value="${urls[i].url}">
                        <input name="title" value="${urls[i].title}">
                    </li>`;
                }
                lis += `<li class="last">
                            <h4 style="height: 30px;padding:30px 0;text-align: center;">
                                没有更多数据了
                            </h4>
                        </li>`;
                ulItem.html(lis);
            };
            //收集li单列表单数据并验证url合法性
            methods.liSerialize = function (li, val) {
                var host = $.getHost(val);
                if (!host) {
                    return null;
                }
                var data = {};
                host = (/http/i).exec(host) ? host : 'http://' + host;
                data.url = host;
                data.title = li.children('input[name=title]')[0].value;
                data.order = li.children('.num').val() || li.index();
                return data;
            };
            //更新urls    //一些修正处理放在这里
            methods.updateUrls = function (data) {
                var http = (/http/i).exec(data.url) ? '' : 'http://';
                data.url = http + data.url;
                data.title = data.title || '没写';
                data.order = data.order >= urls.length ? urls.length : data.order - 1;
                if (data.order + 1 < urls.length) {
                    urls.unshift(data);
                    urls.sort((a, b) => a.order - b.order);
                    urls.forEach((v, i) => v.order = i);
                } else {
                    urls.push(data);
                }
            };
            //如果新增url合法，更新ulls
            methods.isAdd = function () {
                var newLi = ulItem.children('.new');
                if (newLi.length == 0) {
                    return true;
                } else {
                    var li = $(newLi[0]);
                    var urlInput = li.children('input[name=url]');
                    if (!urlInput.val()) {
                        this.errUrl(urlInput);
                        return false
                    }
                    var data = methods.liSerialize(li, urlInput.val());
                    if (!data) {
                        this.errUrl(urlInput);
                        console.warn('你倒是添写啊');
                        return false;
                    }
                    methods.updateUrls(data);
                }
                return true;
            }
            //url不合法的处理方法
            methods.errUrl = function (el) {
                el.focus();
                el.addClass('warnBorder');
                setTimeout(() => {
                    el && el.removeClass('warnBorder');
                }, 5000);
            };
            //显示设置框并生成列表
            group.on('click', '.js-addOrdel', function () {
                urls = null;//清空缓存，不然下次打开还保留上次的数据
                delList = [];
                label = '';
                oldVal = '';

                $('.js-setBox').hide();//关闭所有小窗口
                label = $(this).attr('data-label');
                methods.updateList(label);
                examine.css({left: '140px', top: '-200px'});
                examine.show();
                $('#modalBox').css({display: 'block'});

            });
            ulItem.on('mousedown', function (e) {
                e = e || event;
                e.stopPropagation();
            });
            examine.on('selectstart', () => false)
            //删除
                .on('click', 'li>a', function (e) {
                    e = e || event;
                    e.stopPropagation();
                    var li = $(this).parent('li');
                    var index = li.index();
                    // delList.push(index);
                    urls = urls || labels[label].urls.slice(0, labels[label].urls.length);
                    urls.splice(index, 1);
                    urls.forEach((v, i) => v.order = i);
                    urls.sort((a, b) => a.order - b.order);
                    if (urls.length === 0 && ulItem.children('li.new').length == 0) {
                        var p = '<p style="margin-top: 15px;text-align: center">全删光了，保存并刷新后回到初始值</p>'
                        ulItem.html(p);
                    } else {
                        methods.updateList(label);
                    }
                    li.css('display', 'none');
                })
                //新增
                .on('click', '.js-add', function () {
                    if (!methods.isAdd()) {
                        return;
                    }
                    methods.updateList(label);
                    var lastLi = `
                    <li class="new">
                        <span>序</span>                       
                        <input name="order" value="${urls.length + 1}" class="onlyNum num" placeholder="序号">
                        <input name="url" value="" placeholder="http://">
                        <input name="title" value="" placeholder="站名">
                    </li>
                    `;

                    if (ulItem.children('.last').length) {
                        ulItem.children('.last').remove();
                    }
                    // var liNode=document.createElement('li');
                    // liNode.classList.add("new");
                    // liNode.innerHTML=lastLi;

                    ulItem.append(lastLi);
                    ulItem.scrollTop(ulItem.height());

                })
                //保存
                .on('click', '.js-save', function () {
                    methods.isAdd();
                    urls.sort((a, b) => a.order - b.order);
                    urls.forEach((v, i) => vorder = i);
                    $.setStorage(label, urls);
                    docsJson[label].urls = urls;
                    labels[label].urls = urls;
                    labels[label].NavList();
                    urls = null;
                    delList = [];
                    $('#modalBox').css({display: 'none'});
                    examine.hide();
                })
                .on('focus', 'input', function (e) {
                    e = e || event;
                    var parentLi = $(this).parent('li');
                    !parentLi.hasClass('new') && parentLi.css({borderColor: '#488ee7'})
                        .siblings('li').css({borderColor: 'transparent'})
                })
                .on('focus', 'input[name=url]', function () {
                    oldVal = this.value;
                })
                .on('blur', 'li:not(.new) input[name=url]', function () {
                    if (oldVal == this.value) {
                        return;
                    }
                    var li = $(this).parent();
                    var index = li.index();
                    var data = methods.liSerialize(li, this.value);
                    if (!data) {
                        methods.errUrl($(this));
                        var url = this.value;
                        url = /http/i.exec(url) ? url : 'http://' + url;
                        urls[index].url = url;
                        urls[index].err = true;
                        return;
                    }
                    urls[index].err = false;
                    urls[index].url = data.url;
                })
                .on('keydown', 'input', function (e) {
                    e = e || event;
                    if (e.keyCode !== 38 && e.keyCode !== 40 && $(this).parent().hasClass('new')) {
                        return;
                    }
                    var parentLi = $(this).parent('li');
                    var prevLi = parentLi.prev();
                    var nextLi = parentLi.next();
                    var index = parentLi.index();
                    //下：40  上：38
                    if (e.keyCode == 38) {
                        if (index <= 0) {
                            return;
                        }
                        change(prevLi, index - 1);
                        return false;
                    } else if (e.keyCode == 40) {
                        if (index + 1 >= urls.length) {
                            return;
                        }
                        change(nextLi, index + 1);
                        return false;
                    }

                    function change(changeLi, changeIndex) {
                        changeLi.css({borderColor: '#488ee7'})
                            .siblings('li').css({borderColor: 'transparent'});
                        //a=[b,b=a][0],交换位置
                        urls[index] = [urls[changeIndex], urls[changeIndex] = urls[index]][0];
                        //index变了，order也要跟着变
                        urls[index].order = [urls[changeIndex].order, urls[changeIndex].order = urls[index].order][0];

                        methods.updateList(label);
                        setTimeout(() => {
                            $(ulItem.children('li')[changeIndex]).children('input[name=url]').focus();
                        }, 10);
                    }
                });
            $('.docs').on('click', '.toggle', function (e) {
                e = e || event;
                e.stopPropagation();
                var more = $(this).next('.more');
                more.toggle();
                more.on('click', function (e) {
                    e = e || event;
                    e.stopPropagation();
                })
                document.addEventListener('click', function () {
                    more.hide();
                })
            })
            //关闭设置框
            examine.on('click', '.close', function () {
                $('#modalBox').css({display: 'none'});
                examine.hide();
            });
        }({jsDocs: jsDocs, jsVaried: jsVaried, cssDocs: cssDocs, cssVaried: cssVaried});
    },()=>{
    	alert('没有cookie或cookie数据不全,也没有JSON文件\n点击右侧导出JOSN可以生成一个新json文件')
    	console.warn('没有cookie或cookie数据不全,也没有JSON文件')
    })

    //全局事件
    //box启用拖拽
    $('.js-setBox').pullBox();

    //阻止input非数字输入
    $('.main').onlyNum(999,-1);
});