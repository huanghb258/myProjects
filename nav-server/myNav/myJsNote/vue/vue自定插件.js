(function(){
	//向外暴露的插件对象
	const MyPlugin={}
	//插件对象必须有一个install()方法
	MyPlugin.install = function (Vue, options) {
  // 1. 添加全局方法或属性
  Vue.myGlobalMethod = function () {
    // 逻辑...
    console.log('Vue函数对象的方法');
  }

  // 2. 添加全局资源
  Vue.directive('my-directive', {
    bind (el, binding, vnode, oldVnode) {
      // 逻辑...
      el.textContent=binding.value.tuUppreCase()
    }
    ...
  })

  // 3. 注入组件
  Vue.mixin({
    created: function () {
      // 逻辑...
    }
    ...
  })

  // 4. 添加实例方法
  Vue.prototype.$myMethod = function (methodOptions) {
    // 逻辑...
    //原型
    Vue.prototype.$myMethod=function(){
    	console.log('Vue实例对象的方法')
    }
  }
}
//向外暴露
window.MyPlugin=MyPlugin
})()

//使用
/**
	1.声明使用一个插件
		Vue.use(MyPlugin)	

	2.引入本js文件
**/

