/*
	记录下遇到的小坑：
		1.JSONP请求时callback没指定为'cb'导致一直请求失败
		2.index=index || -1; 当index自增为零时其值也为false,这样的写法有问题
		  index++ >max&& (index=-1)	&&左边先判断index是否>max后++，注意括号
		3.a=$('div').children()		a[index]不是jq对象,调用jq方法要加$
		4.keydown时件里：switch(n){case n:a();console.log(this)}
			a()里面的this并不是指向事件元素,.log里的this指向正常
		5.元素自动居中，因页面内容增加突然出现滚动条时，body宽度改变，元素会晃动一下
		6.$('*').on(事件，指定子元素，data,cb)传递数据在第三个参数上而不是放在cb里
		7.当input获取焦点时切换到其它页面再返回，会重新触发focus事件,这里用click代替
		8.用.on()绑定事件时回调函数使用ES6箭头函数this指向不是事件元素
		9.如果$.ajax请求返回的不是callback并且不是标准的json,dataType不能乱加,会报错
		10.用debugger观察对象里的值永远是not defined，因为只有当前执行语句上下文才有值		
*/		
//百度搜索

$(function(){
	var URLS={
		www:'https://www.baidu.com/s?ie=utf-8&wd=',
		image:'http://image.baidu.com/search/index?tn=baiduimage&word=',
		tieba:'https://tieba.baidu.com/f?kw=',
		map:'http://map.baidu.com/'
	};		
	var option=	'www';//默认值
	var URL=URLS[option];//默认值
	var sText=$('#searchText');
	var ul=$('#searchResult');
	var SBtn=$('#baidu .search');
	var tabBar=	$('#baidu .tab-bar');

	let changeTime=null;	//两分钟后自动切换回网页搜索
	let reqTxt=null;	//搜索内容请求设延时300，不然1秒5、6次工程太大了

	sText.oldVal=sText.val();//!!
	//事件绑定
	sText.on('input',function(){
		var val = this.value;
		reqAjax(val,option);
		if(option==='local'){
            clearTimeout(reqTxt);
            reqTxt=setTimeout(()=>{ reqTxtContent(val)},300)
		}
        function reqTxtContent(val){
            $.ajax({
                type:'post', url:'/seek',
                data:{path:'./myNav/myJsNote',word:val},
                success(files){
                    // console.log('seek',files);
					let data={};
                    data.content=files.fileList;
                    showLocalList(data);
                },
                error(xhr,txt){ console.log(txt); }
            })
        }
	})
		.on('click',function(){
			var val = this.value;
			//如果没有输入搜索内容，就显示历史搜索
			if(val.trim()===''&&ul.css('display')==='none'){
				option!=='local'&&showSuggest();
			}else if(val.trim()){
                reqAjax(val,option);
			}
		})
		.on('keydown',function(e){
			if(option==='local'){return}
			e=e||event;
			var code=e.keyCode;
			var val=this.value;
			if(!val&&ul.css('display')=='none'){
				showSuggest();
				return ;
			}

			//这里只简单判断方向键，可能有其它键会影响懒得管了
			//如果是非方向键并且对value造成了影响(提示列表可能已发生改变)，重置下标
			if(code!==38&&code!==40&&code!==37&&code!==39&&sText.oldVal!=this.value){
				ul.childIndex=-1;
				sText.oldVal=this.value;
			}
			switch(code){
				//回车：13
				case 13:
					openBaidu(URL,val,option,e);
					break;
				//上
				case 38:
					selectIndex.bind(this)(38);
					break;
				//下
				case 40:
					selectIndex.bind(this)(40);
					break;
			}

			function selectIndex(code){
				var lis=ul.children('li');
				ul.childIndex ===undefined && (ul.childIndex= -1);
				code===38&&ul.childIndex==-1&&(ul.childIndex= lis.length-1);
				code===40?
					++ul.childIndex >=lis.length-1 && (ul.childIndex=-1):
					--ul.childIndex <0 && (ul.childIndex=-1);
				if(ul.childIndex===-1){
					$(lis[0]).removeClass('active').siblings().removeClass('active');
					this.value=sText.oldVal || '';
				}else{
					$(lis[ul.childIndex]).addClass('active').siblings().removeClass('active');
					this.value=$(lis[ul.childIndex]).text();
				}
			}
		});
	SBtn.on('click',function(e){
		if(option==='local'){return}
		openBaidu(URL,sText.val(),option,e);
	});
	ul.on('click','li:not(:last-child)',function(e){	
		var val=$(this).text();	
		openBaidu(URL,val,option,e);
		
	}).on('mouseenter','li:not(:last-child)',function(e){
		$(this).addClass('active').siblings().removeClass('active');
		ul.childIndex=$(this).index();
	});
	/*
		图片：http://nssug.baidu.com/?ie=utf-8&wd=牛&prod=image&cb=jQuery
		tie吧：https://tieba.baidu.com/suggestion?query=faker&ie=utf-8
	*/
	tabBar.on('click','>span',function(){
		var span=$(this);	
		//再次点击变跳转
//		if(span.hasClass('active')){
//			window.open(span.attr('href'));
//		}
		span.addClass('active').siblings().removeClass('active');
		SBtn.text(span.attr('data-txt'));
		sText.prop('placeholder','当前是'+span.attr('data-txt'))
		option=span.attr('domain') || 'www';
		URL=URLS[option];

		//5分钟后自动切换回网页搜索
        clearTimeout(changeTime);
		if(option!=='www'){
            changeTime=setTimeout(()=>{
                tabBar.children('span.www').click();
            },1000*60*5)
		}
	});
	ul.on('click','.js-clearSuggest',option,function(e){
		window.localStorage.removeItem(option+'suggests');
		ul.html('').hide();
	});
	ul.on('click','li .del',function(e){
		var li=$(this).parent();
		var val=li.text();
		var arr=$.getStorage(option+'suggests');
		li.remove(); 
		for(var i=0;i<arr.length;i++){
			if(arr[i].val==val){
				arr.splice(i,1);
				break;
			}					
		}
		$.setStorage(option+'suggests',arr);
		e=e||event;
		e.stopPropagation();				
		
	});
	//点击搜索框之外的地方隐藏搜索索引框
	sText.on('click',function(e){
    	ul.autoHide(e);
        $('#local-list').autoHide(e);
    	return false;
	});
    $('#local-list').on('click',function (e) {
		e=e||event;
		e.preventDefault();		
    })
		.on('click','a.txt,a.html',function () {
			let id=this.getAttribute('href').replace(/[\\:\.\(\)]/g,'_');
			//左边栏对应的a标签主动触发点击事件
			$('#'+id).click();           
        })
		.on('click','a.folder',function(){			
			let href=this.getAttribute('href');
			let targetEl=$('#'+href.replace(/[\\:\.\(\)]/g,'_'));
			
			//添加class，让目标open状态不一样的才触发
			$(this).toggleClass('open');
			
			if($(this).hasClass('open')){
				let scroll=targetEl.offset().top-$("#noteList .sublist-0").offset().top;
	//			console.log(scroll);
				let i=0;
				let t=null;
				setTimeout(()=>{
						t=setInterval(()=>{
							$("#noteList").scrollTop(scroll*i/10);
							i++;
							if(i>10){
								clearInterval(t);
								targetEl.toggleClass('remind');
							}
							
							
						},30);
						
				},350)
				
			}
			//左边栏对应的a标签主动触发
			if($(this).hasClass('open')===targetEl.hasClass('open')){				
				return;
			}
			targetEl.click();
			
			//如果要打开，必须让所有的交级也要同时展开，不然还是看不见
			if(targetEl.hasClass('open')){				
				bubbling(href);	
			}			
		
			function bubbling(href){				
				let parentHref=href.slice(0,href.lastIndexOf('\\'));
				let parentId="#"+parentHref.replace(/[\\:\.\(\)]/g,'_');
				let parent=$(parentId);
				if(parent&&!parent.hasClass('open')){
					parent.click();	
					let href=parent.attr('href');					
					href&&bubbling(href);
				}				
			}			
		})
		.on('click','a.content',function(){
			
		})
	//ajax请求：JSONP
	function reqAjax(val,option){
		//新增本地搜索
		if(option==='local'){
			if(!localSearchTargetArr&&!val){return;}
			let data={files:[],folders:[],content:[]};
			let file=localSearchTargetArr.files;
			let folder=localSearchTargetArr.folders;
			let maxLen=file.length>folder.length?file.length:folder.length;
			for(var i=0;i<maxLen;i++){	//最多10条，多了不要
				if(i<file.length&&file[i].name.indexOf(val)!==-1){
                    data.files.push(file[i]);
				}
                if(i<folder.length&&folder[i].name.indexOf(val)!==-1){
                    data.folders.push(folder[i]);
                }
			}
            showLocalList(data);
        }else{
            //map.baidu.com/su?wd=%E5%8C%97%E4%BA%AC&cid=194&type=0&newmap=1&b=(13131730%2C2799587%3B13142578%2C2801299)&t=1541691048953&pc_ver=2
            // option==='tieba' && (option='www');
            var qUrls={
                www:[
                    'https://sp0.baidu.com/5a1Fazu8AA54nxGko9WTAnF6hhy/su',
                    'cb',{ie:'utf-8',wd:val,sid:'26523_1441_21105_27401_27152'}
                ],
                image:[
                    'http://nssug.baidu.com/',
                    'cb',{ie:'utf-8',wd:val,prod:'image',cid:194}
                ],
                map:[
                    'http://map.baidu.com/su',
                    '',{pc_ver:2,wd:val,newmap:1,type:0,cid:194}
                ],
                tieba:[
                    'https://sp0.baidu.com/5a1Fazu8AA54nxGko9WTAnF6hhy/su',
                    'cb',{ie:'utf-8',wd:val?val+'吧':'',sid:'26523_1441_21105_27401_27152'}
                ],
            }
            if(option==='map'){
                var reg=/\${1,3}[\w\$]{20,}\$/;
                $.ajax({
                    dataType:'jsonp',
                    url:qUrls.map[0],
                    data:qUrls.map[2]
                }).done(function(data){
                    if(data.s.length>0){
                        data.s.forEach(function(v,i){
                            v=v.split(reg);
                            v&&(data.s[i]=v[0].replace(/[\$\w]/g,''));
                        });
                    };
                    showList(data);
                }).fail(function(err){
                    console.log('失败\n',err)
                });
                return;
            }
            $.ajax({
                dataType:'jsonp',
                url:qUrls[option][0],
                data:qUrls[option][2],
                jsonp:qUrls[option][1]
            }).done(showList).fail(function(err){
                console.log('失败\n',err)
            });
		}

	}
    //新增显示本地搜索关联
	function showLocalList(data) {
		let list=$('#local-list');
		if(Array.isArray(data.files)&&data.files.length>0){
            let filehtml='';
            data.files.forEach((v)=>{
                let type=v.name.slice(v.name.lastIndexOf('.')+1);
                filehtml+=`<a class="${type}" href="${v.path}">${v.name}</a>`
            });
            list.children('.file').html(filehtml);
		}
       	if( Array.isArray(data.folders)&&data.folders.length>0){
            let folderhtml='';
        	data.folders.forEach(v=>{
                folderhtml+=`<a class="folder" href="${v.path}">${v.name}</a>`
            });
            list.children('.folder').html(folderhtml);
		}
		if( Array.isArray(data.content)&&data.content.length>0){
            let contenthtml='';
            data.content.forEach(v=>{
                contenthtml+=`<a class="txt" href="${v.path}">${v.name}</a>`
            });
            list.children('.content').html(contenthtml);
		}
        list.show()
    }
	//显示搜索关联		
	function showList(data){
        if(typeof data==='undefined'){return false;}
		var len=data.s.length;
		//只有显示历史搜索时才有del属性		
		if(len===0&&!data.del&&!sText.val()){//之前没判断是不是历史搜索，如果历史记录为空造成死循环
			ul.html('').hide();
			showSuggest();
			return
		}else if(len===0&&!data.del){
			ul.html('').hide();
			return;
		}
        var lis='';
		var li=data.del?'<span class="del"></span></li>':'</li>';

		for(var i=0;i<len&&i<10;i++){
			lis+='<li><span class="txt">'+data.s[i]+'</span>'+li;
		}

		if(!data.lastLi){					
			data.lastLi='<li><span>不反馈</span></li>';
		};				
		lis+=data.lastLi;
		ul.html(lis).show();					
	}
	//跳转到百度
	function openBaidu(url,val,option,e){
		e.preventDefault();			
		if(val){				
			saveLog(val);				
			//中文转url码				
			var reg=/[\u4e00-\u9fa5]/g;	
			for(var i=0;i<val.length;i++){
				if(reg.test(val)){//如果有中文就转码
					val=encodeURI(val);
					break;
				}
			}					
		}				
		if(option=='map'&& val){url+='?newmap=1&ie=utf-8&s=s%26wd%3D'};
		window.open(url+val);
		// e.preventDefault();
		return false;
	}
	//显示历史搜索列表
	function showSuggest(){
		if(option==='local'){return}
		var data={s:[]};
		//获取cookie
		var suggest=$.getStorage(option+'suggests') || [];
		var len=suggest.length;			
		if(len===0){return false;}
		//最多拿9条
		for(var i=0;i<9&&i<len;i++){
			data.s.push(suggest[i].val);
		}
		data.lastLi=`<li><span class="js-clearSuggest">清空历史</span></li>`;
		data.del=true;				
		showList(data);
	}
	//保存搜索记录
	function saveLog(val){
		if(!val){return;}
		var isAdd=true;
		var all=$.getStorage(option+'suggests') || [];
		all.sort(function(a,b){return b.count-a.count});
		all.forEach((value,index)=>{
			if(value.val==val){//如果记录中已有，增加搜索记录次数
				all[index].count++;
				isAdd=false;
			}					
		})
		//放在最前面，最新搜索记录优先级最高
		isAdd&&all.unshift({count:1,val:val,time:+new Date})				
		//300条够了，多了不要
		all.length>300&&all.pop();
		$.setStorage(option+'suggests',all);	
		return '已保存'			
	}
	
})
//设置Chrome打开新标签页时为指定页面，安装插件：New Tab Redirect	