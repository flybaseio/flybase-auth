if(!Object.create){Object.create=(function(){function F(){}
return function(o){if(arguments.length!=1){throw new Error('Object.create implementation only accepts one parameter.');}
F.prototype=o;return new F();};})();}
if(!Object.keys){Object.keys=function(o,k,r){r=[];for(k in o){if(r.hasOwnProperty.call(o,k))
r.push(k);}
return r;};}
if(!Array.prototype.indexOf){Array.prototype.indexOf=function(s){for(var j=0;j<this.length;j++){if(this[j]===s){return j;}}
return-1;};}
if(!Array.prototype.forEach){Array.prototype.forEach=function(fun){if(this===void 0||this===null){throw new TypeError();}
var t=Object(this);var len=t.length>>>0;if(typeof fun!=='function'){throw new TypeError();}
var thisArg=arguments.length>=2?arguments[1]:void 0;for(var i=0;i<len;i++){if(i in t){fun.call(thisArg,t[i],i,t);}}
return this;};}
if(!Array.prototype.filter){Array.prototype.filter=function(fun,thisArg){var a=[];this.forEach(function(val,i,t){if(fun.call(thisArg||void 0,val,i,t)){a.push(val);}});return a;};}
if(!Array.prototype.map){Array.prototype.map=function(fun,thisArg){var a=[];this.forEach(function(val,i,t){a.push(fun.call(thisArg||void 0,val,i,t));});return a;};}
if(!Array.isArray){Array.isArray=function(o){return Object.prototype.toString.call(o)==='[object Array]';};}
if(typeof window==='object'&&typeof window.location==='object'&&!window.location.assign){window.location.assign=function(url){window.location=url;};}
if(!Function.prototype.bind){Function.prototype.bind=function(b){if(typeof this!=='function'){throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');}
function C(){}
var a=[].slice;var f=a.call(arguments,1);var _this=this;var D=function(){return _this.apply(this instanceof C?this:b||window,f.concat(a.call(arguments)));};C.prototype=this.prototype;D.prototype=new C();return D;};}
var flybaseauth=function(name){return flybaseauth.use(name);};flybaseauth.utils={extend:function(r){Array.prototype.slice.call(arguments,1).forEach(function(a){if(Array.isArray(r)&&Array.isArray(a)){Array.prototype.push.apply(r,a);}
else if(r instanceof Object&&a instanceof Object&&r!==a){for(var x in a){r[x]=flybaseauth.utils.extend(r[x],a[x]);}}
else{if(Array.isArray(a)){a=a.slice(0);}
r=a;}});return r;}};flybaseauth.utils.extend(flybaseauth,{settings:{redirect_uri:window.location.href.split('#')[0],response_type:'token',display:'popup',state:'',oauth_proxy:'https://auth-server.herokuapp.com/proxy',timeout:20000,popup:{resizable:1,scrollbars:1,width:500,height:550},scope:['basic'],scope_map:{basic:''},default_service:null,force:null,page_uri:window.location.href},services:{},use:function(service){var self=Object.create(this);self.settings=Object.create(this.settings);if(service){self.settings.default_service=service;}
self.utils.Event.call(self);return self;},init:function(services,options){var utils=this.utils;if(!services){return this.services;}
for(var x in services){if(services.hasOwnProperty(x)){if(typeof(services[x])!=='object'){services[x]={id:services[x]};}}}
utils.extend(this.services,services);if(options){utils.extend(this.settings,options);if('redirect_uri'in options){this.settings.redirect_uri=utils.url(options.redirect_uri).href;}}
return this;},login:function(){var _this=this;var utils=_this.utils;var error=utils.error;var promise=utils.Promise();var p=utils.args({network:'s',options:'o',callback:'f'},arguments);var url;var qs=utils.diffKey(p.options,_this.settings);var opts=p.options=utils.merge(_this.settings,p.options||{});opts.popup=utils.merge(_this.settings.popup,p.options.popup||{});p.network=p.network||_this.settings.default_service;promise.proxy.then(p.callback,p.callback);function emit(s,value){flybaseauth.emit(s,value);}
promise.proxy.then(emit.bind(this,'auth.login auth'),emit.bind(this,'auth.failed auth'));if(typeof(p.network)!=='string'||!(p.network in _this.services)){return promise.reject(error('invalid_network','The provided network was not recognized'));}
var provider=_this.services[p.network];var callbackId=utils.globalEvent(function(str){var obj;if(str){obj=JSON.parse(str);}
else{obj=error('cancelled','The authentication was not completed');}
if(!obj.error){utils.store(obj.network,obj);promise.fulfill({network:obj.network,authResponse:obj});}
else{promise.reject(obj);}});var redirectUri=utils.url(opts.redirect_uri).href;var responseType=provider.oauth.response_type||opts.response_type;if(/\bcode\b/.test(responseType)&&!provider.oauth.grant){responseType=responseType.replace(/\bcode\b/,'token');}
p.qs=utils.merge(qs,{client_id:encodeURIComponent(provider.id),response_type:encodeURIComponent(responseType),redirect_uri:encodeURIComponent(redirectUri),display:opts.display,state:{client_id:provider.id,network:p.network,display:opts.display,callback:callbackId,state:opts.state,redirect_uri:redirectUri}});var session=utils.store(p.network);var SCOPE_SPLIT=/[,\s]+/;var scope=_this.settings.scope?[_this.settings.scope.toString()]:[];var scopeMap=utils.merge(_this.settings.scope_map,provider.scope||{});if(opts.scope){scope.push(opts.scope.toString());}
if(session&&'scope'in session&&session.scope instanceof String){scope.push(session.scope);}
scope=scope.join(',').split(SCOPE_SPLIT);scope=utils.unique(scope).filter(filterEmpty);p.qs.state.scope=scope.join(',');scope=scope.map(function(item){return(item in scopeMap)?scopeMap[item]:item;});scope=scope.join(',').split(SCOPE_SPLIT);scope=utils.unique(scope).filter(filterEmpty);p.qs.scope=scope.join(provider.scope_delim||',');if(opts.force===false){if(session&&'access_token'in session&&session.access_token&&'expires'in session&&session.expires>((new Date()).getTime()/ 1e3)) {
var diff=utils.diff((session.scope||'').split(SCOPE_SPLIT),(p.qs.state.scope||'').split(SCOPE_SPLIT));if(diff.length===0){promise.fulfill({unchanged:true,network:p.network,authResponse:session});return promise;}}}
if(opts.display==='page'&&opts.page_uri){p.qs.state.page_uri=utils.url(opts.page_uri).href;}
if('login'in provider&&typeof(provider.login)==='function'){provider.login(p);}
if(!/\btoken\b/.test(responseType)||parseInt(provider.oauth.version,10)<2||(opts.display==='none'&&provider.oauth.grant&&session&&session.refresh_token)){p.qs.state.oauth=provider.oauth;p.qs.state.oauth_proxy=opts.oauth_proxy;}
p.qs.state=encodeURIComponent(JSON.stringify(p.qs.state));if(parseInt(provider.oauth.version,10)===1){url=utils.qs(opts.oauth_proxy,p.qs,encodeFunction);}
else if(opts.display==='none'&&provider.oauth.grant&&session&&session.refresh_token){p.qs.refresh_token=session.refresh_token;url=utils.qs(opts.oauth_proxy,p.qs,encodeFunction);}
else{url=utils.qs(provider.oauth.auth,p.qs,encodeFunction);}
emit('auth.init',p);if(opts.display==='none'){utils.iframe(url,redirectUri);}
else if(opts.display==='popup'){var popup=utils.popup(url,redirectUri,opts.popup);var timer=setInterval(function(){if(!popup||popup.closed){clearInterval(timer);if(!promise.state){var response=error('cancelled','Login has been cancelled');if(!popup){response=error('blocked','Popup was blocked');}
response.network=p.network;promise.reject(response);}}},100);}
else{window.location=url;}
return promise.proxy;function encodeFunction(s){return s;}
function filterEmpty(s){return!!s;}},logout:function(){var _this=this;var utils=_this.utils;var error=utils.error;var promise=utils.Promise();var p=utils.args({name:'s',options:'o',callback:'f'},arguments);p.options=p.options||{};promise.proxy.then(p.callback,p.callback);function emit(s,value){flybaseauth.emit(s,value);}
promise.proxy.then(emit.bind(this,'auth.logout auth'),emit.bind(this,'error'));p.name=p.name||this.settings.default_service;p.authResponse=utils.store(p.name);if(p.name&&!(p.name in _this.services)){promise.reject(error('invalid_network','The network was unrecognized'));}
else if(p.name&&p.authResponse){var callback=function(opts){utils.store(p.name,null);promise.fulfill(flybaseauth.utils.merge({network:p.name},opts||{}));};var _opts={};if(p.options.force){var logout=_this.services[p.name].logout;if(logout){if(typeof(logout)==='function'){logout=logout(callback,p);}
if(typeof(logout)==='string'){utils.iframe(logout);_opts.force=null;_opts.message='Logout success on providers site was indeterminate';}
else if(logout===undefined){return promise.proxy;}}}
callback(_opts);}
else{promise.reject(error('invalid_session','There was no session to remove'));}
return promise.proxy;},getAuthResponse:function(service){service=service||this.settings.default_service;if(!service||!(service in this.services)){return null;}
return this.utils.store(service)||null;},events:{}});flybaseauth.utils.extend(flybaseauth.utils,{error:function(code,message){return{error:{code:code,message:message}};},qs:function(url,params,formatFunction){if(params){formatFunction=formatFunction||encodeURIComponent;for(var x in params){var str='([\\?\\&])'+ x+'=[^\\&]*';var reg=new RegExp(str);if(url.match(reg)){url=url.replace(reg,'$1'+ x+'='+ formatFunction(params[x]));delete params[x];}}}
if(!this.isEmpty(params)){return url+(url.indexOf('?')>-1?'&':'?')+ this.param(params,formatFunction);}
return url;},param:function(s,formatFunction){var b;var a={};var m;if(typeof(s)==='string'){formatFunction=formatFunction||decodeURIComponent;m=s.replace(/^[\#\?]/,'').match(/([^=\/\&]+)=([^\&]+)/g);if(m){for(var i=0;i<m.length;i++){b=m[i].match(/([^=]+)=(.*)/);a[b[1]]=formatFunction(b[2]);}}
return a;}
else{formatFunction=formatFunction||encodeURIComponent;var o=s;a=[];for(var x in o){if(o.hasOwnProperty(x)){if(o.hasOwnProperty(x)){a.push([x,o[x]==='?'?'?':formatFunction(o[x])].join('='));}}}
return a.join('&');}},store:(function(){var a=['localStorage','sessionStorage'];var i=-1;var prefix='test';var localStorage;while(a[++i]){try{localStorage=window[a[i]];localStorage.setItem(prefix+ i,i);localStorage.removeItem(prefix+ i);break;}
catch(e){localStorage=null;}}
if(!localStorage){var cache=null;localStorage={getItem:function(prop){prop=prop+'=';var m=document.cookie.split(';');for(var i=0;i<m.length;i++){var _m=m[i].replace(/(^\s+|\s+$)/,'');if(_m&&_m.indexOf(prop)===0){return _m.substr(prop.length);}}
return cache;},setItem:function(prop,value){cache=value;document.cookie=prop+'='+ value;}};cache=localStorage.getItem('flybaseauth');}
function get(){var json={};try{json=JSON.parse(localStorage.getItem('flybaseauth'))||{};}
catch(e){}
return json;}
function set(json){localStorage.setItem('flybaseauth',JSON.stringify(json));}
return function(name,value,days){var json=get();if(name&&value===undefined){return json[name]||null;}
else if(name&&value===null){try{delete json[name];}
catch(e){json[name]=null;}}
else if(name){json[name]=value;}
else{return json;}
set(json);return json||null;};})(),append:function(node,attr,target){var n=typeof(node)==='string'?document.createElement(node):node;if(typeof(attr)==='object'){if('tagName'in attr){target=attr;}
else{for(var x in attr){if(attr.hasOwnProperty(x)){if(typeof(attr[x])==='object'){for(var y in attr[x]){if(attr[x].hasOwnProperty(y)){n[x][y]=attr[x][y];}}}
else if(x==='html'){n.innerHTML=attr[x];}
else if(!/^on/.test(x)){n.setAttribute(x,attr[x]);}
else{n[x]=attr[x];}}}}}
if(target==='body'){(function self(){if(document.body){document.body.appendChild(n);}
else{setTimeout(self,16);}})();}
else if(typeof(target)==='object'){target.appendChild(n);}
else if(typeof(target)==='string'){document.getElementsByTagName(target)[0].appendChild(n);}
return n;},iframe:function(src){this.append('iframe',{src:src,style:{position:'absolute',left:'-1000px',bottom:0,height:'1px',width:'1px'}},'body');},merge:function(){var args=Array.prototype.slice.call(arguments);args.unshift({});return this.extend.apply(null,args);},args:function(o,args){var p={};var i=0;var t=null;var x=null;for(x in o){if(o.hasOwnProperty(x)){break;}}
if((args.length===1)&&(typeof(args[0])==='object')&&o[x]!='o!'){for(x in args[0]){if(o.hasOwnProperty(x)){if(x in o){return args[0];}}}}
for(x in o){if(o.hasOwnProperty(x)){t=typeof(args[i]);if((typeof(o[x])==='function'&&o[x].test(args[i]))||(typeof(o[x])==='string'&&((o[x].indexOf('s')>-1&&t==='string')||(o[x].indexOf('o')>-1&&t==='object')||(o[x].indexOf('i')>-1&&t==='number')||(o[x].indexOf('a')>-1&&t==='object')||(o[x].indexOf('f')>-1&&t==='function')))){p[x]=args[i++];}
else if(typeof(o[x])==='string'&&o[x].indexOf('!')>-1){return false;}}}
return p;},url:function(path){if(!path){return window.location;}
else if(window.URL&&URL instanceof Function&&URL.length!==0){return new URL(path,window.location);}
else{var a=document.createElement('a');a.href=path;return a.cloneNode(false);}},diff:function(a,b){return b.filter(function(item){return a.indexOf(item)===-1;});},diffKey:function(a,b){if(a||!b){var r={};for(var x in a){if(!(x in b)){r[x]=a[x];}}
return r;}
return a;},unique:function(a){if(!Array.isArray(a)){return[];}
return a.filter(function(item,index){return a.indexOf(item)===index;});},isEmpty:function(obj){if(!obj)
return true;if(Array.isArray(obj)){return!obj.length;}
else if(typeof(obj)==='object'){for(var key in obj){if(obj.hasOwnProperty(key)){return false;}}}
return true;},Promise:(function(){var STATE_PENDING=0;var STATE_FULFILLED=1;var STATE_REJECTED=2;var api=function(executor){if(!(this instanceof api))
return new api(executor);this.id="Thenable/1.0.6";this.state=STATE_PENDING;this.fulfillValue=undefined;this.rejectReason=undefined;this.onFulfilled=[];this.onRejected=[];this.proxy={then:this.then.bind(this)};if(typeof executor==="function")
executor.call(this,this.fulfill.bind(this),this.reject.bind(this));};api.prototype={fulfill:function(value){return deliver(this,STATE_FULFILLED,"fulfillValue",value);},reject:function(value){return deliver(this,STATE_REJECTED,"rejectReason",value);},then:function(onFulfilled,onRejected){var curr=this;var next=new api();curr.onFulfilled.push(resolver(onFulfilled,next,"fulfill"));curr.onRejected.push(resolver(onRejected,next,"reject"));execute(curr);return next.proxy;}};var deliver=function(curr,state,name,value){if(curr.state===STATE_PENDING){curr.state=state;curr[name]=value;execute(curr);}
return curr;};var execute=function(curr){if(curr.state===STATE_FULFILLED)
execute_handlers(curr,"onFulfilled",curr.fulfillValue);else if(curr.state===STATE_REJECTED)
execute_handlers(curr,"onRejected",curr.rejectReason);};var execute_handlers=function(curr,name,value){if(curr[name].length===0)
return;var handlers=curr[name];curr[name]=[];var func=function(){for(var i=0;i<handlers.length;i++)
handlers[i](value);};if(typeof process==="object"&&typeof process.nextTick==="function")
process.nextTick(func);else if(typeof setImmediate==="function")
setImmediate(func);else
setTimeout(func,0);};var resolver=function(cb,next,method){return function(value){if(typeof cb!=="function")
next[method].call(next,value);else{var result;try{result=cb(value);}
catch(e){next.reject(e);return;}
resolve(next,result);}};};var resolve=function(promise,x){if(promise===x||promise.proxy===x){promise.reject(new TypeError("cannot resolve promise with itself"));return;}
var then;if((typeof x==="object"&&x!==null)||typeof x==="function"){try{then=x.then;}
catch(e){promise.reject(e);return;}}
if(typeof then==="function"){var resolved=false;try{then.call(x,function(y){if(resolved)return;resolved=true;if(y===x)
promise.reject(new TypeError("circular thenable chain"));else
resolve(promise,y);},function(r){if(resolved)return;resolved=true;promise.reject(r);});}
catch(e){if(!resolved)
promise.reject(e);}
return;}
promise.fulfill(x);};return api;})(),Event:function(){var separator=/[\s\,]+/;this.parent={events:this.events,findEvents:this.findEvents,parent:this.parent,utils:this.utils};this.events={};this.on=function(evt,callback){if(callback&&typeof(callback)==='function'){var a=evt.split(separator);for(var i=0;i<a.length;i++){this.events[a[i]]=[callback].concat(this.events[a[i]]||[]);}}
return this;};this.off=function(evt,callback){this.findEvents(evt,function(name,index){if(!callback||this.events[name][index]===callback){this.events[name][index]=null;}});return this;};this.emit=function(evt){var args=Array.prototype.slice.call(arguments,1);args.push(evt);var handler=function(name,index){args[args.length- 1]=(name==='*'?evt:name);this.events[name][index].apply(this,args);};var _this=this;while(_this&&_this.findEvents){_this.findEvents(evt+',*',handler);_this=_this.parent;}
return this;};this.emitAfter=function(){var _this=this;var args=arguments;setTimeout(function(){_this.emit.apply(_this,args);},0);return this;};this.findEvents=function(evt,callback){var a=evt.split(separator);for(var name in this.events){if(this.events.hasOwnProperty(name)){if(a.indexOf(name)>-1){for(var i=0;i<this.events[name].length;i++){if(this.events[name][i]){callback.call(this,name,i);}}}}}};return this;},globalEvent:function(callback,guid){guid=guid||'_flybaseauthjs_'+ parseInt(Math.random()*1e12,10).toString(36);window[guid]=function(){try{if(callback.apply(this,arguments)){delete window[guid];}}
catch(e){console.error(e);}};return guid;},popup:function(url,redirectUri,options){var documentElement=document.documentElement;if(options.height){var dualScreenTop=window.screenTop!==undefined?window.screenTop:screen.top;var height=screen.height||window.innerHeight||documentElement.clientHeight;options.top=parseInt((height- options.height)/ 2, 10) + dualScreenTop;
}
if(options.width){var dualScreenLeft=window.screenLeft!==undefined?window.screenLeft:screen.left;var width=screen.width||window.innerWidth||documentElement.clientWidth;options.left=parseInt((width- options.width)/ 2, 10) + dualScreenLeft;
}
var optionsArray=[];Object.keys(options).forEach(function(name){var value=options[name];optionsArray.push(name+(value!==null?'='+ value:''));});if(navigator.userAgent.indexOf('Safari')!==-1&&navigator.userAgent.indexOf('Chrome')===-1){url=redirectUri+'#oauth_redirect='+ encodeURIComponent(encodeURIComponent(url));}
var popup=window.open(url,'_blank',optionsArray.join(','));if(popup&&popup.focus){popup.focus();}
return popup;},responseHandler:function(window,parent){var _this=this;var p;var location=window.location;p=_this.param(location.search);if(p&&p.state&&(p.code||p.oauth_token)){var state=JSON.parse(p.state);p.redirect_uri=state.redirect_uri||location.href.replace(/[\?\#].*$/,'');var path=state.oauth_proxy+'?'+ _this.param(p);location.assign(path);return;}
p=_this.merge(_this.param(location.search||''),_this.param(location.hash||''));if(p&&'state'in p){try{var a=JSON.parse(p.state);_this.extend(p,a);}
catch(e){console.error('Could not decode state parameter');}
if(('access_token'in p&&p.access_token)&&p.network){if(!p.expires_in||parseInt(p.expires_in,10)===0){p.expires_in=0;}
p.expires_in=parseInt(p.expires_in,10);p.expires=((new Date()).getTime()/ 1e3) + (p.expires_in || (60 * 60 * 24 * 365));
authCallback(p,window,parent);}
else if(('error'in p&&p.error)&&p.network){p.error={code:p.error,message:p.error_message||p.error_description};authCallback(p,window,parent);}
else if(p.callback&&p.callback in parent){var res='result'in p&&p.result?JSON.parse(p.result):false;parent[p.callback](res);closeWindow();}
if(p.page_uri){location.assign(p.page_uri);}}
else if('oauth_redirect'in p){location.assign(decodeURIComponent(p.oauth_redirect));return;}
function authCallback(obj,window,parent){var cb=obj.callback;var network=obj.network;_this.store(network,obj);if(('display'in obj)&&obj.display==='page'){return;}
if(parent&&cb&&cb in parent){try{delete obj.callback;}
catch(e){}
_this.store(network,obj);var str=JSON.stringify(obj);try{parent[cb](str);}
catch(e){}}
closeWindow();}
function closeWindow(){if(window.frameElement){parent.document.body.removeChild(window.frameElement);}
else{try{window.close();}
catch(e){}
if(window.addEventListener){window.addEventListener('load',function(){window.close();});}}}}});flybaseauth.utils.Event.call(flybaseauth);(function(flybaseauth){var oldSessions={};var expired={};flybaseauth.on('auth.login, auth.logout',function(auth){if(auth&&typeof(auth)==='object'&&auth.network){oldSessions[auth.network]=flybaseauth.utils.store(auth.network)||{};}});(function self(){var CURRENT_TIME=((new Date()).getTime()/ 1e3);
var emit=function(eventName){flybaseauth.emit('auth.'+ eventName,{network:name,authResponse:session});};for(var name in flybaseauth.services){if(flybaseauth.services.hasOwnProperty(name)){if(!flybaseauth.services[name].id){continue;}
var session=flybaseauth.utils.store(name)||{};var provider=flybaseauth.services[name];var oldSess=oldSessions[name]||{};if(session&&'callback'in session){var cb=session.callback;try{delete session.callback;}
catch(e){}
flybaseauth.utils.store(name,session);try{window[cb](session);}
catch(e){}}
if(session&&('expires'in session)&&session.expires<CURRENT_TIME){var refresh=provider.refresh||session.refresh_token;if(refresh&&(!(name in expired)||expired[name]<CURRENT_TIME)){flybaseauth.emit('notice',name+' has expired trying to resignin');flybaseauth.login(name,{display:'none',force:false});expired[name]=CURRENT_TIME+ 600;}
else if(!refresh&&!(name in expired)){emit('expired');expired[name]=true;}
continue;}
else if(oldSess.access_token===session.access_token&&oldSess.expires===session.expires){continue;}
else if(!session.access_token&&oldSess.access_token){emit('logout');}
else if(session.access_token&&!oldSess.access_token){emit('login');}
else if(session.expires!==oldSess.expires){emit('update');}
oldSessions[name]=session;if(name in expired){delete expired[name];}}}
setTimeout(self,1000);})();})(flybaseauth);flybaseauth.api=function(){var _this=this;var utils=_this.utils;var error=utils.error;var promise=utils.Promise();var p=utils.args({path:'s!',query:'o',method:'s',data:'o',timeout:'i',callback:'f'},arguments);p.method=(p.method||'get').toLowerCase();p.headers=p.headers||{};p.query=p.query||{};if(p.method==='get'||p.method==='delete'){utils.extend(p.query,p.data);p.data={};}
var data=p.data=p.data||{};promise.then(p.callback,p.callback);if(!p.path){return promise.reject(error('invalid_path','Missing the path parameter from the request'));}
p.path=p.path.replace(/^\/+/,'');var a=(p.path.split(/[\/\:]/,2)||[])[0].toLowerCase();if(a in _this.services){p.network=a;var reg=new RegExp('^'+ a+':?\/?');p.path=p.path.replace(reg,'');}
p.network=_this.settings.default_service=p.network||_this.settings.default_service;var o=_this.services[p.network];if(!o){return promise.reject(error('invalid_network','Could not match the service requested: '+ p.network));}
if(!(!(p.method in o)||!(p.path in o[p.method])||o[p.method][p.path]!==false)){return promise.reject(error('invalid_path','The provided path is not available on the selected network'));}
if(!p.oauth_proxy){p.oauth_proxy=_this.settings.oauth_proxy;}
if(!('proxy'in p)){p.proxy=p.oauth_proxy&&o.oauth&&parseInt(o.oauth.version,10)===1;}
if(!('timeout'in p)){p.timeout=_this.settings.timeout;}
if(!('formatResponse'in p)){p.formatResponse=true;}
p.authResponse=_this.getAuthResponse(p.network);if(p.authResponse&&p.authResponse.access_token){p.query.access_token=p.authResponse.access_token;}
var url=p.path;var m;p.options=utils.clone(p.query);p.data=utils.clone(data);var actions=o[{'delete':'del'}[p.method]||p.method]||{};if(p.method==='get'){var query=url.split(/[\?#]/)[1];if(query){utils.extend(p.query,utils.param(query));url=url.replace(/\?.*?(#|$)/,'$1');}}
if((m=url.match(/#(.+)/,''))){url=url.split('#')[0];p.path=m[1];}
else if(url in actions){p.path=url;url=actions[url];}
else if('default'in actions){url=actions['default'];}
p.redirect_uri=_this.settings.redirect_uri;p.xhr=o.xhr;p.jsonp=o.jsonp;p.form=o.form;if(typeof(url)==='function'){url(p,getPath);}
else{getPath(url);}
return promise.proxy;function getPath(url){url=url.replace(/\@\{([a-z\_\-]+)(\|.*?)?\}/gi,function(m,key,defaults){var val=defaults?defaults.replace(/^\|/,''):'';if(key in p.query){val=p.query[key];delete p.query[key];}
else if(p.data&&key in p.data){val=p.data[key];delete p.data[key];}
else if(!defaults){promise.reject(error('missing_attribute','The attribute '+ key+' is missing from the request'));}
return val;});if(!url.match(/^https?:\/\//)){url=o.base+ url;}
p.url=url;utils.request(p,function(r,headers){if(!p.formatResponse){if(typeof headers==='object'?(headers.statusCode>=400):(typeof r==='object'&&'error'in r)){promise.reject(r);}
else{promise.fulfill(r);}
return;}
if(r===true){r={success:true};}
else if(!r){r={};}
if(p.method==='delete'){r=(!r||utils.isEmpty(r))?{success:true}:r;}
if(o.wrap&&((p.path in o.wrap)||('default'in o.wrap))){var wrap=(p.path in o.wrap?p.path:'default');var time=(new Date()).getTime();var b=o.wrap[wrap](r,headers,p);if(b){r=b;}}
if(r&&'paging'in r&&r.paging.next){if(r.paging.next[0]==='?'){r.paging.next=p.path+ r.paging.next;}
else{r.paging.next+='#'+ p.path;}}
if(!r||'error'in r){promise.reject(r);}
else{promise.fulfill(r);}});}};flybaseauth.utils.extend(flybaseauth.utils,{request:function(p,callback){var _this=this;var error=_this.error;if(!_this.isEmpty(p.data)&&!('FileList'in window)&&_this.hasBinary(p.data)){p.xhr=false;p.jsonp=false;}
var cors=this.request_cors(function(){return((p.xhr===undefined)||(p.xhr&&(typeof(p.xhr)!=='function'||p.xhr(p,p.query))));});if(cors){formatUrl(p,function(url){var x=_this.xhr(p.method,url,p.headers,p.data,callback);x.onprogress=p.onprogress||null;if(x.upload&&p.onuploadprogress){x.upload.onprogress=p.onuploadprogress;}});return;}
var _query=p.query;p.query=_this.clone(p.query);p.callbackID=_this.globalEvent();if(p.jsonp!==false){p.query.callback=p.callbackID;if(typeof(p.jsonp)==='function'){p.jsonp(p,p.query);}
if(p.method==='get'){formatUrl(p,function(url){_this.jsonp(url,callback,p.callbackID,p.timeout);});return;}
else{p.query=_query;}}
if(p.form!==false){p.query.redirect_uri=p.redirect_uri;p.query.state=JSON.stringify({callback:p.callbackID});var opts;if(typeof(p.form)==='function'){opts=p.form(p,p.query);}
if(p.method==='post'&&opts!==false){formatUrl(p,function(url){_this.post(url,p.data,opts,callback,p.callbackID,p.timeout);});return;}}
callback(error('invalid_request','There was no mechanism for handling this request'));return;function formatUrl(p,callback){var sign;if(p.authResponse&&p.authResponse.oauth&&parseInt(p.authResponse.oauth.version,10)===1){sign=p.query.access_token;delete p.query.access_token;p.proxy=true;}
if(p.data&&(p.method==='get'||p.method==='delete')){_this.extend(p.query,p.data);p.data=null;}
var path=_this.qs(p.url,p.query);if(p.proxy){path=_this.qs(p.oauth_proxy,{path:path,access_token:sign||'',then:p.proxy_response_type||(p.method.toLowerCase()==='get'?'redirect':'proxy'),method:p.method.toLowerCase(),suppress_response_codes:true});}
callback(path);}},request_cors:function(callback){return'withCredentials'in new XMLHttpRequest()&&callback();},domInstance:function(type,data){var test='HTML'+(type||'').replace(/^[a-z]/,function(m){return m.toUpperCase();})+'Element';if(!data){return false;}
if(window[test]){return data instanceof window[test];}
else if(window.Element){return data instanceof window.Element&&(!type||(data.tagName&&data.tagName.toLowerCase()===type));}
else{return(!(data instanceof Object||data instanceof Array||data instanceof String||data instanceof Number)&&data.tagName&&data.tagName.toLowerCase()===type);}},clone:function(obj){if(obj===null||typeof(obj)!=='object'||obj instanceof Date||'nodeName'in obj||this.isBinary(obj)||(typeof FormData==='function'&&obj instanceof FormData)){return obj;}
if(Array.isArray(obj)){return obj.map(this.clone.bind(this));}
var clone={};for(var x in obj){clone[x]=this.clone(obj[x]);}
return clone;},xhr:function(method,url,headers,data,callback){var r=new XMLHttpRequest();var error=this.error;var binary=false;if(method==='blob'){binary=method;method='GET';}
method=method.toUpperCase();r.onload=function(e){var json=r.response;try{json=JSON.parse(r.responseText);}
catch(_e){if(r.status===401){json=error('access_denied',r.statusText);}}
var headers=headersToJSON(r.getAllResponseHeaders());headers.statusCode=r.status;callback(json||(method==='GET'?error('empty_response','Could not get resource'):{}),headers);};r.onerror=function(e){var json=r.responseText;try{json=JSON.parse(r.responseText);}
catch(_e){}
callback(json||error('access_denied','Could not get resource'));};var x;if(method==='GET'||method==='DELETE'){data=null;}
else if(data&&typeof(data)!=='string'&&!(data instanceof FormData)&&!(data instanceof File)&&!(data instanceof Blob)){var f=new FormData();for(x in data)if(data.hasOwnProperty(x)){if(data[x]instanceof HTMLInputElement){if('files'in data[x]&&data[x].files.length>0){f.append(x,data[x].files[0]);}}
else if(data[x]instanceof Blob){f.append(x,data[x],data.name);}
else{f.append(x,data[x]);}}
data=f;}
r.open(method,url,true);if(binary){if('responseType'in r){r.responseType=binary;}
else{r.overrideMimeType('text/plain; charset=x-user-defined');}}
if(headers){for(x in headers){r.setRequestHeader(x,headers[x]);}}
r.send(data);return r;function headersToJSON(s){var r={};var reg=/([a-z\-]+):\s?(.*);?/gi;var m;while((m=reg.exec(s))){r[m[1]]=m[2];}
return r;}},jsonp:function(url,callback,callbackID,timeout){var _this=this;var error=_this.error;var bool=0;var head=document.getElementsByTagName('head')[0];var operaFix;var result=error('server_error','server_error');var cb=function(){if(!(bool++)){window.setTimeout(function(){callback(result);head.removeChild(script);},0);}};callbackID=_this.globalEvent(function(json){result=json;return true;},callbackID);url=url.replace(new RegExp('=\\?(&|$)'),'='+ callbackID+'$1');var script=_this.append('script',{id:callbackID,name:callbackID,src:url,async:true,onload:cb,onerror:cb,onreadystatechange:function(){if(/loaded|complete/i.test(this.readyState)){cb();}}});if(window.navigator.userAgent.toLowerCase().indexOf('opera')>-1){operaFix=_this.append('script',{text:'document.getElementById(\''+ callbackID+'\').onerror();'});script.async=false;}
if(timeout){window.setTimeout(function(){result=error('timeout','timeout');cb();},timeout);}
head.appendChild(script);if(operaFix){head.appendChild(operaFix);}},post:function(url,data,options,callback,callbackID,timeout){var _this=this;var error=_this.error;var doc=document;var form=null;var reenableAfterSubmit=[];var newform;var i=0;var x=null;var bool=0;var cb=function(r){if(!(bool++)){callback(r);}};_this.globalEvent(cb,callbackID);var win;try{win=doc.createElement('<iframe name="'+ callbackID+'">');}
catch(e){win=doc.createElement('iframe');}
win.name=callbackID;win.id=callbackID;win.style.display='none';if(options&&options.callbackonload){win.onload=function(){cb({response:'posted',message:'Content was posted'});};}
if(timeout){setTimeout(function(){cb(error('timeout','The post operation timed out'));},timeout);}
doc.body.appendChild(win);if(_this.domInstance('form',data)){form=data.form;for(i=0;i<form.elements.length;i++){if(form.elements[i]!==data){form.elements[i].setAttribute('disabled',true);}}
data=form;}
if(_this.domInstance('form',data)){form=data;for(i=0;i<form.elements.length;i++){if(!form.elements[i].disabled&&form.elements[i].type==='file'){form.encoding=form.enctype='multipart/form-data';form.elements[i].setAttribute('name','file');}}}
else{for(x in data)if(data.hasOwnProperty(x)){if(_this.domInstance('input',data[x])&&data[x].type==='file'){form=data[x].form;form.encoding=form.enctype='multipart/form-data';}}
if(!form){form=doc.createElement('form');doc.body.appendChild(form);newform=form;}
var input;for(x in data)if(data.hasOwnProperty(x)){var el=(_this.domInstance('input',data[x])||_this.domInstance('textArea',data[x])||_this.domInstance('select',data[x]));if(!el||data[x].form!==form){var inputs=form.elements[x];if(input){if(!(inputs instanceof NodeList)){inputs=[inputs];}
for(i=0;i<inputs.length;i++){inputs[i].parentNode.removeChild(inputs[i]);}}
input=doc.createElement('input');input.setAttribute('type','hidden');input.setAttribute('name',x);if(el){input.value=data[x].value;}
else if(_this.domInstance(null,data[x])){input.value=data[x].innerHTML||data[x].innerText;}
else{input.value=data[x];}
form.appendChild(input);}
else if(el&&data[x].name!==x){data[x].setAttribute('name',x);data[x].name=x;}}
for(i=0;i<form.elements.length;i++){input=form.elements[i];if(!(input.name in data)&&input.getAttribute('disabled')!==true){input.setAttribute('disabled',true);reenableAfterSubmit.push(input);}}}
form.setAttribute('method','POST');form.setAttribute('target',callbackID);form.target=callbackID;form.setAttribute('action',url);setTimeout(function(){form.submit();setTimeout(function(){try{if(newform){newform.parentNode.removeChild(newform);}}
catch(e){try{console.error('flybaseauthJS: could not remove iframe');}
catch(ee){}}
for(var i=0;i<reenableAfterSubmit.length;i++){if(reenableAfterSubmit[i]){reenableAfterSubmit[i].setAttribute('disabled',false);reenableAfterSubmit[i].disabled=false;}}},0);},100);},hasBinary:function(data){for(var x in data)if(data.hasOwnProperty(x)){if(this.isBinary(data[x])){return true;}}
return false;},isBinary:function(data){return data instanceof Object&&((this.domInstance('input',data)&&data.type==='file')||('FileList'in window&&data instanceof window.FileList)||('File'in window&&data instanceof window.File)||('Blob'in window&&data instanceof window.Blob));},toBlob:function(dataURI){var reg=/^data\:([^;,]+(\;charset=[^;,]+)?)(\;base64)?,/i;var m=dataURI.match(reg);if(!m){return dataURI;}
var binary=atob(dataURI.replace(reg,''));var array=[];for(var i=0;i<binary.length;i++){array.push(binary.charCodeAt(i));}
return new Blob([new Uint8Array(array)],{type:m[1]});}});(function(flybaseauth){var api=flybaseauth.api;var utils=flybaseauth.utils;utils.extend(utils,{dataToJSON:function(p){var _this=this;var w=window;var data=p.data;if(_this.domInstance('form',data)){data=_this.nodeListToJSON(data.elements);}
else if('NodeList'in w&&data instanceof NodeList){data=_this.nodeListToJSON(data);}
else if(_this.domInstance('input',data)){data=_this.nodeListToJSON([data]);}
if(('File'in w&&data instanceof w.File)||('Blob'in w&&data instanceof w.Blob)||('FileList'in w&&data instanceof w.FileList)){data={file:data};}
if(!('FormData'in w&&data instanceof w.FormData)){for(var x in data)if(data.hasOwnProperty(x)){if('FileList'in w&&data[x]instanceof w.FileList){if(data[x].length===1){data[x]=data[x][0];}}
else if(_this.domInstance('input',data[x])&&data[x].type==='file'){continue;}
else if(_this.domInstance('input',data[x])||_this.domInstance('select',data[x])||_this.domInstance('textArea',data[x])){data[x]=data[x].value;}
else if(_this.domInstance(null,data[x])){data[x]=data[x].innerHTML||data[x].innerText;}}}
p.data=data;return data;},nodeListToJSON:function(nodelist){var json={};for(var i=0;i<nodelist.length;i++){var input=nodelist[i];if(input.disabled||!input.name){continue;}
if(input.type==='file'){json[input.name]=input;}
else{json[input.name]=input.value||input.innerHTML;}}
return json;}});flybaseauth.api=function(){var p=utils.args({path:'s!',method:'s',data:'o',timeout:'i',callback:'f'},arguments);if(p.data){utils.dataToJSON(p);}
return api.call(this,p);};})(flybaseauth);flybaseauth.utils.responseHandler(window,window.opener||window.parent);if(typeof chrome==='object'&&typeof chrome.identity==='object'&&chrome.identity.launchWebAuthFlow){(function(){flybaseauth.utils.popup=function(url){return _open(url,true);};flybaseauth.utils.iframe=function(url){_open(url,false);};flybaseauth.utils.request_cors=function(callback){callback();return true;};var _cache={};chrome.storage.local.get('flybaseauth',function(r){_cache=r.flybaseauth||{};});flybaseauth.utils.store=function(name,value){if(arguments.length===0){return _cache;}
if(arguments.length===1){return _cache[name]||null;}
if(value){_cache[name]=value;chrome.storage.local.set({flybaseauth:_cache});return value;}
if(value===null){delete _cache[name];chrome.storage.local.set({flybaseauth:_cache});return null;}};function _open(url,interactive){var ref={closed:false};chrome.identity.launchWebAuthFlow({url:url,interactive:interactive},function(responseUrl){if(responseUrl===undefined){ref.closed=true;return;}
var a=flybaseauth.utils.url(responseUrl);var _popup={location:{assign:function(url){_open(url,false);},search:a.search,hash:a.hash,href:a.href},close:function(){}};flybaseauth.utils.responseHandler(_popup,window);});return ref;}})();}
(function(){if(!(/^file:\/{3}[^\/]/.test(window.location.href)&&window.cordova)){return;}
flybaseauth.utils.iframe=function(url,redirectUri){flybaseauth.utils.popup(url,redirectUri,{hidden:'yes'});};var utilPopup=flybaseauth.utils.popup;flybaseauth.utils.popup=function(url,redirectUri,options){var popup=utilPopup.call(this,url,redirectUri,options);try{if(popup&&popup.addEventListener){var a=flybaseauth.utils.url(redirectUri);var redirectUriOrigin=a.origin||(a.protocol+'//'+ a.hostname);popup.addEventListener('loadstart',function(e){var url=e.url;if(url.indexOf(redirectUriOrigin)!==0){return;}
var a=flybaseauth.utils.url(url);var _popup={location:{assign:function(location){popup.executeScript({code:'window.location.href = "'+ location+';"'});},search:a.search,hash:a.hash,href:a.href},close:function(){if(popup.close){popup.close();try{popup.closed=true;}
catch(_e){}}}};flybaseauth.utils.responseHandler(_popup,window);});}}
catch(e){}
return popup;};})();(function(flybaseauth){var OAuth1Settings={version:'1.0',auth:'https://www.dropbox.com/1/oauth/authorize',request:'https://api.dropbox.com/1/oauth/request_token',token:'https://api.dropbox.com/1/oauth/access_token'};var OAuth2Settings={version:2,auth:'https://www.dropbox.com/1/oauth2/authorize',grant:'https://api.dropbox.com/1/oauth2/token'};flybaseauth.init({dropbox:{name:'Dropbox',oauth:OAuth2Settings,login:function(p){p.qs.scope='';delete p.qs.display;var redirect=decodeURIComponent(p.qs.redirect_uri);if(redirect.indexOf('http:')===0&&redirect.indexOf('http://localhost/')!==0){flybaseauth.services.dropbox.oauth=OAuth1Settings;}
else{flybaseauth.services.dropbox.oauth=OAuth2Settings;}
p.options.popup.width=1000;p.options.popup.height=1000;},base:'https://api.dropbox.com/1/',root:'sandbox',get:{me:'account/info','me/files':req('metadata/auto/@{parent|}'),'me/folder':req('metadata/auto/@{id}'),'me/folders':req('metadata/auto/'),'default':function(p,callback){if(p.path.match('https://api-content.dropbox.com/1/files/')){p.method='blob';}
callback(p.path);}},post:{'me/files':function(p,callback){var path=p.data.parent;var fileName=p.data.name;p.data={file:p.data.file};if(typeof(p.data.file)==='string'){p.data.file=flybaseauth.utils.toBlob(p.data.file);}
callback('https://api-content.dropbox.com/1/files_put/auto/'+ path+'/'+ fileName);},'me/folders':function(p,callback){var name=p.data.name;p.data={};callback('fileops/create_folder?root=@{root|sandbox}&'+ flybaseauth.utils.param({path:name}));}},del:{'me/files':'fileops/delete?root=@{root|sandbox}&path=@{id}','me/folder':'fileops/delete?root=@{root|sandbox}&path=@{id}'},wrap:{me:function(o){formatError(o);if(!o.uid){return o;}
o.name=o.display_name;var m=o.name.split(' ');o.first_name=m.shift();o.last_name=m.join(' ');o.id=o.uid;delete o.uid;delete o.display_name;return o;},'default':function(o,headers,req){formatError(o);if(o.is_dir&&o.contents){o.data=o.contents;delete o.contents;o.data.forEach(function(item){item.root=o.root;formatFile(item,headers,req);});}
formatFile(o,headers,req);if(o.is_deleted){o.success=true;}
return o;}},xhr:function(p){if(p.data&&p.data.file){var file=p.data.file;if(file){if(file.files){p.data=file.files[0];}
else{p.data=file;}}}
if(p.method==='delete'){p.method='post';}
return true;},form:function(p,qs){delete qs.state;delete qs.redirect_uri;}}});function formatError(o){if(o&&'error'in o){o.error={code:'server_error',message:o.error.message||o.error};}}
function formatFile(o,headers,req){if(typeof o!=='object'||(typeof Blob!=='undefined'&&o instanceof Blob)||(typeof ArrayBuffer!=='undefined'&&o instanceof ArrayBuffer)){return;}
if('error'in o){return;}
var path=(o.root!=='app_folder'?o.root:'')+ o.path.replace(/\&/g,'%26');path=path.replace(/^\//,'');if(o.thumb_exists){o.thumbnail=req.oauth_proxy+'?path='+
encodeURIComponent('https://api-content.dropbox.com/1/thumbnails/auto/'+ path+'?format=jpeg&size=m')+'&access_token='+ req.options.access_token;}
o.type=(o.is_dir?'folder':o.mime_type);o.name=o.path.replace(/.*\//g,'');if(o.is_dir){o.files=path.replace(/^\//,'');}
else{o.downloadLink=flybaseauth.settings.oauth_proxy+'?path='+
encodeURIComponent('https://api-content.dropbox.com/1/files/auto/'+ path)+'&access_token='+ req.options.access_token;o.file='https://api-content.dropbox.com/1/files/auto/'+ path;}
if(!o.id){o.id=o.path.replace(/^\//,'');}}
function req(str){return function(p,cb){delete p.query.limit;cb(str);};}})(flybaseauth);(function(flybaseauth){flybaseauth.init({facebook:{name:'Facebook',oauth:{version:2,auth:'https://www.facebook.com/dialog/oauth/',grant:'https://graph.facebook.com/oauth/access_token'},scope:{basic:'public_profile',email:'email',share:'user_posts',birthday:'user_birthday',events:'user_events',photos:'user_photos',videos:'user_videos',friends:'user_friends',files:'user_photos,user_videos',publish_files:'user_photos,user_videos,publish_actions',publish:'publish_actions',offline_access:''},refresh:true,login:function(p){if(p.options.force){p.qs.auth_type='reauthenticate';}
p.options.popup.width=580;p.options.popup.height=400;},logout:function(callback,options){var callbackID=flybaseauth.utils.globalEvent(callback);var redirect=encodeURIComponent(flybaseauth.settings.redirect_uri+'?'+ flybaseauth.utils.param({callback:callbackID,result:JSON.stringify({force:true}),state:'{}'}));var token=(options.authResponse||{}).access_token;flybaseauth.utils.iframe('https://www.facebook.com/logout.php?next='+ redirect+'&access_token='+ token);if(!token){return false;}},base:'https://graph.facebook.com/v2.4/',get:{me:'me?fields=email,first_name,last_name,name,timezone,verified','me/friends':'me/friends','me/following':'me/friends','me/followers':'me/friends','me/share':'me/feed','me/like':'me/likes','me/files':'me/albums','me/albums':'me/albums?fields=cover_photo,name','me/album':'@{id}/photos?fields=picture','me/photos':'me/photos','me/photo':'@{id}','friend/albums':'@{id}/albums','friend/photos':'@{id}/photos'},post:{'me/share':'me/feed','me/photo':'@{id}'},wrap:{me:formatUser,'me/friends':formatFriends,'me/following':formatFriends,'me/followers':formatFriends,'me/albums':format,'me/photos':format,'me/files':format,'default':format},xhr:function(p,qs){if(p.method==='get'||p.method==='post'){qs.suppress_response_codes=true;}
if(p.method==='post'&&p.data&&typeof(p.data.file)==='string'){p.data.file=flybaseauth.utils.toBlob(p.data.file);}
return true;},jsonp:function(p,qs){var m=p.method;if(m!=='get'&&!flybaseauth.utils.hasBinary(p.data)){p.data.method=m;p.method='get';}
else if(p.method==='delete'){qs.method='delete';p.method='post';}},form:function(p){return{callbackonload:true};}}});var base='https://graph.facebook.com/';function formatUser(o){if(o.id){o.thumbnail=o.picture='https://graph.facebook.com/'+ o.id+'/picture';}
return o;}
function formatFriends(o){if('data'in o){o.data.forEach(formatUser);}
return o;}
function format(o,headers,req){if(typeof o==='boolean'){o={success:o};}
if(o&&'data'in o){var token=req.query.access_token;if(!(o.data instanceof Array)){var data=o.data;delete o.data;o.data=[data];}
o.data.forEach(function(d){if(d.picture){d.thumbnail=d.picture;}
d.pictures=(d.images||[]).sort(function(a,b){return a.width- b.width;});if(d.cover_photo&&d.cover_photo.id){d.thumbnail=base+ d.cover_photo.id+'/picture?access_token='+ token;}
if(d.type==='album'){d.files=d.photos=base+ d.id+'/photos';}
if(d.can_upload){d.upload_location=base+ d.id+'/photos';}});}
return o;}})(flybaseauth);(function(flybaseauth){flybaseauth.init({flickr:{name:'Flickr',oauth:{version:'1.0a',auth:'https://www.flickr.com/services/oauth/authorize?perms=read',request:'https://www.flickr.com/services/oauth/request_token',token:'https://www.flickr.com/services/oauth/access_token'},base:'https://api.flickr.com/services/rest',get:{me:sign('flickr.people.getInfo'),'me/friends':sign('flickr.contacts.getList',{per_page:'@{limit|50}'}),'me/following':sign('flickr.contacts.getList',{per_page:'@{limit|50}'}),'me/followers':sign('flickr.contacts.getList',{per_page:'@{limit|50}'}),'me/albums':sign('flickr.photosets.getList',{per_page:'@{limit|50}'}),'me/album':sign('flickr.photosets.getPhotos',{photoset_id:'@{id}'}),'me/photos':sign('flickr.people.getPhotos',{per_page:'@{limit|50}'})},wrap:{me:function(o){formatError(o);o=checkResponse(o,'person');if(o.id){if(o.realname){o.name=o.realname._content;var m=o.name.split(' ');o.first_name=m.shift();o.last_name=m.join(' ');}
o.thumbnail=getBuddyIcon(o,'l');o.picture=getBuddyIcon(o,'l');}
return o;},'me/friends':formatFriends,'me/followers':formatFriends,'me/following':formatFriends,'me/albums':function(o){formatError(o);o=checkResponse(o,'photosets');paging(o);if(o.photoset){o.data=o.photoset;o.data.forEach(function(item){item.name=item.title._content;item.photos='https://api.flickr.com/services/rest'+ getApiUrl('flickr.photosets.getPhotos',{photoset_id:item.id},true);});delete o.photoset;}
return o;},'me/photos':function(o){formatError(o);return formatPhotos(o);},'default':function(o){formatError(o);return formatPhotos(o);}},xhr:false,jsonp:function(p,qs){if(p.method=='get'){delete qs.callback;qs.jsoncallback=p.callbackID;}}}});function getApiUrl(method,extraParams,skipNetwork){var url=((skipNetwork)?'':'flickr:')+'?method='+ method+'&api_key='+ flybaseauth.services.flickr.id+'&format=json';for(var param in extraParams){if(extraParams.hasOwnProperty(param)){url+='&'+ param+'='+ extraParams[param];}}
return url;}
function withUser(cb){var auth=flybaseauth.getAuthResponse('flickr');cb(auth&&auth.user_nsid?auth.user_nsid:null);}
function sign(url,params){if(!params){params={};}
return function(p,callback){withUser(function(userId){params.user_id=userId;callback(getApiUrl(url,params,true));});};}
function getBuddyIcon(profile,size){var url='https://www.flickr.com/images/buddyicon.gif';if(profile.nsid&&profile.iconserver&&profile.iconfarm){url='https://farm'+ profile.iconfarm+'.staticflickr.com/'+
profile.iconserver+'/'+'buddyicons/'+ profile.nsid+
((size)?'_'+ size:'')+'.jpg';}
return url;}
function createPhotoUrl(id,farm,server,secret,size){size=(size)?'_'+ size:'';return'https://farm'+ farm+'.staticflickr.com/'+ server+'/'+ id+'_'+ secret+ size+'.jpg';}
function formatUser(o){}
function formatError(o){if(o&&o.stat&&o.stat.toLowerCase()!='ok'){o.error={code:'invalid_request',message:o.message};}}
function formatPhotos(o){if(o.photoset||o.photos){var set=('photoset'in o)?'photoset':'photos';o=checkResponse(o,set);paging(o);o.data=o.photo;delete o.photo;for(var i=0;i<o.data.length;i++){var photo=o.data[i];photo.name=photo.title;photo.picture=createPhotoUrl(photo.id,photo.farm,photo.server,photo.secret,'');photo.pictures=createPictures(photo.id,photo.farm,photo.server,photo.secret);photo.source=createPhotoUrl(photo.id,photo.farm,photo.server,photo.secret,'b');photo.thumbnail=createPhotoUrl(photo.id,photo.farm,photo.server,photo.secret,'m');}}
return o;}
function createPictures(id,farm,server,secret){var NO_LIMIT=2048;var sizes=[{id:'t',max:100},{id:'m',max:240},{id:'n',max:320},{id:'',max:500},{id:'z',max:640},{id:'c',max:800},{id:'b',max:1024},{id:'h',max:1600},{id:'k',max:2048},{id:'o',max:NO_LIMIT}];return sizes.map(function(size){return{source:createPhotoUrl(id,farm,server,secret,size.id),width:size.max,height:size.max};});}
function checkResponse(o,key){if(key in o){o=o[key];}
else if(!('error'in o)){o.error={code:'invalid_request',message:o.message||'Failed to get data from Flickr'};}
return o;}
function formatFriends(o){formatError(o);if(o.contacts){o=checkResponse(o,'contacts');paging(o);o.data=o.contact;delete o.contact;for(var i=0;i<o.data.length;i++){var item=o.data[i];item.id=item.nsid;item.name=item.realname||item.username;item.thumbnail=getBuddyIcon(item,'m');}}
return o;}
function paging(res){if(res.page&&res.pages&&res.page!==res.pages){res.paging={next:'?page='+(++res.page)};}}})(flybaseauth);(function(flybaseauth){flybaseauth.init({foursquare:{name:'Foursquare',oauth:{version:2,auth:'https://foursquare.com/oauth2/authenticate',grant:'https://foursquare.com/oauth2/access_token'},refresh:true,base:'https://api.foursquare.com/v2/',get:{me:'users/self','me/friends':'users/self/friends','me/followers':'users/self/friends','me/following':'users/self/friends'},wrap:{me:function(o){formatError(o);if(o&&o.response){o=o.response.user;formatUser(o);}
return o;},'default':function(o){formatError(o);if(o&&'response'in o&&'friends'in o.response&&'items'in o.response.friends){o.data=o.response.friends.items;o.data.forEach(formatUser);delete o.response;}
return o;}},xhr:formatRequest,jsonp:formatRequest}});function formatError(o){if(o.meta&&(o.meta.code===400||o.meta.code===401)){o.error={code:'access_denied',message:o.meta.errorDetail};}}
function formatUser(o){if(o&&o.id){o.thumbnail=o.photo.prefix+'100x100'+ o.photo.suffix;o.name=o.firstName+' '+ o.lastName;o.first_name=o.firstName;o.last_name=o.lastName;if(o.contact){if(o.contact.email){o.email=o.contact.email;}}}}
function formatRequest(p,qs){var token=qs.access_token;delete qs.access_token;qs.oauth_token=token;qs.v=20121125;return true;}})(flybaseauth);(function(flybaseauth){flybaseauth.init({github:{name:'GitHub',oauth:{version:2,auth:'https://github.com/login/oauth/authorize',grant:'https://github.com/login/oauth/access_token',response_type:'code'},scope:{email:'user:email'},base:'https://api.github.com/',get:{me:'user','me/friends':'user/following?per_page=@{limit|100}','me/following':'user/following?per_page=@{limit|100}','me/followers':'user/followers?per_page=@{limit|100}','me/like':'user/starred?per_page=@{limit|100}'},wrap:{me:function(o,headers){formatError(o,headers);formatUser(o);return o;},'default':function(o,headers,req){formatError(o,headers);if(Array.isArray(o)){o={data:o};}
if(o.data){paging(o,headers,req);o.data.forEach(formatUser);}
return o;}},xhr:function(p){if(p.method!=='get'&&p.data){p.headers=p.headers||{};p.headers['Content-Type']='application/json';if(typeof(p.data)==='object'){p.data=JSON.stringify(p.data);}}
return true;}}});function formatError(o,headers){var code=headers?headers.statusCode:(o&&'meta'in o&&'status'in o.meta&&o.meta.status);if((code===401||code===403)){o.error={code:'access_denied',message:o.message||(o.data?o.data.message:'Could not get response')};delete o.message;}}
function formatUser(o){if(o.id){o.thumbnail=o.picture=o.avatar_url;o.name=o.login;}}
function paging(res,headers,req){if(res.data&&res.data.length&&headers&&headers.Link){var next=headers.Link.match(/<(.*?)>;\s*rel=\"next\"/);if(next){res.paging={next:next[1]};}}}})(flybaseauth);(function(flybaseauth){var contactsUrl='https://www.google.com/m8/feeds/contacts/default/full?v=3.0&alt=json&max-results=@{limit|1000}&start-index=@{start|1}';flybaseauth.init({google:{name:'Google Plus',oauth:{version:2,auth:'https://accounts.google.com/o/oauth2/auth',grant:'https://accounts.google.com/o/oauth2/token'},scope:{basic:'https://www.googleapis.com/auth/plus.me profile',email:'email',birthday:'',events:'',photos:'https://picasaweb.google.com/data/',videos:'http://gdata.youtube.com',friends:'https://www.google.com/m8/feeds, https://www.googleapis.com/auth/plus.login',files:'https://www.googleapis.com/auth/drive.readonly',publish:'',publish_files:'https://www.googleapis.com/auth/drive',share:'',create_event:'',offline_access:''},scope_delim:' ',login:function(p){if(p.qs.display==='none'){p.qs.display='';}
if(p.qs.response_type==='code'){p.qs.access_type='offline';}
if(p.options.force){p.qs.approval_prompt='force';}},base:'https://www.googleapis.com/',get:{me:'plus/v1/people/me','me/friends':'plus/v1/people/me/people/visible?maxResults=@{limit|100}','me/following':contactsUrl,'me/followers':contactsUrl,'me/contacts':contactsUrl,'me/share':'plus/v1/people/me/activities/public?maxResults=@{limit|100}','me/feed':'plus/v1/people/me/activities/public?maxResults=@{limit|100}','me/albums':'https://picasaweb.google.com/data/feed/api/user/default?alt=json&max-results=@{limit|100}&start-index=@{start|1}','me/album':function(p,callback){var key=p.query.id;delete p.query.id;callback(key.replace('/entry/','/feed/'));},'me/photos':'https://picasaweb.google.com/data/feed/api/user/default?alt=json&kind=photo&max-results=@{limit|100}&start-index=@{start|1}','me/file':'drive/v2/files/@{id}','me/files':'drive/v2/files?q=%22@{parent|root}%22+in+parents+and+trashed=false&maxResults=@{limit|100}','me/folders':'drive/v2/files?q=%22@{id|root}%22+in+parents+and+mimeType+=+%22application/vnd.google-apps.folder%22+and+trashed=false&maxResults=@{limit|100}','me/folder':'drive/v2/files?q=%22@{id|root}%22+in+parents+and+trashed=false&maxResults=@{limit|100}'},post:{'me/files':uploadDrive,'me/folders':function(p,callback){p.data={title:p.data.name,parents:[{id:p.data.parent||'root'}],mimeType:'application/vnd.google-apps.folder'};callback('drive/v2/files');}},put:{'me/files':uploadDrive},del:{'me/files':'drive/v2/files/@{id}','me/folder':'drive/v2/files/@{id}'},patch:{'me/file':'drive/v2/files/@{id}'},wrap:{me:function(o){if(o.id){o.last_name=o.family_name||(o.name?o.name.familyName:null);o.first_name=o.given_name||(o.name?o.name.givenName:null);if(o.emails&&o.emails.length){o.email=o.emails[0].value;}
formatPerson(o);}
return o;},'me/friends':function(o){if(o.items){paging(o);o.data=o.items;o.data.forEach(formatPerson);delete o.items;}
return o;},'me/contacts':formatFriends,'me/followers':formatFriends,'me/following':formatFriends,'me/share':formatFeed,'me/feed':formatFeed,'me/albums':gEntry,'me/photos':formatPhotos,'default':gEntry},xhr:function(p){if(p.method==='post'||p.method==='put'){toJSON(p);}
else if(p.method==='patch'){flybaseauth.utils.extend(p.query,p.data);p.data=null;}
return true;},form:false}});function toInt(s){return parseInt(s,10);}
function formatFeed(o){paging(o);o.data=o.items;delete o.items;return o;}
function formatItem(o){if(o.error){return;}
if(!o.name){o.name=o.title||o.message;}
if(!o.picture){o.picture=o.thumbnailLink;}
if(!o.thumbnail){o.thumbnail=o.thumbnailLink;}
if(o.mimeType==='application/vnd.google-apps.folder'){o.type='folder';o.files='https://www.googleapis.com/drive/v2/files?q=%22'+ o.id+'%22+in+parents';}
return o;}
function formatImage(image){return{source:image.url,width:image.width,height:image.height};}
function formatPhotos(o){o.data=o.feed.entry.map(formatEntry);delete o.feed;}
function gEntry(o){paging(o);if('feed'in o&&'entry'in o.feed){o.data=o.feed.entry.map(formatEntry);delete o.feed;}
else if('entry'in o){return formatEntry(o.entry);}
else if('items'in o){o.data=o.items.map(formatItem);delete o.items;}
else{formatItem(o);}
return o;}
function formatPerson(o){o.name=o.displayName||o.name;o.picture=o.picture||(o.image?o.image.url:null);o.thumbnail=o.picture;}
function formatFriends(o,headers,req){paging(o);var r=[];if('feed'in o&&'entry'in o.feed){var token=req.query.access_token;for(var i=0;i<o.feed.entry.length;i++){var a=o.feed.entry[i];a.id=a.id.$t;a.name=a.title.$t;delete a.title;if(a.gd$email){a.email=(a.gd$email&&a.gd$email.length>0)?a.gd$email[0].address:null;a.emails=a.gd$email;delete a.gd$email;}
if(a.updated){a.updated=a.updated.$t;}
if(a.link){var pic=(a.link.length>0)?a.link[0].href:null;if(pic&&a.link[0].gd$etag){pic+=(pic.indexOf('?')>-1?'&':'?')+'access_token='+ token;a.picture=pic;a.thumbnail=pic;}
delete a.link;}
if(a.category){delete a.category;}}
o.data=o.feed.entry;delete o.feed;}
return o;}
function formatEntry(a){var group=a.media$group;var photo=group.media$content.length?group.media$content[0]:{};var mediaContent=group.media$content||[];var mediaThumbnail=group.media$thumbnail||[];var pictures=mediaContent.concat(mediaThumbnail).map(formatImage).sort(function(a,b){return a.width- b.width;});var i=0;var _a;var p={id:a.id.$t,name:a.title.$t,description:a.summary.$t,updated_time:a.updated.$t,created_time:a.published.$t,picture:photo?photo.url:null,pictures:pictures,images:[],thumbnail:photo?photo.url:null,width:photo.width,height:photo.height};if('link'in a){for(i=0;i<a.link.length;i++){var d=a.link[i];if(d.rel.match(/\#feed$/)){p.upload_location=p.files=p.photos=d.href;break;}}}
if('category'in a&&a.category.length){_a=a.category;for(i=0;i<_a.length;i++){if(_a[i].scheme&&_a[i].scheme.match(/\#kind$/)){p.type=_a[i].term.replace(/^.*?\#/,'');}}}
if('media$thumbnail'in group&&group.media$thumbnail.length){_a=group.media$thumbnail;p.thumbnail=_a[0].url;p.images=_a.map(formatImage);}
_a=group.media$content;if(_a&&_a.length){p.images.push(formatImage(_a[0]));}
return p;}
function paging(res){if('feed'in res&&res.feed.openSearch$itemsPerPage){var limit=toInt(res.feed.openSearch$itemsPerPage.$t);var start=toInt(res.feed.openSearch$startIndex.$t);var total=toInt(res.feed.openSearch$totalResults.$t);if((start+ limit)<total){res.paging={next:'?start='+(start+ limit)};}}
else if('nextPageToken'in res){res.paging={next:'?pageToken='+ res.nextPageToken};}}
function Multipart(){var body=[];var boundary=(Math.random()*1e10).toString(32);var counter=0;var lineBreak='\r\n';var delim=lineBreak+'--'+ boundary;var ready=function(){};var dataUri=/^data\:([^;,]+(\;charset=[^;,]+)?)(\;base64)?,/i;function addFile(item){var fr=new FileReader();fr.onload=function(e){addContent(btoa(e.target.result),item.type+ lineBreak+'Content-Transfer-Encoding: base64');};fr.readAsBinaryString(item);}
function addContent(content,type){body.push(lineBreak+'Content-Type: '+ type+ lineBreak+ lineBreak+ content);counter--;ready();}
this.append=function(content,type){if(typeof(content)==='string'||!('length'in Object(content))){content=[content];}
for(var i=0;i<content.length;i++){counter++;var item=content[i];if((typeof(File)!=='undefined'&&item instanceof File)||(typeof(Blob)!=='undefined'&&item instanceof Blob)){addFile(item);}
else if(typeof(item)==='string'&&item.match(dataUri)){var m=item.match(dataUri);addContent(item.replace(dataUri,''),m[1]+ lineBreak+'Content-Transfer-Encoding: base64');}
else{addContent(item,type);}}};this.onready=function(fn){ready=function(){if(counter===0){body.unshift('');body.push('--');fn(body.join(delim),boundary);body=[];}};ready();};}
function uploadDrive(p,callback){var data={};if(p.data&&(typeof(HTMLInputElement)!=='undefined'&&p.data instanceof HTMLInputElement)){p.data={file:p.data};}
if(!p.data.name&&Object(Object(p.data.file).files).length&&p.method==='post'){p.data.name=p.data.file.files[0].name;}
if(p.method==='post'){p.data={title:p.data.name,parents:[{id:p.data.parent||'root'}],file:p.data.file};}
else{data=p.data;p.data={};if(data.parent){p.data.parents=[{id:p.data.parent||'root'}];}
if(data.file){p.data.file=data.file;}
if(data.name){p.data.title=data.name;}}
var file;if('file'in p.data){file=p.data.file;delete p.data.file;if(typeof(file)==='object'&&'files'in file){file=file.files;}
if(!file||!file.length){callback({error:{code:'request_invalid',message:'There were no files attached with this request to upload'}});return;}}
var parts=new Multipart();parts.append(JSON.stringify(p.data),'application/json');if(file){parts.append(file);}
parts.onready(function(body,boundary){p.headers['content-type']='multipart/related; boundary="'+ boundary+'"';p.data=body;callback('upload/drive/v2/files'+(data.id?'/'+ data.id:'')+'?uploadType=multipart');});}
function toJSON(p){if(typeof(p.data)==='object'){try{p.data=JSON.stringify(p.data);p.headers['content-type']='application/json';}
catch(e){}}}})(flybaseauth);(function(flybaseauth){flybaseauth.init({instagram:{name:'Instagram',oauth:{version:2,auth:'https://instagram.com/oauth/authorize/',grant:'https://api.instagram.com/oauth/access_token'},refresh:true,scope:{basic:'basic',photos:'',friends:'relationships',publish:'likes comments',email:'',share:'',publish_files:'',files:'',videos:'',offline_access:''},scope_delim:' ',login:function(p){p.qs.display='';},base:'https://api.instagram.com/v1/',get:{me:'users/self','me/feed':'users/self/feed?count=@{limit|100}','me/photos':'users/self/media/recent?min_id=0&count=@{limit|100}','me/friends':'users/self/follows?count=@{limit|100}','me/following':'users/self/follows?count=@{limit|100}','me/followers':'users/self/followed-by?count=@{limit|100}','friend/photos':'users/@{id}/media/recent?min_id=0&count=@{limit|100}'},post:{'me/like':function(p,callback){var id=p.data.id;p.data={};callback('media/'+ id+'/likes');}},del:{'me/like':'media/@{id}/likes'},wrap:{me:function(o){formatError(o);if('data'in o){o.id=o.data.id;o.thumbnail=o.data.profile_picture;o.name=o.data.full_name||o.data.username;}
return o;},'me/friends':formatFriends,'me/following':formatFriends,'me/followers':formatFriends,'me/photos':function(o){formatError(o);paging(o);if('data'in o){o.data=o.data.filter(function(d){return d.type==='image';});o.data.forEach(function(d){d.name=d.caption?d.caption.text:null;d.thumbnail=d.images.thumbnail.url;d.picture=d.images.standard_resolution.url;d.pictures=Object.keys(d.images).map(function(key){var image=d.images[key];return formatImage(image);}).sort(function(a,b){return a.width- b.width;});});}
return o;},'default':function(o){o=formatError(o);paging(o);return o;}},xhr:function(p,qs){var method=p.method;var proxy=method!=='get';if(proxy){if((method==='post'||method==='put')&&p.query.access_token){p.data.access_token=p.query.access_token;delete p.query.access_token;}
p.proxy=proxy;}
return proxy;},form:false}});function formatImage(image){return{source:image.url,width:image.width,height:image.height};}
function formatError(o){if(typeof o==='string'){return{error:{code:'invalid_request',message:o}};}
if(o&&'meta'in o&&'error_type'in o.meta){o.error={code:o.meta.error_type,message:o.meta.error_message};}
return o;}
function formatFriends(o){paging(o);if(o&&'data'in o){o.data.forEach(formatFriend);}
return o;}
function formatFriend(o){if(o.id){o.thumbnail=o.profile_picture;o.name=o.full_name||o.username;}}
function paging(res){if('pagination'in res){res.paging={next:res.pagination.next_url};delete res.pagination;}}})(flybaseauth);(function(flybaseauth){flybaseauth.init({joinme:{name:'join.me',oauth:{version:2,auth:'https://secure.join.me/api/public/v1/auth/oauth2',grant:'https://secure.join.me/api/public/v1/auth/oauth2'},refresh:false,scope:{basic:'user_info',user:'user_info',scheduler:'scheduler',start:'start_meeting',email:'',friends:'',share:'',publish:'',photos:'',publish_files:'',files:'',videos:'',offline_access:''},scope_delim:' ',login:function(p){p.options.popup.width=400;p.options.popup.height=700;},base:'https://api.join.me/v1/',get:{me:'user',meetings:'meetings','meetings/info':'meetings/@{id}'},post:{'meetings/start/adhoc':function(p,callback){callback('meetings/start');},'meetings/start/scheduled':function(p,callback){var meetingId=p.data.meetingId;p.data={};callback('meetings/'+ meetingId+'/start');},'meetings/schedule':function(p,callback){callback('meetings');}},patch:{'meetings/update':function(p,callback){callback('meetings/'+ p.data.meetingId);}},del:{'meetings/delete':'meetings/@{id}'},wrap:{me:function(o,headers){formatError(o,headers);if(!o.email){return o;}
o.name=o.fullName;o.first_name=o.name.split(' ')[0];o.last_name=o.name.split(' ')[1];o.id=o.email;return o;},'default':function(o,headers){formatError(o,headers);return o;}},xhr:formatRequest}});function formatError(o,headers){var errorCode;var message;var details;if(o&&('Message'in o)){message=o.Message;delete o.Message;if('ErrorCode'in o){errorCode=o.ErrorCode;delete o.ErrorCode;}
else{errorCode=getErrorCode(headers);}
o.error={code:errorCode,message:message,details:o};}
return o;}
function formatRequest(p,qs){var token=qs.access_token;delete qs.access_token;p.headers.Authorization='Bearer '+ token;if(p.method!=='get'&&p.data){p.headers['Content-Type']='application/json';if(typeof(p.data)==='object'){p.data=JSON.stringify(p.data);}}
if(p.method==='put'){p.method='patch';}
return true;}
function getErrorCode(headers){switch(headers.statusCode){case 400:return'invalid_request';case 403:return'stale_token';case 401:return'invalid_token';case 500:return'server_error';default:return'server_error';}}}(flybaseauth));(function(flybaseauth){flybaseauth.init({linkedin:{oauth:{version:2,response_type:'code',auth:'https://www.linkedin.com/uas/oauth2/authorization',grant:'https://www.linkedin.com/uas/oauth2/accessToken'},refresh:true,scope:{basic:'r_basicprofile',email:'r_emailaddress',files:'',friends:'',photos:'',publish:'w_share',publish_files:'w_share',share:'',videos:'',offline_access:''},scope_delim:' ',base:'https://api.linkedin.com/v1/',get:{me:'people/~:(picture-url,first-name,last-name,id,formatted-name,email-address)','me/share':'people/~/network/updates?count=@{limit|250}'},post:{'me/share':function(p,callback){var data={visibility:{code:'anyone'}};if(p.data.id){data.attribution={share:{id:p.data.id}};}
else{data.comment=p.data.message;if(p.data.picture&&p.data.link){data.content={'submitted-url':p.data.link,'submitted-image-url':p.data.picture};}}
p.data=JSON.stringify(data);callback('people/~/shares?format=json');},'me/like':like},del:{'me/like':like},wrap:{me:function(o){formatError(o);formatUser(o);return o;},'me/friends':formatFriends,'me/following':formatFriends,'me/followers':formatFriends,'me/share':function(o){formatError(o);paging(o);if(o.values){o.data=o.values.map(formatUser);o.data.forEach(function(item){item.message=item.headline;});delete o.values;}
return o;},'default':function(o,headers){formatError(o);empty(o,headers);paging(o);}},jsonp:function(p,qs){formatQuery(qs);if(p.method==='get'){qs.format='jsonp';qs['error-callback']=p.callbackID;}},xhr:function(p,qs){if(p.method!=='get'){formatQuery(qs);p.headers['Content-Type']='application/json';p.headers['x-li-format']='json';p.proxy=true;return true;}
return false;}}});function formatError(o){if(o&&'errorCode'in o){o.error={code:o.status,message:o.message};}}
function formatUser(o){if(o.error){return;}
o.first_name=o.firstName;o.last_name=o.lastName;o.name=o.formattedName||(o.first_name+' '+ o.last_name);o.thumbnail=o.pictureUrl;o.email=o.emailAddress;return o;}
function formatFriends(o){formatError(o);paging(o);if(o.values){o.data=o.values.map(formatUser);delete o.values;}
return o;}
function paging(res){if('_count'in res&&'_start'in res&&(res._count+ res._start)<res._total){res.paging={next:'?start='+(res._start+ res._count)+'&count='+ res._count};}}
function empty(o,headers){if(JSON.stringify(o)==='{}'&&headers.statusCode===200){o.success=true;}}
function formatQuery(qs){if(qs.access_token){qs.oauth2_access_token=qs.access_token;delete qs.access_token;}}
function like(p,callback){p.headers['x-li-format']='json';var id=p.data.id;p.data=(p.method!=='delete').toString();p.method='put';callback('people/~/network/updates/key='+ id+'/is-liked');}})(flybaseauth);(function(flybaseauth){flybaseauth.init({soundcloud:{name:'SoundCloud',oauth:{version:2,auth:'https://soundcloud.com/connect',grant:'https://soundcloud.com/oauth2/token'},base:'https://api.soundcloud.com/',get:{me:'me.json','me/friends':'me/followings.json','me/followers':'me/followers.json','me/following':'me/followings.json','default':function(p,callback){callback(p.path+'.json');}},wrap:{me:function(o){formatUser(o);return o;},'default':function(o){if(Array.isArray(o)){o={data:o.map(formatUser)};}
paging(o);return o;}},xhr:formatRequest,jsonp:formatRequest}});function formatRequest(p,qs){var token=qs.access_token;delete qs.access_token;qs.oauth_token=token;qs['_status_code_map[302]']=200;return true;}
function formatUser(o){if(o.id){o.picture=o.avatar_url;o.thumbnail=o.avatar_url;o.name=o.username||o.full_name;}
return o;}
function paging(res){if('next_href'in res){res.paging={next:res.next_href};}}})(flybaseauth);(function(flybaseauth){var base='https://api.twitter.com/';flybaseauth.init({twitter:{oauth:{version:'1.0a',auth:base+'oauth/authenticate',request:base+'oauth/request_token',token:base+'oauth/access_token'},login:function(p){var prefix='?force_login=true';this.oauth.auth=this.oauth.auth.replace(prefix,'')+(p.options.force?prefix:'');},base:base+'1.1/',get:{me:'account/verify_credentials.json','me/friends':'friends/list.json?count=@{limit|200}','me/following':'friends/list.json?count=@{limit|200}','me/followers':'followers/list.json?count=@{limit|200}','me/share':'statuses/user_timeline.json?count=@{limit|200}','me/like':'favorites/list.json?count=@{limit|200}'},post:{'me/share':function(p,callback){var data=p.data;p.data=null;var status=[];if(data.message){status.push(data.message);delete data.message;}
if(data.link){status.push(data.link);delete data.link;}
if(data.picture){status.push(data.picture);delete data.picture;}
if(status.length){data.status=status.join(' ');}
if(data.file){data['media[]']=data.file;delete data.file;p.data=data;callback('statuses/update_with_media.json');}
else if('id'in data){callback('statuses/retweet/'+ data.id+'.json');}
else{flybaseauth.utils.extend(p.query,data);callback('statuses/update.json?include_entities=1');}},'me/like':function(p,callback){var id=p.data.id;p.data=null;callback('favorites/create.json?id='+ id);}},del:{'me/like':function(){p.method='post';var id=p.data.id;p.data=null;callback('favorites/destroy.json?id='+ id);}},wrap:{me:function(res){formatError(res);formatUser(res);return res;},'me/friends':formatFriends,'me/followers':formatFriends,'me/following':formatFriends,'me/share':function(res){formatError(res);paging(res);if(!res.error&&'length'in res){return{data:res};}
return res;},'default':function(res){res=arrayToDataResponse(res);paging(res);return res;}},xhr:function(p){return(p.method!=='get');}}});function formatUser(o){if(o.id){if(o.name){var m=o.name.split(' ');o.first_name=m.shift();o.last_name=m.join(' ');}
o.thumbnail=o.profile_image_url_https||o.profile_image_url;}
return o;}
function formatFriends(o){formatError(o);paging(o);if(o.users){o.data=o.users.map(formatUser);delete o.users;}
return o;}
function formatError(o){if(o.errors){var e=o.errors[0];o.error={code:'request_failed',message:e.message};}}
function paging(res){if('next_cursor_str'in res){res.paging={next:'?cursor='+ res.next_cursor_str};}}
function arrayToDataResponse(res){return Array.isArray(res)?{data:res}:res;}})(flybaseauth);(function(flybaseauth){flybaseauth.init({vk:{name:'Vk',oauth:{version:2,auth:'https://oauth.vk.com/authorize',grant:'https://oauth.vk.com/access_token'},scope:{email:'email',friends:'friends',photos:'photos',videos:'video',share:'share',offline_access:'offline'},refresh:true,login:function(p){p.qs.display=window.navigator&&window.navigator.userAgent&&/ipad|phone|phone|android/.test(window.navigator.userAgent.toLowerCase())?'mobile':'popup';},base:'https://api.vk.com/method/',get:{me:function(p,callback){p.query.fields='id,first_name,last_name,photo_max';callback('users.get');}},wrap:{me:function(res,headers,req){formatError(res);return formatUser(res,req);}},xhr:false,jsonp:true,form:false}});function formatUser(o,req){if(o!==null&&'response'in o&&o.response!==null&&o.response.length){o=o.response[0];o.id=o.uid;o.thumbnail=o.picture=o.photo_max;o.name=o.first_name+' '+ o.last_name;if(req.authResponse&&req.authResponse.email!==null)
o.email=req.authResponse.email;}
return o;}
function formatError(o){if(o.error){var e=o.error;o.error={code:e.error_code,message:e.error_msg};}}})(flybaseauth);(function(flybaseauth){flybaseauth.init({windows:{name:'Windows live',oauth:{version:2,auth:'https://login.live.com/oauth20_authorize.srf',grant:'https://login.live.com/oauth20_token.srf'},refresh:true,logout:function(){return'http://login.live.com/oauth20_logout.srf?ts='+(new Date()).getTime();},scope:{basic:'wl.signin,wl.basic',email:'wl.emails',birthday:'wl.birthday',events:'wl.calendars',photos:'wl.photos',videos:'wl.photos',friends:'wl.contacts_emails',files:'wl.skydrive',publish:'wl.share',publish_files:'wl.skydrive_update',share:'wl.share',create_event:'wl.calendars_update,wl.events_create',offline_access:'wl.offline_access'},base:'https://apis.live.net/v5.0/',get:{me:'me','me/friends':'me/friends','me/following':'me/contacts','me/followers':'me/friends','me/contacts':'me/contacts','me/albums':'me/albums','me/album':'@{id}/files','me/photo':'@{id}','me/files':'@{parent|me/skydrive}/files','me/folders':'@{id|me/skydrive}/files','me/folder':'@{id|me/skydrive}/files'},post:{'me/albums':'me/albums','me/album':'@{id}/files/','me/folders':'@{id|me/skydrive/}','me/files':'@{parent|me/skydrive}/files'},del:{'me/album':'@{id}','me/photo':'@{id}','me/folder':'@{id}','me/files':'@{id}'},wrap:{me:formatUser,'me/friends':formatFriends,'me/contacts':formatFriends,'me/followers':formatFriends,'me/following':formatFriends,'me/albums':formatAlbums,'me/photos':formatDefault,'default':formatDefault},xhr:function(p){if(p.method!=='get'&&p.method!=='delete'&&!flybaseauth.utils.hasBinary(p.data)){if(typeof(p.data.file)==='string'){p.data.file=flybaseauth.utils.toBlob(p.data.file);}
else{p.data=JSON.stringify(p.data);p.headers={'Content-Type':'application/json'};}}
return true;},jsonp:function(p){if(p.method!=='get'&&!flybaseauth.utils.hasBinary(p.data)){p.data.method=p.method;p.method='get';}}}});function formatDefault(o){if('data'in o){o.data.forEach(function(d){if(d.picture){d.thumbnail=d.picture;}
if(d.images){d.pictures=d.images.map(formatImage).sort(function(a,b){return a.width- b.width;});}});}
return o;}
function formatImage(image){return{width:image.width,height:image.height,source:image.source};}
function formatAlbums(o){if('data'in o){o.data.forEach(function(d){d.photos=d.files='https://apis.live.net/v5.0/'+ d.id+'/photos';});}
return o;}
function formatUser(o,headers,req){if(o.id){var token=req.query.access_token;if(o.emails){o.email=o.emails.preferred;}
if(o.is_friend!==false){var id=(o.user_id||o.id);o.thumbnail=o.picture='https://apis.live.net/v5.0/'+ id+'/picture?access_token='+ token;}}
return o;}
function formatFriends(o,headers,req){if('data'in o){o.data.forEach(function(d){formatUser(d,headers,req);});}
return o;}})(flybaseauth);(function(flybaseauth){flybaseauth.init({yahoo:{oauth:{version:'1.0a',auth:'https://api.login.yahoo.com/oauth/v2/request_auth',request:'https://api.login.yahoo.com/oauth/v2/get_request_token',token:'https://api.login.yahoo.com/oauth/v2/get_token'},login:function(p){p.options.popup.width=560;try{delete p.qs.state.scope;}
catch(e){}},base:'https://social.yahooapis.com/v1/',get:{me:yql('select * from social.profile(0) where guid=me'),'me/friends':yql('select * from social.contacts(0) where guid=me'),'me/following':yql('select * from social.contacts(0) where guid=me')},wrap:{me:formatUser,'me/friends':formatFriends,'me/following':formatFriends,'default':paging}}});function formatError(o){if(o&&'meta'in o&&'error_type'in o.meta){o.error={code:o.meta.error_type,message:o.meta.error_message};}}
function formatUser(o){formatError(o);if(o.query&&o.query.results&&o.query.results.profile){o=o.query.results.profile;o.id=o.guid;o.last_name=o.familyName;o.first_name=o.givenName||o.nickname;var a=[];if(o.first_name){a.push(o.first_name);}
if(o.last_name){a.push(o.last_name);}
o.name=a.join(' ');o.email=(o.emails&&o.emails[0])?o.emails[0].handle:null;o.thumbnail=o.image?o.image.imageUrl:null;}
return o;}
function formatFriends(o,headers,request){formatError(o);paging(o,headers,request);var contact;var field;if(o.query&&o.query.results&&o.query.results.contact){o.data=o.query.results.contact;delete o.query;if(!Array.isArray(o.data)){o.data=[o.data];}
o.data.forEach(formatFriend);}
return o;}
function formatFriend(contact){contact.id=null;if(contact.fields&&!(contact.fields instanceof Array)){contact.fields=[contact.fields];}
(contact.fields||[]).forEach(function(field){if(field.type==='email'){contact.email=field.value;}
if(field.type==='name'){contact.first_name=field.value.givenName;contact.last_name=field.value.familyName;contact.name=field.value.givenName+' '+ field.value.familyName;}
if(field.type==='yahooid'){contact.id=field.value;}});}
function paging(res,headers,request){if(res.query&&res.query.count&&request.options){res.paging={next:'?start='+(res.query.count+(+request.options.start||1))};}
return res;}
function yql(q){return'https://query.yahooapis.com/v1/yql?q='+(q+' limit @{limit|100} offset @{start|0}').replace(/\s/g,'%20')+'&format=json';}})(flybaseauth);if(typeof define==='function'&&define.amd){define(function(){return flybaseauth;});}
if(typeof module==='object'&&module.exports){module.exports=flybaseauth;}
(function(){if(typeof angular!=='undefined'){angular.module('flybaseauth-storage',['flybaseauth-storage.store']);angular.module('flybaseauth-storage.cookieStorage',[]).service('cookieStorage',["$injector",function($injector){var $cookieStore=$injector.get('$cookieStore');this.set=function(what,value){return $cookieStore.put(what,value);};this.get=function(what){return $cookieStore.get(what);};this.remove=function(what){return $cookieStore.remove(what);};}]);angular.module('flybaseauth-storage.internalStore',['flybaseauth-storage.localStorage','flybaseauth-storage.sessionStorage']).factory('InternalStore',["$log","$injector",function($log,$injector){function InternalStore(namespace,storage,delimiter){this.namespace=namespace||null;this.delimiter=delimiter||'.';this.inMemoryCache={};this.storage=$injector.get(storage||'localStorage');}
InternalStore.prototype.getNamespacedKey=function(key){if(!this.namespace){return key;}else{return[this.namespace,key].join(this.delimiter);}};InternalStore.prototype.set=function(name,elem){this.inMemoryCache[name]=elem;this.storage.set(this.getNamespacedKey(name),JSON.stringify(elem));};InternalStore.prototype.get=function(name){var obj=null;if(name in this.inMemoryCache){return this.inMemoryCache[name];}
var saved=this.storage.get(this.getNamespacedKey(name));try{if(typeof saved==='undefined'||saved==='undefined'){obj=undefined;}else{obj=JSON.parse(saved);}
this.inMemoryCache[name]=obj;}catch(e){$log.error('Error parsing saved value',e);this.remove(name);}
return obj;};InternalStore.prototype.remove=function(name){this.inMemoryCache[name]=null;this.storage.remove(this.getNamespacedKey(name));};return InternalStore;}]);angular.module('flybaseauth-storage.localStorage',['flybaseauth-storage.cookieStorage']).service('localStorage',["$window","$injector",function($window,$injector){var localStorageAvailable;try{$window.localStorage.setItem('testKey','test');$window.localStorage.removeItem('testKey');localStorageAvailable=true;}catch(e){localStorageAvailable=false;}
if(localStorageAvailable){this.set=function(what,value){return $window.localStorage.setItem(what,value);};this.get=function(what){return $window.localStorage.getItem(what);};this.remove=function(what){return $window.localStorage.removeItem(what);};}else{var cookieStorage=$injector.get('cookieStorage');this.set=cookieStorage.set;this.get=cookieStorage.get;this.remove=cookieStorage.remove;}}]);angular.module('flybaseauth-storage.sessionStorage',['flybaseauth-storage.cookieStorage']).service('sessionStorage',["$window","$injector",function($window,$injector){var sessionStorageAvailable;try{$window.sessionStorage.setItem('testKey','test');$window.sessionStorage.removeItem('testKey');sessionStorageAvailable=true;}catch(e){sessionStorageAvailable=false;}
if(sessionStorageAvailable){this.set=function(what,value){return $window.sessionStorage.setItem(what,value);};this.get=function(what){return $window.sessionStorage.getItem(what);};this.remove=function(what){return $window.sessionStorage.removeItem(what);};}else{var cookieStorage=$injector.get('cookieStorage');this.set=cookieStorage.set;this.get=cookieStorage.get;this.remove=cookieStorage.remove;}}]);angular.module('flybaseauth-storage.store',['flybaseauth-storage.internalStore']).provider('store',function(){var _storage='localStorage';this.setStore=function(storage){if(storage&&angular.isString(storage)){_storage=storage;}};this.$get=["InternalStore",function(InternalStore){var store=new InternalStore(null,_storage);store.getNamespacedStore=function(namespace,storage,key){return new InternalStore(namespace,storage,key);};return store;}];});}}());(function(flybaseauth){if(typeof angular!=='undefined'){angular.module('ngFlybaseauth',[]).provider('flybaseauth',function(){this.$get=function(){return flybaseauth;};this.init=function(services,options){flybaseauth.init(services,options);};});}})(flybaseauth);