//添加jquery全局方法,这此方法以后可以用上，分开写在这里
$(function () {
    //点击非自身时隐藏
    //如果隐藏元素不需要冒泡，直接e.stopPropagation();然后document不判断
    $.fn.autoHide = function () {
        var el = $(this);
        $(document).on('click', function (e) {
            if (el.is(':visible') && (!$(e.target)[0].isEqualNode(el[0]) && el.has(e.target).length === 0)) {
                el.hide();
            }
        });
        return this;
    };

    //拖拽事件
    //有个问题，如果调用对象自适应宽高，当点击可以决定其宽高的子元素触发拖拽时，this的宽高会跟着拖拽变化
    //解决：要么设置固定宽高，要么阻止子元素冒泡，不让其触发拖拽
    //阻止冒泡缺点：难触发，只能点父元素而不能碰到子元素
    //注意：这里面单独设置了a 元素的冒泡，调用时要注意
    $.fn.pullBox = function () {
        var that;
        var disX = 0;
        var disY = 0;
        var parentX,parentY;//有定位的父级元素相对内容区的位置，用于计算that是否拖拽超范围
        this.on('mousedown', function (ev) {
            that=$(this);
            parentX=$(this.offsetParent).offset().left;
            parentY=$(this.offsetParent).offset().top;

            //第一次时获取transform的值
            if(this.translateX==undefined){
                var matrix=that.css('transform');//如果没设置过transform返回'none'
                if(matrix!='none'){
                    //返回的是'matrix(...)',括号里的就是，用正则去截取
                    matrix=matrix.replace(/[(matrix)\(\)]/ig,'');
                    matrix=matrix.split(',');
                    this.translateX=matrix[4];
                    this.translateY=matrix[5];
                }else{
                    this.translateX=0;
                    this.translateY=0;
                }
            }


            // //点击到后代a元素并拖拽时表现得非常奇怪，所以这里禁止a的冒泡行为
            $(this).on('mousedown', 'a,input', function (e) {
                e = e || event;
                e.stopPropagation();
            });
            //$(this).offset().left是元素左上角相对于内容区的位置(html),如果body默认的margin:8没去掉，还要计算上去
            // 而且还要考虑translateX/Y的影响
            // disX = ev.pageX- $(this).offset().left;
            //disY = ev.pageY - $(this).offset().top;

            // //改成this.offsetLeft，相对于定位的父元素的位置，原生offsetLeft不计算translate,刚好
            //计算鼠标距离this左向角的偏移量
            disX = ev.pageX - this.offsetLeft;
            disY = ev.pageY - this.offsetTop;

            //千万要在absolute相对于html时查看打印的值，不然要考虑各种影响，累死
            // var x = ev.pageX, y = ev.pageY;
            // console.log('disX:' + disX, 'disY:' + disY);
            // console.log('offsetLeft:' + this.offsetLeft, 'offsetTop:' + this.offsetTop);
            // console.log('pageX:' + x, 'pageY:' + y);


            $(document).on('mousemove', function (ev) {
                var el=that[0];
                ev = ev || event;
                var x= ev.pageX - disX;
                var y=ev.pageY - disY;
                if(el.minX===undefined&&(x+parentX)<=-el.translateX){
                    el.minX=x-el.translateX-(x+parentX);
                }
                if(el.minY===undefined&&(y+parentY)<=-el.translateY){
                    console.log((y + parentY));
                    console.log(parentY);
                    el.minY=y-el.translateY-(y+parentY);
                }
                el.minX!=undefined&&(x+parentX)<=-el.translateX&&(x=el.minX);
                el.minY!=undefined&&(y+parentY)<=-el.translateY&&(y=el.minY);
                that.css('left', x);
                that.css('top', y);
            });
            $(document).on('mouseup', function (ev) {
                ev = ev || event;
                $(this).off('mousedown');
                $(this).off('mousemove');
            });
        });
        return this;
    };

    //阻止input非数字输入，如果有参数，控制其最大/最小值
    //注意，修改为绑定在父级元素上，不然动态增加的input匹配不到，一般直接让body调用就好了
    $.fn.onlyNum = function (max = NaN, min = NaN) {
        this.on('input','input.onlyNum' ,function () {
            //新增允许负值
            let minus='';
            /^-{1}/.exec(this.value)&&(minus='-');
            this.value = minus+this.value.replace(/\D/ig, '');
            !isNaN(max) && this.value > max && (this.value = max);
            !isNaN(min) && this.value < min && (this.value = min);
        });
        return this;
    };

    $.extend({
        setStorage: function (key, val) {
            if (typeof key === 'undefined' && typeof val === 'undefined') {
                return false;
            }
            ;
            //是添加数据还是直接替换？还是在外面调用get好了
            // var s=this.getStorage('key');
            window.localStorage.setItem(key, JSON.stringify(val));
            return true;
        },
        getStorage: function (key) {
            if (typeof key === 'undefined') {
                return null
            }
            ;
            return JSON.parse(window.localStorage.getItem(key));
        },

        //获取完整url的host部分，自己写的正则,勉强能用，网上一时没找到更好的，先用着
        //参数2表示是否保留http/https,默认保留
        //不考虑ftp
        getHost: function (str, t = true) {
            if (typeof str === 'undefined' || typeof str !== "string") {
                console.warn('getHost参数类型必须是String');
                return null;
            }
            /*
                括号内的?:是不让此()计入分组，
                前两个括号匹配http/https可有可无
                后面跟着的是子塔名(www/5sing...),数字加字母+.,也可以没有
                接着是主域，数字加字母加.加后缀两到3个字母组成，/后面的不匹配
            */
            // var reg=/(?:http:\/\/)?(?:https:\/\/)?((?:[0-9a-z]+\.)?[0-9a-z]+\.[a-z]{2,3})(?:\.cn)?\/?/i;

            //url没有/,就添加，方便后面以/结束匹配
            !/\..+\//.exec(str) && (str += '/');

            //修正后，增加^,让http前后不能紧跟着非法字符
            //增加判断子域和主域名不能超11位，反正很少见
            //后缀最多3位改为允许最多为4位，且以"/"结束
            var reg = /^(?:http:\/\/)?(?:https:\/\/)?(([0-9a-z]{2,11}\.)?([0-9a-z]{2,11}\.)([a-z]{2,4}))(\.cn)?\//i;
            var host = reg.exec(str);
            if (!host) {
                return null;
            } else if (!t) {
                return host[0].replace(/^https?\/\//, '')
            }
            return host[0].replace(/\/$/, '');
        },
    });

    //阻止模态框默认事件
    $('#modalBox').on('mousedown',function(e){
        console.log(1);
        e=e||event;
        e.stopPropagation();
        e.preventDefault();
    });
});				