// 接口说明：https://www.sojson.com/blog/305.html
// 接口API：'http://t.weather.sojson.com/api/weather/city/'+city_code
// city_code:_city.json   city_code代表城市,厦门：101230201
//status:200代表成功，!200失败
$(function(){			
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
		  	console.log(textStatus);
		});		
	}
	reqWeather(URL,city_code);
	setInterval(reqWeather,1000*60*10,URL,city_code);	//十分钟更新一次
    $('#weather').on('click',function(){
		window.open('https://www.baidu.com/s?ie=utf-8&f=8&rsv_bp=1&tn=baidu&wd=厦门天气');
	})

})