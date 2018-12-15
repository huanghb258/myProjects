// 接口说明：https://www.sojson.com/blog/305.html
// 接口API：'http://t.weather.sojson.com/api/weather/city/'+city_code
// city_code:_city.json   city_code代表城市,厦门：101230201
//status:200代表成功，!200失败
$(function(){
	//天气提醒
	function showWeather(){
		var today=$('#weather .w-today')[0];	
		var tomorrow=$('#weather .w-tomorrow')[0];	
		var isRain=$('#weather .isRain')[0];
		var city_code=101230201;//默认为厦门	
		var URL='http://t.weather.sojson.com/api/weather/city/';
		function reqWeather(url,city){
			$.ajax({					
				// dataType:'JSONP',			
				url:URL+city,
				data:{},					
				// jsonp:'cb'
			}).done((data,status,xhr)=>{
				if(data.status!==200){console.warn('请求成功，但没得到想要的数据');return}
				var datas=data.data.forecast;
				// console.log(data)
				var rain=datas[0].type.indexOf('雨')!==-1?true:false;
				var Train=datas[1].type.indexOf('雨')!==-1?true:false;
				$(today).children('span').html(datas[0].low+' - '+datas[0].high);
				$(tomorrow).children('span').html(datas[1].low+' - '+datas[1].high);
				if(rain){
					isRain.innerHTML='今天要下雨(今天'+datas[0].type+'，明天'+datas[1].type+')';						
				}else if(Train){
					isRain.innerHTML='明天要下雨(今天'+datas[0].type+'，明天'+datas[1].type+')';
				}else if(rain&&Train){
					isRain.innerHTML='这两天要下雨';
				}else{
					isRain.innerHTML='最近不下雨(今天'+datas[0].type+'，明天'+datas[1].type+')';
					$(isRain).removeClass('warn');
				}
				
			}).fail(function(jqXHR,textStatus,errorThrown){
			  	// console.log(textStatus);
                isRain.innerHTML='免费天气接口非https,被github阻止了';
                $(isRain);
			});		
		}
		reqWeather(URL,city_code);
		setInterval(reqWeather,1000*60*10,URL,city_code);	//十分钟更新一次
	    $('#weather').on('click',function(){
			window.open('https://www.baidu.com/s?ie=utf-8&f=8&rsv_bp=1&tn=baidu&wd=厦门天气');
		})
	}
	showWeather();

	//导出json
    $('#exportJson').on('click',function(e){
	  	e=e||event;
    	e.preventDefault();
    	let jsonData={};
    	function reqOldJson(){
    		console.log(1)
    		return new Promise((resolve,reject)=>{
    			$.ajax({url: 'data/oftenUseUrl.json', 
			    	success(data){			    		
			    	 	resolve(data);
			    	},
			    	error(xhr){
			    		console.log('请求旧json文件失败')
			    	 	reject();
			    	}
		    	});
    		})
    	}
    	reqOldJson().then(data=>{
    		
    		createJson(data,send)
    	},()=>{createJson(null,send)})
    	
    	function createJson(data,callback){    		
	    	jsonData.icos=$.getStorage('icos')||[];
	    	jsonData.jsDocs=$.getStorage('jsDocs')||[];
	    	jsonData.jsVaried=$.getStorage('jsVaried')||[];
	    	jsonData.cssDocs=$.getStorage('cssDocs')||[];
	    	jsonData.cssVaried=$.getStorage('cssVaried')||[];
	    	jsonData.oftenUrl=$.getStorage('oftenUrl')||[];
	    	if(data){
	    		for(let k in jsonData){
	    			jsonData[k].length>0||(jsonData[k]=data[k]);
	    		}
	    	}
	    	jsonData=JSON.stringify(jsonData);
	    	callback(jsonData);
    	}
		
    	function send(jsonData){
			$.ajax({
	    		type:'POST',
	    		data:{target:'./myNav/data/oftenUseUrl.json',jsonData},
	    		url:'/exportJson',
	    		success(data){
	    			alert(data.txt)	    			
	    		},
	    		error(err){console.log(err)}
	    	})    	
    	}
    
    })

	//小工具
	$('.tools').on('click','a',function (e) {
		e=e||event;
		e.preventDefault();
		let target=$(this).attr('href');
        $.ajax({
            type: 'GET',
            data: {target},
            url: '/command',
            success(data) {
                console.log('cmd命令：'+target+'执行成功');
            },
            error(xhr, txt) {
                console.warn('cmd命令：'+target+'执行失败',xhr);
            }
        })
    })

})