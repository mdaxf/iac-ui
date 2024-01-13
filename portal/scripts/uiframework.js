// Copyright 2023 IAC. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and

// limitations under the License.


HTMLElement.prototype.getElementByClassName = function (cls) {
    var list = this.getElementsByClassName(cls);
    if (list.length > 0)
        return list[0];
    return null;
};
HTMLElement.prototype.clearChilds = function () {
    while (this.firstChild)
        this.removeChild(this.firstChild);
};


var IACMessageClient = function (server = ""){

	const HubPath = "/iacmessagebus";
	const HubName = "IACMessageBusHub";
	if (IACMessageBus && IACMessageBus.connection && IACMessageBus.connection._connectionState === "Connected")
		return IACMessageBus;
	
	var _client = this;
	IACMessageBus = _client
	
   
	this.subscribers ={};
	this.CallbackMap = {};
	this.initialized = false;
	this.autoConnect = true;
	this.connection = null;
	this.Queue =[];
	this.disconnectHandlerMap = [];
	this.connectionID = "";
	


	this.Connect = function(){
		_client.connection = new signalR.HubConnectionBuilder()
			.withUrl(_client.serverUrl, {
				withCredentials: false
			})
			.build();
				
		_client.connection.start().then(function () {
			_client.initialized = true;	
			
			_client.connectionID = 	_client.connection.connection.connectionId
	
			for (var idx = 0; idx < _client.Queue.length; idx++)
			{
				var call = _client.Queue[idx];
				call[0].apply(null, call[1]);
			}
			
			var topics = Object.keys(_client.CallbackMap);
			
		//	console.log(topics, _client)
			
			for (var idx = 0; idx < topics.length; idx++)
			{				
				if(_client.CallbackMap.hasOwnProperty(topics[idx]))
					if (_client.CallbackMap[topics[idx]].length > 0)
						_client.connection.on(topics[idx], message => {
						//	console.log("receive message for topic:", topic, message)
							_client.executesubcallback(topics[idx], message);
						});
			}
		});	

		console.log(_client, _client.connection)
		
	}
	
	this.Subscribe = function  (topic, callback) {
		if (!_client.initialized)
		{
			_client.Queue.push([_client.Subscribe, [topic, callback]]);
			return;
		}
		
		
		if (!_client.CallbackMap.hasOwnProperty(topic))
		{
			_client.CallbackMap[topic] = [];
			_client.CallbackMap[topic].push(callback);
			_client.connection.on(topic, message => {
			//	console.log("receive message for topic:", topic, message)
				_client.executesubcallback(topic,message);
			});
			
		}else{			
			_client.CallbackMap[topic].push(callback);
		}		
	}
	
	this.executesubcallback = function(topic,message){
	//	console.log("execute the sub callback: ", topic, message)
		if(!_client.CallbackMap.hasOwnProperty(topic))
			return;
		
		var callbacks = _client.CallbackMap[topic];
		for(var idx =0; idx<callbacks.length ; idx++ ){
		//	console.log("execute: ")
		//	console.log(callbacks[idx], message)			
			callbacks[idx](message)
		}
	}
	
	this.Unsubscribe = function  (topic, callback) {
		if (!_client.initialized)
		{
			_client.Queue.push([_client.Unsubscribe, [topic]]);
			return;
		}		
		
		if (_client.CallbackMap.hasOwnProperty(topic))
		{
			_client.connection.off(topic, callback);
			
			var callbacksString = _client.CallbackMap[topic].map(function (val, idx) {return '' + val;})
			var idx = $.inArray(''+callback, callbacksString);
			if (idx >= 0)
				_client.CallbackMap[topic].splice(idx, 1);
			
			if (_client.CallbackMap[topic].length < 1)
			{
				_client.CallbackMap[topic] = null;
				delete _client.CallbackMap[topic];
				
			}
		}		
	}

	this.Publish = function (topic,message) {
        if(typeof message == "object")
            message = JSON.stringify(message);

		_client.connection.invoke("send", topic,message,_client.connectionID)
		
	}
	
	this.Broadcast = function(message) {
		_client.connection.invoke("broadcast", message,_client.connectionID);
	}
	
	this.Echo = function(message) {
		_client.connection.invoke("echo", message,_client.connectionID);
	}
	
		
	this.AddDisconnectHandler = function (handler){
		_client.disconnectHandlerMap.push(handler); 
	}
	
	this.RemoveDisconnectHandler = function (handler){
		var callbacksString = _client.disconnectHandlerMap.map(function (val, idx) {return '' + val;})
		var idx = $.inArray(''+handler, callbacksString);
		if (idx >= 0)
			_client.disconnectHandlerMap.splice(idx, 1);
	}
	
	this.SetAutoConnect = function (autoConnect) {
		_client.autoConnect = autoConnect;
		if (_client.autoConnect)
			_client.connection.start()
	}
		
	this.Disconnect = function () {
		_client.autoConnect = false;
		_client.connection.stop()
	}
	
	window.addEventListener('beforeunload', _client.Disconnect);

  //  function init() {
        if (server !=""){
            _client.Server  = server;
            _client.serverUrl = _client.Server  + HubPath
            _client.Connect();
        } else{

            UI.ajax.get(UI.CONTROLLER_URL+"/config").then((response) => {
                localStorage.setItem(window.location.origin+"_"+"clientconfig", response);
                var data = JSON.parse(response);
                var server = data.signalrconfig.serverwc;
                _client.Server  = server;
                UI.Log("signalr server:", _client.Server)    
                _client.serverUrl = _client.Server  + HubPath

                _client.Connect();
            }).catch((error) => {
                if (!_client.Server  || _client.Server  =="")
                {
                    let input = window.location.origin;
                    input = input.endsWith('/') ? input.slice(0, -1) :input;
                    _client.Server  = input;

                }

                _client.serverUrl = _client.Server  + HubPath
                _client.Connect();
            })

        }
    
//    }
//    _client.init();
//    _client.connection.start()
}
var IACMessageBus;
var IACMessageBusClient = null;

var UI;
(function (UI) {
 /*
        common UI functions and classes
        Ajax Call
    */
        UI.CONTROLLER_URL = "";
        class Ajax {
            constructor(token) {
              this.token = token;
              if(!token || token == ''){
                let sessionkey= window.location.origin+"_"+ "user";
                var userdata = localStorage.getItem(sessionkey);
                if(userdata){
                    var userjdata = JSON.parse(userdata);
                    this.token = userjdata.token;
                }
              }
            }
          
            initializeRequest(method, url, stream) {
              return new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.open(method, `${url}`, true);
                
                if(this.token && this.token !='')
                    xhr.setRequestHeader('Authorization', `Bearer ${this.token}`);

                if (stream) {
                  xhr.responseType = 'stream';
                }
                xhr.onload = () => {
                  if (xhr.status >= 200 && xhr.status < 300) {
                    resolve(xhr.response);
                  } else {
                    reject(xhr.statusText);
                  }
                };
                xhr.onerror = () => reject(xhr.statusText);
                xhr.onabort = () => reject('abort');
                xhr.send();
              });
            }
          
            getbyurl(url, stream) {
              return this.initializeRequest('GET', url, stream);
            }

            get(url, data, stream= false) {
                return new Promise((resolve, reject) => {
                    const xhr = new XMLHttpRequest();
                    xhr.open('GET', `${url}`, true);                
                
                    if(this.token && this.token !='')
                        xhr.setRequestHeader('Authorization', `Bearer ${this.token}`);

                    if (stream) {
                      xhr.responseType = 'stream';
                    }
                    xhr.onload = () => {
                      if (xhr.status >= 200 && xhr.status < 300) {
                        resolve(xhr.response);
                      } else {
                        reject(xhr.statusText);
                      }
                    };
                    xhr.onerror = () => reject(xhr.statusText);
                    xhr.onabort = () => reject('abort');
                    xhr.send(JSON.stringify(data));
                  });
            }
          
            post(url, data) {
              return new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.open('POST', `${url}`, true);
            
                if(this.token && this.token !='')
                    xhr.setRequestHeader('Authorization', `Bearer ${this.token}`);

                xhr.setRequestHeader('Content-Type', 'application/json');
                xhr.onload = () => {
                  if (xhr.status >= 200 && xhr.status < 300) {
                    resolve(xhr.response);
                  } else {
                    reject(xhr.statusText);
                  }
                };
                xhr.onerror = () => reject(xhr.statusText);
                xhr.onabort = () => reject('abort');
                xhr.send(JSON.stringify(data));
              });
            }
          
            delete(url) {
              return this.initializeRequest('DELETE', url);
            }
          }
        UI.Ajax = Ajax; 
        UI.ajax = new Ajax("");  
        
        function GetbyUrl(url, success, fail){
            UI.ajax = new Ajax("");             
            return UI.ajax.initializeRequest('GET', url).then((response) => {
                if(success)
                    success(response);
            }).catch((error) => {
                UI.ShowError(error);
                if(fail)
                    fail(error);                   
            });
        }
        function GetbyData(url, data, success, fail){
            UI.ajax = new Ajax(""); 
            return UI.ajax.get(url, data).then((response) => {
                if(success)
                    success(response);
            }).catch((error) => {
                UI.ShowError(error);
                if(fail)
                    fail(error);
            });
        }

        function Post(url, data, success, fail){
            UI.ajax = new Ajax(""); 
            return UI.ajax.post(url, data).then((response) => {
                if(success)
                    success(response);
            }).catch((error) => {
                UI.ShowError(error);
                if(fail)
                    fail(error);
            })
        }

        function CallTranCode(Code, Version, inputs, success, fail){
            UI.ajax = new Ajax(""); 
            let url = UI.CONTROLLER_URL+"/trancode/execute";
            let Data = {"code":Code, "version":Version, "inputs":inputs};
            return UI.ajax.post(url, Data).then((response) => {
                if(success){
                    success(response);
                }
            }).catch((error) => {
                UI.ShowError(error);
                if(fail)
                    fail(error);
            })
        }
        UI.Get = GetbyUrl;
        UI.GetbyUrl = GetbyUrl;
        UI.GetbyData = GetbyData;
        UI.Post = Post;
        UI.CallTranCode = CallTranCode;

})(UI || (UI = {}));

(function (UI) {

    class UserLogin{
        constructor(){
            this.userID = 0;
            this.username = "";
            this.password = "";
            this.token = "";
            this.islogin = false;
            this.clientid = "";
            this.createdon = "";
            this.expirateon = "";
            this.tokenchecktime = 1000*10*1;
            this.language = "en";
            this.timezone = "";
            this.logonpage = "Logon page";
            this.tokenupdatetimer = null;
            this.updatedon = null;
            this.sessionkey= window.location.origin+"_"+ "user";
            this.loginurl = "login.html"
            this.heartbittimer = null;
        }
        checkiflogin(success, fail){
            let userdata = localStorage.getItem(this.sessionkey);
        //    // UI.Log(userdata)
            if(userdata){
                let userjdata = JSON.parse(userdata);
                this.userID = userjdata.ID;
                this.username = userjdata.username;
                this.password = userjdata.password;
                this.token = userjdata.token;
                this.islogin = userjdata.islogin;
                this.clientid = userjdata.clientid;
                this.createdon = userjdata.createdon;
                this.expirateon = userjdata.expirateon;               
                this.updatedon = userjdata.updatedon;
                this.updatedon = new Date(this.updatedon);
                this.language = userjdata.language;
                this.timezone = userjdata.timezone;
                let checkedtime = new Date(this.updatedon.getTime() + this.tokenchecktime);
                if(checkedtime > new Date()){
                    if(success){
                        success();
                    }
                    return true;
                }

                let parsedDate = new Date(this.expirateon);
            /*    let server  ="";
                let localconfig = localStorage.getItem(window.location.origin+"_"+"clientconfig");
                if(localconfig){
                    let config = JSON.parse(localconfig);
                    if(config.hasOwnProperty("signalrconfig")){
                        let signalrconfig = config.signalrconfig;
                        if(signalrconfig.hasOwnProperty("serverwc")){
                            server = signalrconfig.serverwc;
                        }
                    }
                }


                if (!IACMessageBusClient)
                    IACMessageBusClient = new IACMessageClient(server); */

            //    UI.Log(this.token, parsedDate, new Date(), (parsedDate > new Date()))
                var currentDate = new Date();

           // Add 10 minutes to the current date and time
                var tenMinutesLater = new Date(currentDate.getTime() + 10 * 60000); 

                if(parsedDate < tenMinutesLater && parsedDate > new Date()){
                 //   UI.Log("renew")
                    UI.ajax.post(UI.CONTROLLER_URL+"/user/login", {"username":this.username, "password":this.password, "token":this.token, "clientid": this.clientid, "renew": true}).then((response) => {
                        userjdata = JSON.parse(response);
                        this.userID = userjdata.ID;
                        this.username = userjdata.username;
                        this.password = userjdata.password;
                        this.token = userjdata.token;
                        this.islogin = userjdata.islogin;
                        this.clientid = userjdata.clientid;
                        this.createdon = userjdata.createdon;
                        this.expirateon = userjdata.expirateon;
                        this.language = userjdata.language;
                        this.timezone = userjdata.timezone;
                        userjdata.updatedon = new Date();

                    //    UI.Log(userjdata)
                        localStorage.setItem(this.sessionkey, JSON.stringify(userjdata));
                        
                    //    if(UI.Notifications.getData().data.length == 0)
                    //        this.getNotification();

                        if(success){
                            success();                        
                        }
                        return true;
    
                    }).catch((error) => {
                        UI.ShowError(error);
                        if(fail)
                            fail();
                            return false;
                    })
                }
                else if(parsedDate < new Date()){
                    UI.ShowError("User token expired, please login again.");
                    if(fail) 
                        fail();
                }else{
                    if(success){
                        success();                        
                    }
                    return true; 
                }
                    
            }
            return ;
        }
        async getNotification(){
            UI.GetbyUrl(UI.CONTROLLER_URL+"/notification/get", function(response){
                let jdata = (JSON.parse(response)).data;
                UI.Log("get notifications:", jdata)
                if(!(!jdata || jdata == null || jdata == undefined)){
                
                let keylist =[];
                let notificationlist = [];

                if(jdata.length > 0){
                    for(var i=0;i<jdata.length;i++){
                        let item = jdata[i];
                        UI.Log("get notification:", item)
                        if(item.hasOwnProperty("uuid")){
                            keylist.push(item.uuid);
                            notificationlist.push(item);
                        }else{
                            let uuid = UI.generateUUID();
                            item.uuid = uuid;
                            keylist.push(uuid);
                            notificationlist.push(item);
                        }
                    }
                    UI.Log("get notifications by list:", keylist, notificationlist)
                    UI.Notifications.setItemsbyArray(keylist, notificationlist);
                }
                }
            }, function(error){
                UI.ShowError(error);
            })
            // subscribe the notification
            if (!IACMessageBusClient){
                let server  ="";
                let localconfig = localStorage.getItem(window.location.origin+"_"+"clientconfig");
                if(localconfig){
                    let config = JSON.parse(localconfig);
                    if(config.hasOwnProperty("signalrconfig")){
                        let signalrconfig = config.signalrconfig;
                        if(signalrconfig.hasOwnProperty("server")){
                            server = signalrconfig.server;
                        }
                    }
                }
                IACMessageBusClient = new IACMessageClient(server);
            
            }
            IACMessageBusClient.Subscribe("IAC_SYSTEM_NOTIICATION_REPLY", function(message){
                let jdata = JSON.parse(message);
                UI.Log(jdata)
                if(jdata.hasOwnProperty("receipts")){
                    receipts = jdata.receipts;
                    if(! receipts.hasOwnProperty("all") && !receipts.hasOwnProperty(UI.login.username))
                        return;
                }

                let uuid = jdata.data.uuid;
                let comments = jdata.comments;
                let notification = UI.Notifications.getData().data[uuid];
                let updatedon = jdata.updatedon;
                let updatedby = jdata.replyer;

                let history ={
                    "updatedon": updatedon,
                    "updatedby": updatedby,
                    "status": 1,
                    "comments": comments
                }        
                                
                let historyul = document.getElementById("iac-ui-notification-history-ul-"+uuid);
             //   UI.Log(history, historyul, notification)    
                let chatlist = document.getElementById("iac-ui-chat-container-list-" + uuid);

                let histories = notification.histories;
                histories.push(history);
                notification.histories = histories;    
                UI.Notifications.setItem(uuid, notification);
            //    UI.Log(history, notification,historyul, chatlist)  
            //    UI.Log(histories)
                if(historyul != null && historyul != undefined && historyul != ""){
                    Session.CurrentPage.pageheader.addNotificationHistoryItem(history, historyul, notification);
                }
                else if(chatlist){
                    Session.CurrentPage.pageheader.addchatitem(history, chatlist);
                    chatlist.scrollTop = chatlist.scrollHeight;
                }

                if(notification.status < 4){
                    if(updatedby != UI.login.username){
                        let notificationBadge = document.getElementById("iac-ui-header-notification-count")
                        let count  = notificationBadge.getAttribute("data-count")
                        
                        if(count == null || count == undefined || count == "")
                            count = 0;
                        else 
                            count = parseInt(count);

                        count = count +1;

                        if(count > 0){
                            notificationBadge.setAttribute("data-count", count);
                            notificationBadge.innerText = count;
                            notificationBadge.style.display = "block";
                        }else{
                            notificationBadge.setAttribute("data-count", "0");
                            notificationBadge.innerText = "0";
                            notificationBadge.style.display = "none";
                        }
                    }
                }
                
            })
            IACMessageBusClient.Subscribe("IAC_SYSTEM_NOTIICATION_CLOSE", function(message){
                let jdata = JSON.parse(message);
                let uuid = jdata.uuid;
                let notification = UI.Notifications.getItem(uuid);
                if(notification.status == 1 && notification.sender != UI.login.username)
                {
                    let notificationBadge = document.getElementById("iac-ui-header-notification-count")
                    let count  = notificationBadge.getAttribute("data-count")
                    
                    if(count == null || count == undefined || count == "")
                        count = 0;
                    else 
                        count = parseInt(count);

                    count = count -1;

                    if(count > 0){
                        notificationBadge.setAttribute("data-count", count);
                        notificationBadge.innerText = count;
                        notificationBadge.style.display = "block";
                    }else{
                        notificationBadge.setAttribute("data-count", "0");
                        notificationBadge.innerText = "0";
                        notificationBadge.style.display = "none";
                    }
                }
                if($('.iac-ui-notification-container[datakey="'+uuid+'"]').length > 0)
                    $('.iac-ui-notification-container[datakey="'+uuid+'"]').remove();
                
                UI.Notifications.removeItem(uuid);

            })
            IACMessageBusClient.Subscribe("IAC_SYSTEM_NOTIICATION", function(message){
                UI.Log("receive notification:", message)
                let jdata = JSON.parse(message).data;

                if(jdata.hasOwnProperty("receipts")){
                    receipts = jdata.receipts;
                    if(! receipts.hasOwnProperty("all") && !receipts.hasOwnProperty(UI.login.username))
                        return;
                }

                let notificationBadge = document.getElementById("iac-ui-header-notification-count")
                let count  = notificationBadge.getAttribute("data-count")
                
                if(count == null || count == undefined || count == "")
                    count = 0;
                else 
                    count = parseInt(count);

                count = count + 1;

                notificationBadge.setAttribute("data-count", count);
                notificationBadge.innerText = count;
                notificationBadge.style.display = "block";

                let keylist =[];
                let notificationlist = [];
                if(!jdata.hasOwnProperty("uuid")){
                    let uuid = UI.generateUUID();
                    jdata.uuid = uuid;
                    keylist.push(uuid);
                    notificationlist.push(jdata)                            
                }else
                {
                    keylist.push(jdata.uuid);
                    notificationlist.push(jdata);
                }
                UI.Notifications.setItemsbyArray(keylist, notificationlist);
                if($('#iac-ui-notification-container').length > 0){
                    UI.Log("update the notification list") 
                    let list = document.getElementById('iac-ui-notification-list')
                    //Session.CurrentPage.pageheader.notificatonsRender(document.getElementById('iac-ui-notification-container'))
                    Session.CurrentPage.pageheader.addNotification(jdata, list);
                }
            })
        }
        async login(username, password, success, fail){
            
            let userdata = sessionStorage.getItem(this.sessionkey);
       //     // UI.Log(userdata)
            if(userdata){
                
                let userjdata = JSON.parse(userdata);
                this.userID = userjdata.ID;
                this.username = userjdata.username;
                this.password = userjdata.password;
                this.token = userjdata.token;
                this.islogin = userjdata.islogin;
                this.clientid = userjdata.clientid;
                this.createdon = userjdata.createdon;
                this.expirateon = userjdata.expirateon; 
                this.language = userjdata.language;
                this.timezone = userjdata.timezone;
            }
            

            if(this.username == username && this.islogin){

                UI.ajax.post(UI.CONTROLLER_URL+"/user/login", {"username":username, "password":password, "token":this.token, "clientid": this.clientid, "renew": true}).then((response) => {
                    userjdata = JSON.parse(response);
                    this.userID = userjdata.ID;
                    this.username = userjdata.username;
                    this.password = userjdata.password;
                    this.token = userjdata.token;
                    this.islogin = userjdata.islogin;
                    this.clientid = userjdata.clientid;
                    this.createdon = userjdata.createdon;
                    this.expirateon = userjdata.expirateon;
                    this.language = userjdata.language;
                    this.timezone = userjdata.timezone;
                    userjdata.updatedon = new Date();

                    localStorage.setItem(this.sessionkey, JSON.stringify(userjdata));
                    
                    UI.ajax.get(UI.CONTROLLER_URL+"/config").then((response) => {
                        localStorage.setItem(window.location.origin+"_"+"clientconfig", response);
                    }).catch((error) => {
                        UI.ShowError(error);
                    })

                    this.tokenupdatetimer = window.setTimeout(this.tokencheck, this.tokenchecktime);

                    if(success){
                        success();
                    }   

                }).catch((error) => {
                    UI.ShowError(error);
                    this.tokenupdatetimer = null
                    if(fail)
                        fail();
                })
            }
            else{
                

                if(this.clientid == ""){
                    this.clientid = UI.generateUUID();
                }
                // UI.Log(this.clientid,username,password)
                UI.ajax.post(UI.CONTROLLER_URL+"/user/login", {"username":username, "password":password, "token":this.token, "clientid": this.clientid, "renew": false}).then((response) => {
                    let userjdata = JSON.parse(response);
                    this.userID = userjdata.ID;
                    this.username = userjdata.username;
                    this.password = userjdata.password;
                    this.token = userjdata.token;
                    this.islogin = userjdata.islogin;
                    this.clientid = userjdata.clientid;
                    this.createdon = userjdata.createdon;
                    this.expirateon = userjdata.expirateon;
                    this.language = userjdata.language;
                    this.timezone = userjdata.timezone;
                    userjdata.updatedon = new Date();

                    localStorage.setItem(this.sessionkey, JSON.stringify(userjdata));
                    
                    UI.ajax.get(UI.CONTROLLER_URL+"/config").then((response) => {
                        localStorage.setItem(window.location.origin+"_"+"clientconfig", response);
                    }).catch((error) => {
                        UI.ShowError(error);
                    })

                    this.tokenupdatetimer = window.setTimeout(this.tokencheck, this.tokenchecktime);

                    if(success){
                        success();
                    }                

                }).catch((error) => {
                    UI.ShowError(error);
                    this.tokenupdatetimer = null
                    if(fail)
                        fail();
                })
            }
        }
        logout(success, fail){
            let userdata = localStorage.getItem(this.sessionkey);
            this.tokenupdatetimer = null;

            if(userdata){
                let userjdata = JSON.parse(userdata);
         //       // UI.Log(userjdata)
                let username = userjdata.username;
                let token = userjdata.token;
                let clientid = userjdata.clientid;

                UI.ajax.post(UI.CONTROLLER_URL+"/user/logout", {"username":username, "token":token, "clientid": clientid}).then((response) => {
                    localStorage.removeItem(this.sessionkey);
                    this.userID = 0;
                    this.username = "";
                    this.password = "";
                    this.token = "";
                    this.language = "en";
                    this.timezone = "";
                    this.islogin = false;

                    if(success){
                        success();
                    } 
                
                }).catch((error) => {
                    UI.ShowError(error);
                    if(fail)
                        fail();
                })
            }
            localStorage.removeItem(this.sessionkey);
            this.username = "";
            this.userID = 0;
            this.password = "";
            this.token = "";
            this.islogin = false;
            this.language = "en";
            this.timezone = "";
            window.clearTimeout(this.tokenupdatetimer);
            window.location.href = this.loginurl;
            localStorage.removeItem(window.location.origin+"_"+"clientconfig");
        }
    }
    UI.UserLogin = UserLogin;
    UI.userlogin = new UserLogin();

    function tokencheck(){
        UI.userlogin.checkiflogin(function(){
            UI.Log("token updated success:", UI.userlogin.username);
            UI.userlogin.tokenupdatetimer = window.setTimeout(tokencheck, UI.userlogin.tokenchecktime);
        }, function(){
            UI.ShowError("token updated fail:", UI.userlogin.username);
            // UI.Log("token updated fail:", UI.userlogin.username);
            // UI.Log(UI.Page);
            if(UI.Page)
                window.location.href = UI.userlogin.loginurl;
             //   new UI.Page({file:'pages/logon.json'});
            
        })  
    }

    UI.tokencheck = tokencheck;
    


    async function getclientconfig(){
        let clientconfig = localStorage.getItem(window.location.origin+"_"+"clientconfig");
        if(clientconfig){
            return JSON.parse(clientconfig);
        }else{
            await UI.ajax.get(UI.CONTROLLER_URL+"/config").then((response) => {
                localStorage.setItem(window.location.origin+"_"+"clientconfig", response);
                return JSON.parse(response);
            }).catch((error) => {
                UI.ShowError(error);
                return null;
            })
        }
        return null;
    }
    UI.getclientconfig = getclientconfig;
})(UI || (UI = {}));

(function (UI) {
    class HomeMenu{
        constructor(){
            this.sessionmenuprefix= window.location.origin+"_"+ "menu_";
        }
        loadMenus(parentID,Success, Fail){
            let userdata = localStorage.getItem(UI.userlogin.sessionkey);
        //    UI.Log("load the menu for the user:",userdata)
            let userID = 0;
            if(userdata){
                
                let userjdata = JSON.parse(userdata);
                userID = userjdata.id;
            }
            let devicetype = this.isMobile()? "1":"0";
            let menudata = localStorage.getItem(this.sessionmenuprefix+userID+ "_"+devicetype+"_"+parentID);
        //    UI.Log("load the menu for the user from cache:",menudata, this.sessionmenuprefix+userID+ "_"+devicetype+"_"+parentID)
            if(menudata){
                let menus = JSON.parse(menudata)["menus"];
            //    UI.Log("load the menu for the user from cache success:",menus)
                if(Success)
                    Success(menus);
                return;
            }

        
            
            if(userdata){                
               
                let isMobile = this.isMobile()? "1":"0";
                localStorage.removeItem(this.sessionmenuprefix+userID+ "_"+devicetype+"_"+parentID)
                let ajax = new UI.Ajax("");
                ajax.get(UI.CONTROLLER_URL+"/user/menus?userid="+userID +"&mobile="+isMobile + "&parentid="+parentID).then((response) => {
                    let menus = JSON.parse(response);
                    let data = {
                        menus:menus,
                        createdon: new Date()
                    }
                    localStorage.setItem(this.sessionmenuprefix+userID+ "_"+devicetype+"_"+parentID, JSON.stringify(data));
                    if(Success)
                        Success(menus);
                }).catch((error) => {
                    
                    UI.ShowError(error);
                    if(Fail)
                        Fail();
                })
            }else{
                localStorage.clear();
                window.location.href = UI.userlogin.loginurl;
            }

        }
        isMobile(){
            var userAgent = navigator.userAgent;
            var isMobile = /Mobi|Android/i.test(userAgent);
            return isMobile;
        }
    }

    UI.HomeMenu = new HomeMenu();
})(UI || (UI = {})); 

(function (UI) {    
    function generateUUID(){
        var d = new Date().getTime();
        var uuid = 'xxxxxxxx_xxxx_4xxx_yxxx_xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = (d + Math.random()*16)%16 | 0;
            d = Math.floor(d/16);
            return (c=='x' ? r : (r&0x3|0x8)).toString(16);
        });
        return uuid;    
    }
    UI.generateUUID = generateUUID;

    function isScriptLoaded(scriptSrc) {
        let arr = Array.from(document.getElementsByTagName('script'))
        // UI.Log(scriptSrc, arr);
        for(var i=0;i<arr.length;i++)
        {
            let script = arr[i];
           
            if(script.src == null || script.src == undefined || script.src=="")
            {
                continue;
            }else{

                let src = script.src.toLowerCase();
                let checkedsrc = scriptSrc.toLowerCase();
                let check = src.indexOf(checkedsrc) != -1 || checkedsrc.indexOf(src) != -1;

                // UI.Log(src, checkedsrc, check);

                if (check)
                    return true;
            }
        };
        return false;
        //return Array.from(document.getElementsByTagName('script'))
        //  .some(script => (script.src.toLowerCase().indexOf(scriptSrc.toLowerCase()) !=-1 || scriptSrc.toLowerCase().indexOf(script.src.toLowerCase()) !=-1) );
    }
    UI.isScriptLoaded = isScriptLoaded;
    function isStyleLoaded(styleSrc) {
        return Array.from(document.getElementsByTagName('link'))
            .some(link => link.href.toLowerCase().indexOf(styleSrc.toLowerCase()) !== -1);
    }
    UI.isStyleLoaded = isStyleLoaded;
    function safeName(name){
        return name.replace(/[^a-zA-Z0-9]/g, "_");
    }
    UI.safeName = safeName;
    function safeId(id){
        return id.replace(/[^a-zA-Z0-9]/g, "_");
    }   
    UI.safeId = safeId; 
    function safeClass(className){
        return className.replace(/[^a-zA-Z0-9]/g, "_");
    }   
    UI.safeClass = safeClass;
    function replaceAll(target, search, replacement) {
        return target.replace(new RegExp(search, "g"), replacement);
    }
    UI.replaceAll = replaceAll;
    function createFragment(html) {
        return generateFragment(html);
    }
    function generateFragment(html) {
    //    UI.Log('createFragment:', html);
        if (html == null)
            html = "";
       let range = document.createRange();
    //    UI.Log('createRange:', range)
        if (range.createContextualFragment) {
            try {
                let fragment = range.createContextualFragment(html);
        //        UI.Log('created Fragment by range:', fragment)
                return fragment;
            }
            catch (e) {
                // createContextualFragment is not supported on Safari (ios)
                UI.ShowError(e);
            }
        } 
        let div = document.createElement("div");
        div.innerHTML = html;
        let inlineScripts = parseInlineScripts(div);
        if (inlineScripts.length > 0) {
            let inlineScriptsEl = document.createElement("script");
            inlineScriptsEl.type = "text/javascript";
            inlineScriptsEl.textContent = inlineScripts.join("; ");
            document.body.appendChild(inlineScriptsEl);
        }
        let fragment = document.createDocumentFragment(), child;
        while ((child = div.firstChild)) {
            fragment.appendChild(child);
        }
    //    UI.Log('created Fragment:', fragment)
        return fragment;
    }
    UI.createFragment = createFragment;
    async function translate(division){
        let fragment = division;
        let elements = fragment.querySelectorAll("[lngcode]");
        lngcodes= [];
        texts = [];

        for (let i = 0; i < elements.length; i++) {
            let el = elements[i];
            
            let key = el.getAttribute("lngcode");
            if(key != null && key != undefined && key != ""){
                lngcodes.push(key);
                if(el.innerText != null && el.innerText != undefined && el.innerText != "")
                    texts.push(el.innerText);
                else if(el.getAttribute("placeholder") !="" && el.getAttribute("placeholder") != null && el.getAttribute("placeholder") != undefined)
                    texts.push(el.getAttribute("placeholder"));
                else if(el.getAttribute("title") !="" && el.getAttribute("title") != null && el.getAttribute("title") != undefined)
                    texts.push(el.getAttribute("title"));
                else
                    texts.push("");
            }
        }
        let cachedata = UI.Languages.getItems(lngcodes);
        let uncachedcodes = [];
        let uncachedtexts = [];
        for(var i=0;i<lngcodes.length;i++){
            if(!cachedata.hasOwnProperty(lngcodes[i])){
                uncachedcodes.push(lngcodes[i]);
                uncachedtexts.push(texts[i]);
            }
        }

   //     UI.Log("translation:", lngcodes, texts, cachedata, uncachedcodes, uncachedtexts)
        if(uncachedcodes.length > 0){
            let inputs = {
                "lngcodes": uncachedcodes,
                "texts": uncachedtexts,
                "language": UI.userlogin.language
            }
        //    UI.Log("translation inputs:", inputs)
            await UI.Post(UI.CONTROLLER_URL+"/language/translate", inputs, function(response){
                let jdata = JSON.parse(response);
                let data = jdata.data
            //    UI.Log("translation response:", data)
                let keyList = [], valueList = [];
                for(var i=0;i<data.length;i++){
                    keyList.push(data[i].lngcode);
                    valueList.push(data[i].text);
                }
                UI.Languages.setItemsbyArray(keyList, valueList);


                
                for (let i = 0; i < data.length; i++) {
                 //   UI.Log("translation response:", data[i])
                    let lngcode = data[i].lngcode;
                    let text = data[i].text;
                //    let short = data[i].short;
                    let elements = fragment.querySelectorAll("[lngcode='"+lngcode+"']");
                //    UI.Log("translation elements:", elements)
                    for (let j = 0; j < elements.length; j++) {
                        let el = elements[j];
                        
                        if(el.getAttribute("placeholder") !="" && el.getAttribute("placeholder") != null && el.getAttribute("placeholder") != undefined)
                            el.setAttribute("placeholder", text);
                        else if(el.getAttribute("title") !="" && el.getAttribute("title") != null && el.getAttribute("title") != undefined)
                            el.setAttribute("title", text);
                        else
                            el.innerText = text;

                        el.setAttribute("translated", "true");
                    //    el.setAttribute("title", short);
                    }
                }

                let itemsnotran = uncachedcodes.filter(item => !keyList.includes(item));
                let defaultnotran =[];
                for(var i=0;i<itemsnotran.length;i++){
                    let index = uncachedcodes.indexOf(itemsnotran[i]);
                    defaultnotran.push(uncachedtexts[index]);
                }
                if(defaultnotran.length > 0){
                    UI.Languages.setItemsbyArrayifnotexist(itemsnotran, defaultnotran);
                }   

            }, function(error){
                UI.ShowError(error);
            })
        }
        
        for(key in cachedata){

            let elements = fragment.querySelectorAll("[lngcode='"+key+"']");
            for (let j = 0; j < elements.length; j++) {
                let el = elements[j];
                el.innerText = cachedata[key];
                el.setAttribute("translated", "true");
            }
        }
        
        return fragment; 
    }
    UI.translate = translate;
    async function translatebycodes(codes, success, fail){

        let cachedata = UI.Languages.getItems(codes);
        let uncached = [];
        for(var i=0;i<codes.length;i++){
            if(!cachedata.hasOwnProperty(codes[i])){
                uncached.push(codes[i]);
            }
        }
        let skipped = UI.skippedLngcodes.getItems(uncached);
        for(var i=0;i<uncached.length;i++){
            if(skipped.hasOwnProperty(uncached[i])){
                uncached.splice(i, 1);
                i--;
            }
        }

        let inputs = {
            "lngcodes": uncached,
            "texts": uncached,
            "language": UI.userlogin.language
        }
    //    UI.Log("translation inputs:", inputs)
        if(uncached.length > 0)
            await UI.Post(UI.CONTROLLER_URL+"/language/translate", inputs, function(response){
                let jdata = JSON.parse(response);
                let data = jdata.data
                let keyList = [], valueList = [];
                for(var i=0;i<data.length;i++){
                    keyList.push(data[i].lngcode);
                    valueList.push(data[i].text);
                }
                UI.Languages.setItemsbyArray(keyList, valueList);
                for(var i=0;i<data.length;i++){
                    cachedata[data[i].lngcode] = data[i].text;
                }
                
                if(success)
                    success(cachedata);
                
                let itemsnotran = uncached.filter(item => !keyList.includes(item));                
                
                if(itemsnotran.length > 0){
                    UI.skippedLngcodes.setItemsbyArrayifnotexist(itemsnotran, itemsnotran);
                }  
                
                return cachedata;
            }, function(error){
                if(success)
                    success(cachedata);
                UI.ShowError(error);
                if(fail)
                    fail(error);
            })
        else{
            if(success)
                success(cachedata);
            return cachedata;
        }
    }
    UI.translatebycodes = translatebycodes
})(UI || (UI = {}));

(function (UI) {
    class UILocalStorage{
        constructor(type){
            this.type = type;
            this.sessionkey= window.location.origin+"_"+ type;            
            this.initialize();
        }

        initialize(){
            localStorage.removeItem(this.sessionkey);
            let jdata = {};
            jdata.createdon = new Date();
            jdata.data = {};
            jdata.language = UI.userlogin.language;
            jdata.user = UI.userlogin.username;
            localStorage.setItem(this.sessionkey, JSON.stringify(jdata));
        }

        validatelanguage(){
            let localdata = localStorage.getItem(this.sessionkey);
            if(localdata){
                let jdata = JSON.parse(localdata);
                if(jdata.hasOwnProperty("language") && jdata.language != UI.userlogin.language){
                    this.initialize();
                }
            }else
                this.initialize();
        }

        validate(code){
            let localdata = localStorage.getItem(this.sessionkey);
            if(localdata){
                let jdata = JSON.parse(localdata);
                if(jdata.hasOwnProperty(code) && jdata[user] != UI.userlogin.username){
                    this.initialize();
                }
            }else
                this.initialize();
        }
        getData(){
            let localdata = localStorage.getItem(this.sessionkey);
            if(localdata){
                let jdata = JSON.parse(localdata);
                return jdata
            }
            else{
                this.initialize(); 
                return {
                    createdon: new Date(),
                    language: UI.userlogin.language,
                    user: UI.userlogin.username,
                    data: {}
                };
            }
        }
        removeItem(key){
            let data = this.getData();
            if(data){
                let jdata = data.data                
                if(jdata.hasOwnProperty(key)){
                    delete jdata[key];
                }
                return true;
            }
            return false;
        }
        getItems(keys){
            let data = this.getData();
            if(data){
                let jdata = data.data
                let result = {};
                for(var i=0;i<keys.length;i++){
                    if(jdata.hasOwnProperty(keys[i]))
                        result[keys[i]] = jdata[keys[i]];
                }
                return result;
            }
            return {};
        }
        
        setItems(items){
            let result = this.getData();
            if(!result){
                this.initialize();
                result = this.getData();
            }
            let jdata = result.data;
            for(var key in items){
                    jdata[key] = items[key];
            }
            result.data = jdata;
            localStorage.setItem(this.sessionkey, JSON.stringify(result));
        }
        getItem(key){
            let jdata = this.getData();
            if(jdata){
                let result = {};               
                if(jdata.hasOwnProperty(key))
                    result[key] = jdata[key];
                return result;
            }
            return {};
        }
        setItemsbyArray(keyList, valueList){            
            let jdata = this.getData();
            let data = jdata.data;
            for(var i=0;i<keyList.length;i++){
                data[keyList[i]] = valueList[i];
            }
            jdata.data = data;
            localStorage.setItem(this.sessionkey, JSON.stringify(jdata));
        }
        setItemsbyArrayifnotexist(keyList, valueList){
            let jdata = this.getData();
            let data = jdata.data;
            for(var i=0;i<keyList.length;i++){
                if(!data.hasOwnProperty(keyList[i]))
                    data[keyList[i]] = valueList[i];
            }
            jdata.data = data;
            localStorage.setItem(this.sessionkey, JSON.stringify(jdata));
        }
        setItem(key, value){
            let jdata = this.getData();
            let data = jdata.data;
            if(data){                
                data[key] = value;
                jdata.data = data;
                localStorage.setItem(this.sessionkey, JSON.stringify(jdata));
            }
        }
    }
    if(!UI.Languages)
        UI.Languages = new UILocalStorage("lngcodes");
    else 
        UI.Languages.validatelanguage();

    if(!UI.skippedLngcodes)
        UI.skippedLngcodes = new UILocalStorage("skippedlngcodes");
    else
        UI.skippedLngcodes.validatelanguage();

    if(!UI.Notifications)
        UI.Notifications = new UILocalStorage("notifications");
    else
        UI.Notifications.validate("notifications");

    class UIMessage{
        constructor(message, type="Error"){
            this.message = message;
            this.timer = null;
            this.className = "ui-errormessage-summary";
            if(type == "Warning")
                this.className = "ui-warningmessage-summary";
            else if(type == "Success")
                this.className = "ui-successmessage-summary";
            else if(type == "Info")
                this.className = "ui-infomessage-summary";

            this.show();
            this.clear = this.clear.bind(this);
            UI.messageItems.push(this);
        }

        show(){
            let attrs ={}
            let messageSection = document.getElementsByClassName("ui-message-summary");  
            if(messageSection.length == 0){
                attrs = {
                    "class": "ui-message-summary",
                }
                messageSection = (new UI.FormControl(document.body,"div", attrs)).control;
            }else{
                messageSection = messageSection[0];
            }
            let messageEl = document.getElementsByClassName(this.className);         
            
            if(messageEl.length == 0){
                attrs ={
                    "class": this.className,
                }
                messageEl = (new UI.FormControl(messageSection,"div", attrs)).control;
            }else{
                messageEl = messageEl[0];
            }
            let event = {
                "click": this.clear
            }
            attrs ={
                "class": "ui-message-item",
                innerHTML: this.message
            }        
            this.control = (new UI.FormControl(messageEl,"div", attrs, event)).control;
            messageEl.style.display = "block";   
            this.timer = window.setTimeout(this.clear, 60000);
        }
        clear=()=>{
            for(var i=0;i<UI.messageItems.length;i++){
                if(UI.messageItems[i] == this){
                    UI.messageItems.splice(i,1);
                    break;
                }
            }
            this.control.remove();
            clearTimeout(this.timer)
            let messageEl = document.getElementsByClassName(this.className);
            if(messageEl.length > 0){
                messageEl = messageEl[0];
                if(messageEl.children.length == 0)
                    messageEl.style.display = "none";
            }
        }

    }
    UI.UIMessage = UIMessage;

    function ShowError(error) {
        UI.Log(error);
        new UI.UIMessage(error, 'Error');       
    }

    function ClearAllMessages(){
        UI.messageItems.forEach(item => {
            item.clear();
        });

        let messageEl = document.getElementsByClassName("ui-message-summary");         
        if(messageEl.length > 0){
            messageEl.innerHTML = "";
            messageEl.style.display = "none";
        }
    }
    UI.ShowError = ShowError;
    UI.ClearAllMessages = ClearAllMessages;
    UI.messageItems = []

    function ShowMessage(message, type) {
        new UI.UIMessage(message, type);
    }
    UI.ShowMessage = ShowMessage;

    function Log(...args){
        console.log(...args);
    }
    UI.Log = Log;

})(UI || (UI = {}));

(function (UI){
    class UISession{
        constructor(configurator){
            let defaultconfig = {
                "name": "ui-root",
                "level": 0
            }
            this.configurator = this.configurator || defaultconfig;

            this.stack = [];
            this.snapshoot ={
                "stack":[],
                "configurator":this.configurator,
                "sessionData":{},
                "immediateData":{}
            };
            this._item = {};
            this._inputs = {};
            this._outputs = {};
            this.model = {};
            this.children = [];
            this.views = {};
            this.panels={};
            this.pages={};
            this.viewResponsitory = {};
            this.pageResponsitory = {};
            this.fileResponsitory = {};
        }
        createStackItem(instance) {
            return {
                sessionData: Session.cloneObject(this.snapshoot.sessionData),
                inputs: Session.cloneObject(this._inputs),
                outputs: Session.cloneObject(this._outputs),
                children: Session.cloneObject(this.children),
                views: Session.cloneObject(this.views),
                panels: Session.cloneObject(this.panels),
                pages: Session.cloneObject(this.pages),
            //    viewResponsitory: Session.cloneObject(this.viewResponsitory),
            //    pageResponsitory: Session.cloneObject(this.pageResponsitory),
            //    fileResponsitory: Session.cloneObject(this.fileResponsitory),
                configuration: Session.cloneObject(this.configurator),
                CurrentPage: Session.cloneObject(this.CurrentPage),
                Instance: instance,
                model: this.model
            };
        }
        popFromStack(sliceIdx) {
            let item = null;
            if (typeof (sliceIdx) !== "undefined") {
                item = this.stack[sliceIdx];
                this.stack = this.stack.slice(0, sliceIdx);
            }
            else if(this.stack.length > 0){
                item = this.stack[this.stack.length - 1]
                this.stack.pop();
                
            }
            this._item = this.stack.length > 0 ? this.stack[this.stack.length - 1] : null;
           /* if (this._item) {
                delete this._item.panelViews[UI.Layout.POPUP_PANEL_ID];
                this.model = this._item.model;
            }
            else {
                this.model = null;
            } */
        //    // UI.Log(item, this.stack, this._item)
            if (item != null)
                this.snapshoot.sessionData = Session.cloneObject(item.sessionData)
            return item;
        }
        pushToStack(stackItem) {
            /*if (stackItem.screenNavigationType === UI.NavigationType.Home)
                this.stack = [];
            if (stackItem.screenNavigationType !== UI.NavigationType.Immediate) {
                if (this.currentItem == null || this.stack.length === 0 || (this.stack[this.stack.length - 1].screenInstance !== stackItem.screenInstance && !replaceCurrentScreen))
                    this.stack.push(stackItem);
                else
                    this.stack[this.stack.length - 1] = stackItem;
            } */
            this.stack.push(stackItem);
            this._item = stackItem;
        }
        joinSnapshoot(snapshoot) {
            Session.joinObject(this.snapshoot.sessionObject, snapshoot.sessionObject);
            Session.joinObject(this.snapshoot.immediateObject, snapshoot.immediateObject);
        }
        joinObject(target, source) {
            return Object.assign({}, target, source);    
        }
        cloneObject(targetObject) {
            let temp = {};
            for (var key in targetObject)
                if (Array.isArray(targetObject[key]))
                    temp[key] = targetObject[key].slice();
                else
                    temp[key] = targetObject[key];
            return temp;
        }
        clearstack(){
            this.stack = [];
        }
        clear(){
            this.stack = [];
            this.snapshoot ={
                "stack":[],
                "configurator":{},
                "sessionData":{},
                "immediateData":{}
            };
            this._item = {};
            this._inputs = {};
            this._outputs = {};
            this.model = {};
            this.children = [];
            this.views = {};
            this.panels={};
            this.pages={};
            this.viewResponsitory = {};
            this.pageResponsitory = {};
            this.fileResponsitory = {};
        }
    }
    UI.Session = UISession;
    Session = new UI.Session();

    class EventDispatcher {
        constructor() {
            this.handlers = {};
        }
        addEventListener(eventName, func) {
            this.handlers[eventName] = this.handlers[eventName] || [];
            let eventHandlers = this.handlers[eventName];
            if (eventHandlers.indexOf(func) === -1) {
                eventHandlers.push(func);
                return true;
            }
            return false;
        }
        fireEvent(eventName, param, cancellable = false) {
            let eventHandlers = this.handlers[eventName];
            if (!eventHandlers)
                return true;
            for (let handle of eventHandlers) {
                try {
                    if (handle.call(this, param) === false && cancellable)
                        return false;
                }
                catch (e) {
                    // UI.Log(e);
                }
            }
            return true;
        }
        removeEventListener(eventName, func) {
            let eventHandlers = this.handlers[eventName];
            if (!eventHandlers)
                return null;
            let idx = eventHandlers.indexOf(func);
            return idx > -1 ? eventHandlers.splice(idx, 1)[0] : null;
        }
        clearListeners(eventName) {
            if (eventName) {
                let h = this.handlers[eventName];
                this.handlers[eventName] = [];
                return {
                    [eventName]: h
                };
            }
            let h = this.handlers;
            this.handlers = {};
            return h;
        }
    }
    UI.EventDispatcher = EventDispatcher;
})(UI || (UI = {}));

function rAFThrottle(func) {
    var _busy = false;
    return function () {
        if (!_busy) {
            _busy = true;
            var args = arguments;
            window.requestAnimationFrame(() => {
                _busy = false;
                func.apply(this, args);
            });
        }
    };
}

(function (UI) {
    class ContextPopup {
        constructor(menu) {
            $('.iac-ui-header-popup').remove();
            this.visible = false;
            var dropdown = document.createElement("div");
            dropdown.classList.add("iac-ui-header-popup");
            var triangle = document.createElement("div");
            triangle.classList.add("triangle");
            dropdown.appendChild(triangle);
            dropdown.appendChild(menu);
            dropdown.addEventListener("click", ev => this.close());
            this.element = dropdown;
            ContextPopup.attachPopupEvents();
        }
        static hidePopups(exceptElement) {
            while (exceptElement != null && exceptElement.classList != null && !exceptElement.classList.contains("iac-ui-header-popup")) {
                exceptElement = exceptElement.parentElement;
            }
            for (var idx = 0; idx < this.popups.length; ++idx) {
                if (this.popups[idx].element != exceptElement) {
                    this.popups[idx].close();
                }
            }
        }
        attach(element) {
            element.addEventListener("click", ev => {
                this.open();
                ev.stopPropagation();
            });
            element.appendChild(this.element);
        }
        static attachPopupEvents() {
            if (!this._popupEventHandlers) {
                this._popupEventHandlers = [];
                var mouseDownHandler = ev => {
                    this.hidePopups(ev.target);
                };
                document.addEventListener("mousedown", mouseDownHandler);
                this._popupEventHandlers.push(mouseDownHandler);
                var resizeHandler = rAFThrottle(ev => {
                    this.hidePopups(null);
                });
                window.addEventListener("resize", resizeHandler);
                this._popupEventHandlers.push(resizeHandler);
            }
        }
        open() {
            if (this.visible)
                return;
            this.visible = true;
            this.element.parentElement.classList.add('iac-ui-active');
            this.element.style.visibility = "visible";
            var rightEdge = this.element.offsetLeft + this.element.offsetWidth;
            var diff = window.innerWidth - rightEdge;
            if (diff < 0) {
                var offsideX;
                if (this.element.parentElement.classList.contains('user')) {
                    offsideX = -(this.element.offsetWidth) + 44;
                }
                else {
                    offsideX = -(this.element.offsetWidth / 2) + (this.element.parentElement.offsetWidth / 2);
                }
                var tr = this.element.querySelector(".triangle");
                this.element.style.transform = "translateX(" + offsideX + "px)";
                tr.style.left = this.element.offsetWidth - (this.element.parentElement.offsetWidth / 2) - 8 + "px";
            }
            else if (!this.element.parentElement.classList.contains('iac-ui-crumbs')) {
                this.element.style.transform = "translateX(calc(-50% + 22px)";
            }
        }
        close() {
            if (!this.visible)
                return;
            this.visible = false;
            this.element.style.visibility = "hidden";
            this.element.parentElement.classList.remove('iac-ui-active');
        }
        remove() {
            ContextPopup.popups.splice(ContextPopup.popups.indexOf(this), 1);
            if (this.element && this.element.parentElement) {
                this.element.parentElement.removeChild(this.element);
            }
            if (ContextPopup.popups.length == 0)
                ContextPopup.detachPopupEvents();
        }
        static detachPopupEvents() {
            if (this._popupEventHandlers) {
                document.removeEventListener("mousedown", this._popupEventHandlers[0]);
                window.removeEventListener("resize", this._popupEventHandlers[1]);
                this._popupEventHandlers = null;
            }
        }
        static createPopup(menu) {
            var popup = new ContextPopup(menu);
        //    this.popups.push(popup);
            return popup;
        }
    }
    ContextPopup.popups = [];
    ContextPopup._popupEventHandlers = null;
    UI.ContextPopup = ContextPopup;

    class Popup extends UI.EventDispatcher {
        constructor(container) {
            super();
            this.container = container;
            this.modal = true;
            this.body = document.createElement("div");
        }
        open() {
            if (!this.popup) {
                this.createPopup();
            }
            this.titleEl.textContent = this.title;
            if (this.modal) {
                if (this.overlay == null) {
                    this.overlay = new HTMLOverlay(this.container);
                    this.overlay.content = this.popup;
                }
                this.overlay.open();
            }
            else {
                this.container.appendChild(this.popup);
            }
        }
        createPopup() {
            const div = document.createElement("div");
            div.className = "iac-ui-popup";
            const head = document.createElement("div");
            head.className = "iac-ui-popup-head";
            this.titleEl = document.createElement("span");
            this.titleEl.className = "iac-ui-popup-title";
            head.appendChild(this.titleEl);
            const button = document.createElement("button");
            button.className = "iac-ui-popup-close fa fa-close";
            button.type = "button";
            button.onclick = ev => {
                this.close();
            };
            head.appendChild(button);
            div.appendChild(head);
            this.body.classList.add("iac-ui-popup-body");
            div.appendChild(this.body);
            this.popup = div;
        }
        close() {            
            if (this.modal) {
                this.fireEvent("close");
                if(this.overlay)
                    this.overlay.remove();
                this.overlay = null;
                this.modal = null;
            }
            else {
               // this.container.removeChild(this.popup);
               this.popup.remove();
               if(this.overlay)
                    this.overlay.remove();
               this.overlay = null;
            }
        }
        onClose(func) {
            this.addEventListener("close", function(){
                func();
                offClose(func)
            });            
        }
        offClose(func) {
            this.removeEventListener("close", func);
        }

    }
    UI.Popup = Popup;

    class HTMLOverlay extends UI.EventDispatcher {
        constructor(root = document.body) {
            super();
            this.overlayElement = HTMLOverlay.createOverlay();
            if (root)
                root.appendChild(this.overlayElement);
            this.overlayElement.aprOverlay = this;
            var thisOverlay = this;
            /*this.overlayElement.addEventListener("DOMNodeRemoved", function (ev) {
                if (ev.target === this && thisOverlay.visible) {
                    thisOverlay.fireEvent("close", this);
                }
            });*/
            this.overlayElement.addEventListener("DOMNodeInserted", function (ev) {
                var newelem = ev.target;
                if (newelem.nodeType === Node.ELEMENT_NODE) {
                    var form = newelem.closest('form');
                    if (form) {
                        var autofocus = form.querySelector('input[autofocus]');
                        if (autofocus) {
                            return;
                        }
                    }
                    var popupElements = newelem.querySelectorAll("input:not([type=hidden]),button:not(.close)");
                   // if (popupElements.length > 0)
                   //     SF.Forms.focusElement(popupElements[0]);
                }
            });
            this.overlayElement.addEventListener("keydown", function (event) {
                if (event.key != "Tab")
                    return;
                if (this.querySelectorAll) {
                    var popupElements = this.querySelectorAll("input:not([type=hidden]),button:not(.close)");
                    if (popupElements.length > 0) {
                        if (!event.shiftKey && event.target == popupElements[popupElements.length - 1]) {
                         //   SF.Forms.focusElement(popupElements[0]);
                            event.preventDefault();
                        }
                        else if (event.shiftKey && event.target == popupElements[0]) {
                         //   SF.Forms.focusElement(popupElements[popupElements.length - 1]);
                            event.preventDefault();
                        }
                    }
                }
            });
        }
        get visible() {
            return this._visible;
        }
        get content() {
            return this._content;
        }
        set content(value) {
            if (value) {
                if (this._content)
                    this.overlayElement.replaceChild(value, this._content);
                else
                    this.overlayElement.appendChild(value);
            }
            else if (this._content && this._content.parentElement === this.overlayElement) {
                this.overlayElement.removeChild(this._content);
            }
            this._content = value;
        }
        static createOverlay() {
            var baseDiv = document.createElement("div");
            baseDiv.className = "iac-ui-overlay";
            baseDiv.style.display = "none";
            var overlayFrame = document.createElement("iframe"); //used to overlay over popups etc;
            overlayFrame.attributes["allowTransparency"] = true;
            overlayFrame.src = "about:blank";
            baseDiv.appendChild(overlayFrame);
            return baseDiv;
        }
        onOpen(func) {
            this.addEventListener("open", func);
            return this;
        }
        onClose(func) {
            this.addEventListener("close", func);
            return this;
        }
        open() {
            if (!this.overlayElement)
                throw "can not reopen removed ovelay";
            if (!this._visible) {
                this.prevFocusElement = document.activeElement;
                if (this.prevFocusElement && this.prevFocusElement.blur && this.prevFocusElement != document.body)
                    this.prevFocusElement.blur();
                //UI.Forms.focusElement(this.overlayElement);
                this.fireEvent("open", this);
                if (this.content)
                    this.overlayElement.style.display = "";
                this._visible = true;
            }
            return this;
        }
        close() {
            if (this._visible) {
                if (this.prevFocusElement) {
                    //UI.Forms.focusElement(this.prevFocusElement);
                    this.prevFocusElement = null;
                }
            //    this.fireEvent("close", this);
                if (this.content)
                    this.overlayElement.style.display = "none";
                this._visible = false;
            }
            this.remove();
            return this;
        }
        remove() {
            if (this._visible) {
                if (this.prevFocusElement) {
                    //UI.Forms.focusElement(this.prevFocusElement);
                    this.prevFocusElement = null;
                }
            //    this.fireEvent("close", this);
                this._visible = false;
            }
            if (this.overlayElement) {
                //this.overlayElement.parentElement.removeChild(this.overlayElement);
                this.overlayElement.remove()
                this.overlayElement = null;
            }
            return;
        }
        static getCurrent(cont = document.body) {
            const ch = cont.children;
            for (var idx = ch.length - 1; idx > -1; --idx) {
                if (ch[idx].classList.contains("iac-ui-overlay"))
                    return ch[idx].aprOverlay;
            }
            return null;
        }
    }
    UI.HTMLOverlay = HTMLOverlay;

    function ConfirmationPopup(title, message, continueMsg, cancelMsg) {
        return new Promise(async (resolve, reject) => {
            let shouldContinue = false;
            const popup = new UI.Popup(document.body);
            popup.modal = true;
            popup.onClose(() => {
                resolve(shouldContinue);
            });
            const literals = ["ConfirmationTitle", "ConfirmationMessage", "ContinueAction", "CancelAction"];
            //const [title, message, continueMsg, cancelMsg] = await Promise.all(literals.map(l => UI.Literals.get(l)));
            popup.title = title;
            const content = document.createElement("div");
            content.className = "iac-popup-content";
            content.textContent = message;
            let span = document.createElement("span");
            span.textContent = cancelMsg;
            const cancelButton = document.createElement("button");
            cancelButton.className = "iac-button";
            cancelButton.appendChild(span);
            cancelButton.addEventListener("click", () => {
                popup.close();
            });
            span = document.createElement("span");
            span.textContent = continueMsg;
            const continueButton = document.createElement("button");
            continueButton.className = "btn btn-primary";
            continueButton.appendChild(span);
            continueButton.addEventListener("click", () => {
                shouldContinue = true;
                popup.close();
            });
            const footer = document.createElement("div");
            footer.className = "apr-popup-footer apr-laflex-container apr-align-right";
            footer.appendChild(cancelButton);
            footer.appendChild(continueButton);
            popup.body.appendChild(content);
            popup.body.appendChild(footer);
            popup.open();
        });
    }
    UI.ConfirmationPopup = ConfirmationPopup;
})(UI || (UI = {}));
(function (UI) {
  

    /*
        UI Stucture:
        UI - > Page -> Panels -> View

    */

    const unitStyle = {
        0: "%",
        1: "px",
    };
    const orientationClass = {
        0: "iac-ui-page-vertical",
        1: "iac-ui-page-horizontal",
        2: "iac-ui-page-floating",
    };
    const POPUP_PANEL_ID = "-ui-page-popup-panel";

    class Panel{
        /*
            {
                name: "panel-name",
                orientation: 0, // 0: vertical, 1: horizontal, 2: floating  
                view: {
                    name: "view-name",
                    type: "view-type",
                    file: "view-content",
                    code: "view-code",
                    script: "view-script",
                    style: "view-style"
                } 

            }
        */
        constructor(page,configuration, parent = null){
          //  UI.Log(page,configuration)
            this.page = page;
            this.configuration  = configuration;
            this.configuration.orientation = this.configuration.orientation || 0;
            this.configuration.inlinestyle = this.configuration.inlinestyle || "";
            this.configuration.view = this.configuration.view || {};
            this.configuration.panels = this.configuration.panels || [];
            this.view = null;
            this.panel = null;
            this.name = UI.safeName(this.configuration.name);
            this.parent = parent;
        }
        create(popup = false){
            this.panel = document.createElement("div");
            this.panel.className = "ui-panel";
            this.panel.classList.add(UI.safeClass(`panel_${this.configuration.name}`));

            if((this.configuration.hasOwnProperty("panels") && this.configuration.panels.length > 0) 
                || (this.configuration.hasOwnProperty("iscontainer") && this.configuration.iscontainer )){
                this.panel.classList.add(orientationClass[this.configuration.orientation]);
            }

            if(popup)
                this.panel.classList.add("ui-page-popup-panel");

            let paneliId = "";

            if(popup)
                paneliId = POPUP_PANEL_ID;
            else
                paneliId = 'panel_'+UI.generateUUID();

            this.panel.setAttribute("id", paneliId);
            this.panel.id = paneliId;
            this.id = paneliId;
            this.panelElement = this.panel;
            if(this.configuration.inlinestyle){
                this.panel.setAttribute("style", this.configuration.inlinestyle);
            }
            
            if(this.configuration.height)
                this.panel.style.height = this.configuration.height;
            if(this.configuration.width)
                this.panel.style.width = this.configuration.width;
            
            /*
            this.panel.style = this.panel.style || {};
            if(this.configuration.hasOwnProperty("widthmethod") && this.configuration.widthmethod){
                    this.panel.style.width = "auto"
            }else if(this.configuration.hasOwnProperty("width") ){
                    this.panel.style.width = this.configuration.width + unitStyle[this.configuration.widthunit];
            }
    
            if(this.configuration.hasOwnProperty("heightmethod") && this.configuration.heightmethod){
                    this.panel.style.height =  "auto";
            }else if(this.configuration.hasOwnProperty("height")){
                  this.panel.style.height = this.configuration.height + unitStyle[this.configuration.heightunit];
            }*/
            UI.Log(this.configuration, this.panel.style)
            if(this.configuration.panels.length > 0){
                // calculate the sub panels width and height
               /* let totalwidth = 0;
                let totalheight = 0;
                let count = 0;
                let panelwidth =this.panelElement.width;
                let panelheight = this.panelElement.height;
                 
                for (let panel of this.configuration.panels) {
                    if(panel.widthmethod)
                        total += panel.width;
                    else
                        count++;
                } */

                for(let panel of this.configuration.panels){
                    let p = new Panel(this.page,panel, this.panel);
                    p.create();
                    this.panel.appendChild(p.panel);
                }
            }
            else{
                this.displayview();
            }
            if(!popup)
                this.page.pageElement.appendChild(this.panel);
            else
            {
                
                this.page.popup.body.appendChild(this.panel);
                if(this.configuration.view){
                    let title = this.configuration.view.title || this.configuration.view.name || this.configuration.name;
                    $(".iac-ui-popup-title").html(title);
                }
                else{
                    $(".iac-ui-popup-title").html(this.configuration.name);
                }
            }
            //this.page.pageElement.appendChild(this.panel);
            this.panelElement.addEventListener("SUBMIT_EVENT_ID", this.submitPanel.bind(this, this.panelId));
            Session.panels[UI.safeId(this.name)] = this;
            return this;
        }
        submitPanel(panelId) {
            let panel = this.page.panels[panelId];
            if (panel) {
                if(panel.view)
                    panel.view.compute();
            } 
        }
        clear(){
            if(this.view)
                this.view.clear();
            this.view = null;
            this.panel.innerHTML = "";
        }
        getpagepanelviewcfg(panels, panelname, viewname){  
            let that = this;          
            for(var i=0;i<panels.length;i++){
                let panel = panels[i]
                UI.Log(panels, panel, panelname,viewname)
                if(panel.name == panelname){
                    UI.Log(panel, panel.configuration)
                    if(panel.configuration.hasOwnProperty("view")){
                        if(panel.configuration.view.name == viewname)
                            return panel.configuration.view;
                    }else if(panel.hasOwnProperty("panelviews")){
                        for(var j=0; j<panel.configuration.panelviews.length;j++){

                            if(panel.configuration.panelviews[j].name == viewname)
                                return panel.configuration.panelviews[j];
                        }
                        return {"name": viewname}                    
                    }
                //    return {"name": viewname}
                }else if(panel.hasOwnProperty("panels")){
                    if(panel.panels.length > 0){
                        let view =  that.getpagepanelviewcfg(panel.panels,panelname, viewname)            
                        if (view != null)
                            return view;
                    }
                }else if(panel.hasOwnProperty("configuration")){
                    if(panel.configuration.hasOwnProperty("panels"))
                        if(panel.configuration.panels.length > 0){
                            let view =  that.getpagepanelviewcfg(panel.configuration.panels,panelname, viewname)            
                            if (view != null)
                                return view;
                        }
                }
            }
            return null;
        }
        changeview(view){
            //this.view.clear();
            this.clear();
            let panelview = this.getpagepanelviewcfg(Session.CurrentPage.panels,this.name, view);
            this.panelviewcfg = panelview

            if(panelview != null){
                this.configuration.view = panelview;
                this.displayview();
            } else {
            this.configuration.view = {
               "name": view,
               "type": "document"
            };
            this.displayview();
            }
        }
        displayview(){
            if(this.configuration.view){
                let view = new View(this,this.configuration.view);                
                this.view = view;
            }
        }
    }
    class View extends UI.EventDispatcher{
        /*
            {
                name: "view-name",
                type: "view-type",
                content: "view-content",
                file: "view-content",
                code: "view-code",
                script: "view-script",
                style: "view-style"

            }

        */
        constructor(Panel, configuration){
            // UI.Log(Panel,configuration)
            super();
           /* if(Panel.page.configuration.name !="Logon page"){

                this.validelogin(Panel,configuration);
            }
            else
            {
                this.initialize(Panel,configuration);
            }; */
            this.initialize(Panel,configuration);
        }
        async initialize(Panel,configuration){            
            UI.Log("initialize view",configuration)
            this.Panel = Panel;
          /*  if(configuration.name){
                if(UI.safeName(configuration.name) in Session.viewResponsitory){
                    let cachedView = Session.viewResponsitory[UI.safeName(configuration.name)]
                    if(configuration.name == cachedView.name){                        
                        this.configuration = Object.assign({},cachedView, configuration);
                        this.builview();
                        return; 
                    }
                }
            }  */
            if(configuration.type =="document"){
                
                await this.loadviewconfigurationfromdocument(configuration);

            }else if(configuration.config && configuration.config != "" && configuration.config != null) {
                await this.loadviewconfiguration(configuration);                 
            }
            else
            {    
                this.configuration = configuration; 
                this.builview();  
            }  
        }
        async validelogin(Panel,configuration){
            await UI.userlogin.checkiflogin(function(){
                // UI.Log("login success:", UI.userlogin.username);  
                this.initialize(Panel,configuration);
              }, function(){
                //  UI.startpage("pages/logon.json");
                 // // UI.Log(pagefile);
                  // UI.Log("there is no validated login user!");
                //  new UI.Page({file:"pages/logon.json"});
                  window.location.href = UI.userlogin.loginurl;
                //  return;
              });
        }
       /* async loadconfiguration(configuration){
            await this.loadviewconfiguration(configuration);   
        } */
        builview(){
            
            this.loaded = false;
            // UI.Log(this.configuration)
            if(!this.configuration.name)
            {
                return;
            }
            
            if(this.Panel.hasOwnProperty("panelviewcfg")){
                UI.Log("view configuration:", JSON.parse(JSON.stringify(this.configuration)),this.Panel.panelviewcfg)
                if(this.Panel.panelviewcfg != null)
                    this.configuration.actions = Object.assign({}, this.configuration.actions,this.Panel.panelviewcfg.actions)
            }
            Session.viewResponsitory[UI.safeName(this.configuration.name)] = Object.assign({},this.configuration);

            this.id = UI.safeId('view_'+UI.generateUUID());
            this.view = document.createElement("div");
            this.name = UI.safeName(this.configuration.name);
            this.view.className = "ui-view";
            this.view.classList.add(UI.safeClass(`view_${this.configuration.name}`));
            this.view.setAttribute("id", this.id);
            this.view.setAttribute("viewID", this.id);
            this.Panel.panelElement.appendChild(this.view);
            this.Context = this.id;
            this.inputs={};
            this.outputs ={};
            this.promiseCount =0;
            this.Promiseitems = {};
            this.preloaddata();
                        
        }
        clear(){
            this.fireOnUnloading();
            // UI.Log("clear view",this);
            delete Session.views[this.id];
            const items = document.querySelectorAll(`[viewID="${this.id}"]`);
            for (let i = 0; i < items.length; i++) {
                items[i].remove();
            }
            const elements = document.querySelectorAll(`[id="${this.id}"]`);
            // UI.Log(elements)
            for (let i = 0; i < elements.length; i++) {
                elements[i].remove();
            }
            //delete Session.view[UI.safeId(this.id)];
        }
        async preloaddata(){
            let that = this

            if(this.configuration.isform){
                try{
                    var components = this.configuration.formdata.components;
                    for(var i=0; i<components.length;i++){
                        let component = components[i];
                        if(component.hasOwnProperty("key")){
                            if(!this.configuration.inputs.hasOwnProperty(component.key)){
                                this.configuration.inputs[component.key] = "";
                            }
                        }
                    }
                }catch(e){
                    UI.Log(e)
                }
            }

            if(this.configuration.inputs)        
                this.createinputs(this.configuration.inputs);
            if(this.configuration.lngcodes)
                this.createlanguagecodes(this.configuration.lngcodes);
            
            if(this.configuration.onloadcode && this.configuration.onloadcode.trim() != ""){
                /*
                let data={};
                data.code = this.configuration.onloadcode;
                data.inputs = this.inputs;
                UI.Log("execute code to load data,"    , data)
                */
                await this.executeLoadData(this.configuration.onloadcode, this.inputs, function(response){
                 //   UI.Log("load data success:", response);
                    let responsedata = JSON.parse(response);
                    Session.snapshoot.sessionData =  Object.assign({},Session.snapshoot.sessionData, responsedata.Outputs);
                    that.inputs = Object.assign({},that.inputs, responsedata.Outputs);
                    that.create();
                }, function(error){
                    
                    UI.ShowError("Load the data wrong:",error);
                });
                
            }
            else 
                that.create();
        }
        async create(){

          //  // UI.Log(this, this.Panel.panelElement);
            Session.views[this.id] = this;
            UI.Log("create view",this.configuration)
   
            if(this.configuration.isform){
                this.buildform(this.configuration.formdata);
            }            
            else if(this.configuration.content){                
                this.content = this.configuration.content;
                this.view.innerHTML = UI.createFragment(this.createcontext(this.content));
            }else if(this.configuration.html){
                this.buildviewwithresponse(this.configuration.html);
                /*
                UI.Log("create view with html", this.configuration.html)
                this.content = this.configuration.html;
                let innerHtml = this.createcontext(this.content);
                //this.view.innerHTML = UI.createFragment(this.createcontext(this.content));
                let fragmentcontent = UI.createFragment(this.createcontext(this.content));
                UI.Log("create view with html", fragmentcontent)
                this.view.innerHTML = innerHtml
                */
            } else if(this.configuration.file)
                this.loadfile(this.configuration.file)
            /*else if(this.configuration.form)
                this.buildform(this.configuration.form); */
            else if(this.configuration.code){
                this.createwithCode(this.configuration.code);
            }

            if(this.configuration.style){
                this.createStyleContent(this.configuration.style);                
            }  
            if(this.configuration.styles){
                this.createStyleContent(this.configuration.styles);                
            }

            if(this.configuration.inlinestyle){
                this.view.setAttribute("style", this.configuration.inlinestyle);
            } 
                        
            if(this.configuration.script){
                this.createScriptContent(this.configuration.script);
            }

            if(this.configuration.inlinescript){
                let script = this.configuration.inlinescript;
                this.createScriptContent(script);
            }

            Session.views[UI.safeId(this.id)] = this;

            UI.Log(this.Panel.id, POPUP_PANEL_ID, this.configuration.title, this.configuration.lngcode, $('.iac-ui-popup-title'))
            if(this.Panel.id == POPUP_PANEL_ID){
                $('.iac-ui-popup-title').html(this.configuration.title);
                $('.iac-ui-popup-title').attr("lngcode",this.configuration.lngcode);
            }
            // UI.Log(this,this.onLoaded)


            if(this.promiseCount == 0){
                this.fireOnLoaded();
            }
                      

            if(this.configuration.onloadedscript){
                UI.Log("onloadedscript:",this.configuration.onloadedscript, typeof this.configuration.onloadedscript)
                if (typeof this.configuration.onloadedscript == "function"){
                    this.configuration.onloadedscript();
                    UI.Log("executed onloadedscript:",this.configuration.onloadedscript, typeof this.configuration.onloadedscript)
                }
                else if(typeof this.configuration.onloadedscript == "string")
                    this.createScriptContent(this.configuration.onloadedscript);
            }

            return this;
        }
        async loadviewconfiguration(configuration){
            
          /*  if(configuration.config in Session.fileResponsitory){
                this.configuration = JSON.parse(Session.fileResponsitory[configuration.config]);
                this.configuration = Object.assign({}, this.configuration, configuration); 
            
                this.builview(); 
                return;                
            }  */


            let ajax = new UI.Ajax(""); 
        
            await ajax.get(configuration.config,false).then((response) => {  
              //  return JSON.parse(response);
                Session.fileResponsitory[configuration.config] = response;

                this.configuration = JSON.parse(response);//Object.assign(configuration,response);
                this.configuration = Object.assign({}, this.configuration, configuration); 
                
                this.builview(); 
                             
            }).catch((error) => {
                // UI.Log("error:",error);
            })
        }
        async loadviewconfigurationfromdocument(configuration){
            let that = this
            let url = "/collection/name"
            
            let inputs ={
                collectionname: "UI_View",
                data: {"name":configuration.name}
            }
            this.configuration ={};
            UI.Log("loadviewconfigurationfromdocument:",url, this.configuration);
            UI.Post(url, inputs, function(response){
                let result = JSON.parse(response);
                
                UI.Log("loadviewconfigurationfromdocument:",result,that.configuration);
                that.configuration = Object.assign({}, that.configuration, result.data,configuration); 
            //    UI.Log("loadviewconfigurationfromdocument:",this.configuration,configuration, result.data);
            //    Object.assign({},this.configuration,result.data);
                UI.Log("loadviewconfigurationfromdocument:",that.configuration,configuration, result.data);
                
                that.builview();
            }, function(error){
                UI.ShowError("Load the data wrong:",error);
            })
        }
        async loadfile(file){
            let that = this
            UI.Log("Load the file:", file)
            if(file in Session.fileResponsitory){

                this.buildviewwithresponse(Session.fileResponsitory[file]);
                return;
            }

            this.promiseCount = this.promiseCount+1;
            this.Promiseitems[file] = true;

            let ajax = new UI.Ajax("");
            await ajax.get(file,false).then((response) => {
            //    // UI.Log(response)
                Session.fileResponsitory[file] = response;
                //return response;
                that.buildviewwithresponse(response);

                that.promiseCount = that.promiseCount-1;
                this.Promiseitems[file] = false;
                if(that.promiseCount == 0)
                    that.fireOnLoaded();

            }).catch((error) => {
                UI.ShowError("Load the file " +file+" wrong with error:",error);
            })
        }
        createwithCode(code){
              
            let that = this;
            // load codecontent from the database

            let ajax = new UI.Ajax("");
            ajax.get(code,false).then((response) => {
                that.buildviewwithresponse(response.data);
            }).catch((error) => {
                // UI.Log(error)
                UI.ShowError("Load the code wrong:",error);
            })
        }
        buildform(formdata){
            // the inputs which needs to be replaced will be liked as {key1}
            let that = this;
            var attr = {
                id: "form_"+this.id,
                name: "form_"+this.id,
                style: "width:100%;height:100%;"
            }

            new UI.FormControl(this.view, "div",attr);
            UI.Log(this.view, "div",attr, Session.snapshoot.sessionData)
            let container = document.getElementById("form_"+this.id);
           
            var formview = FormViewer.createForm({
                container:container,
                schema: formdata,
                data: Session.snapshoot.sessionData,
            });
            this.formview = formview
            this.isform = true;
            console.log(formview)

            try{
                formview.then((obj) => {
                    
                    obj.on("submit", function(data, event){
                    //    that.outputs["action"] ="submit";
                        //UI.Log("form data by submit:",data,event);
                        if(!that.outputs)
                            that.outputs = {};
                        that.outputs = Object.assign({},that.outputs,data.data)
                        that.submit();
                    })  

                    obj.on("reset", function(data){
                        //UI.Log("form data by reset:",data);
                       // formview.importSchema(formdata, that.inputs); 
                    })
                    formdata.components.forEach((item) => {
                        if(item.type == 'button' && item.action == 'submit'){
                            if(item.properties && item.properties.hasOwnProperty("action")){
                                var action = item.properties.action;
                                //console.log($('#'+that.id).find('button[fieldid="'+item.id+'"]'))
                                $('#'+that.id).find('button[fieldid="'+item.id+'"]').click(function() {
                                    
                                    that.outputs.action =action;
                                  //  that.Context.outputs.action = action;
                                //    console.log('click button', item.id, action, that.outputs);
                                //    that.submit();
                                });
                            }
        
                        }
                    })

                }).catch((error) => {UI.Log(error)})

            
            /*    formview.on("submit", function(data){
                    UI.Log("form data by submit:",data);
                    that.submit();
                })
            /*    formview.on("reset", function(data){
                    UI.Log("form data by reset:",data);
                    formview.importSchema(formdata, that.inputs); 
                }) */
            }catch(e){
                UI.Log(e)
            }
            /*
            formview.on("submit", function(data){
                UI.Log("form data by submit:",data);
                //that.submit(data);
            })

            formview.on("change", function(data){
                UI.Log("form data by change:",data);
                //that.submit(data);
            })  */
            /*
            formview.then((obj) => {
                obj.importSchema(formdata, that.inputs);
              }).catch((error) => {UI.Log(error)})
            */
           /* let text = JSON.stringify(form);

            let result = text.replace(/\{([^}]+)\}/g, function(match, key) {
                if (that.inputs.hasOwnProperty(key)) {
                  return that.inputs[key];
                }
                return match;
              });

            let response = JSON.parse(result);  
            new UI.Builder(this.view,response); */
        }
        buildviewwithresponse(response){
            let that = this;
            const parser = new DOMParser();
            const doc = parser.parseFromString(response, 'text/html');
            const head = doc.querySelector('head');
            const body = doc.querySelector('body');

            const styles = doc.querySelectorAll('link');
            let scripts = doc.querySelectorAll('script[src]');
            

            for (let i = 0; i < styles.length; i++) {
                if(styles[i].href){
                    this.createStyle(styles[i].href);
                    continue;
                }
                else if(styles[i].textContent)
                    this.createStyleContent(styles[i].textContent);
                styles[i].remove();
            }
            // UI.Log('scripts:',scripts)
            for (let i = 0; i < scripts.length; i++) {
                if(scripts[i].src){
                    
                    this.createScript(scripts[i].src);
                    continue;
                }
                else if(scripts[i].textContent)
                    this.createScriptContent(scripts[i].textContent);
                scripts[i].remove();
            }
            
            scripts = doc.querySelectorAll('script:not([src])');
            
            body.querySelectorAll("script").forEach((script) => {
                script.remove();
            }) 
            
            
            // UI.Log(scripts)
            for (let i = 0; i < scripts.length; i++) {
                if(scripts[i].src){                

                    this.createScript(scripts[i].src);
                    continue;
                }
                else if(scripts[i].textContent)
                    this.createScriptContent(scripts[i].textContent);
                scripts[i].remove();
            }
            UI.Log(doc, body)
            this.view.appendChild(UI.createFragment(this.createcontext(body.innerHTML)));
        }
        createinputs(inputs){
            let inputscript = "";
            // UI.Log(Session.snapshoot.sessionData,inputs);
            Object.keys(inputs).reduce((acc, key) => {
                if(Session.snapshoot.sessionData.hasOwnProperty(key)   ){
                    inputs[key] = Session.snapshoot.sessionData[key];                      
                }
            }, {})

            this.inputs = inputs;
            // UI.Log(inputs)
            return inputscript;
        }
        createoutputs(outputs){
            let outputscript = "";
            Object.keys(outputs).reduce((acc, key) => {  
          
                return acc;
            }, {})

         //   this.createScriptContent(outputscript);
            this.outputs = outputs;
            return outputscript;
        }
        async createlanguagecodes(languagecodes){
            let that = this
            let lngcodes = []
            let defaulttexts = [];
            Object.keys(languagecodes).reduce((acc, key) => {  
                lngcodes.push(key);
                defaulttexts.push(languagecodes[key]); 
                return acc;  
            }, {})
            this.lngcodes = languagecodes;
            await UI.translatebycodes(lngcodes, function(data){
                that.lngcodes = Object.assign({},that.lngcodes, data);
            }, function(){
                UI.ShowError("Load the language codes wrong")
            });
        }            
        
        createcommonfunctions(){
          let s = 'object_'+this.id + ' = ' + `Session.views[`+this.id+`]` + ';';
          // UI.Log(s)
          this.createScriptContent(s);
        }
        getoutputs(){
            let outputs = this.outputs;
            Object.keys(outputs).reduce((acc, key) => {                
                acc[outputs[key] ] = this.Context+'.outputs.'+key;
                return acc;
            }, {})
            this.outputs = outputs;
            return outputs;
        }
        createScript(path) {
            let that = this;
            path = path.toLowerCase();
            if(UI.isScriptLoaded(path))
                return;

            this.Promiseitems[path] = true;
            that.promiseCount = that.promiseCount+1; 
           
            var s = document.createElement("script");
            s.src = path;
            s.async = false;
        //    s.setAttribute("viewid", this.id);

            s.onload = function () {
                that.Promiseitems[path] = false;
                that.promiseCount = that.promiseCount-1;
                if(that.promiseCount == 0)
                    that.fireOnLoaded();
            };
            document.head.appendChild(s);            
            return s;
        }
        createScriptContent(Content) {
            let that = this;
            const scriptTagRegex = /<script\s+src="([^"]+)"><\/script>/g;
            /*
            let match = scriptTagRegex.exec(Content);
            while (match) {
                this.createScript(match[1]);
                match = scriptTagRegex.exec(Content);
            } 
            */
            Content = Content.replace(scriptTagRegex, (match, src) => {
                that.createScript(src);
                return "";
              });
            
            if(Content.trim() == "")
                return;

            var s = document.createElement("script");
            s.type = "text/javascript";
            s.setAttribute("viewid", this.id);
            
            s.textContent =this.createcontext(Content)
        //    // UI.Log(s);
            this.view.appendChild(s);
           // document.head.appendChild(s);
            return s;
        }
        createStyle(link) {
            link = link.toLowerCase();
            if(UI.isStyleLoaded(link))
                return;
            
            var s = document.createElement("link");
            s.href = link.toLowerCase();
            s.rel = "stylesheet";
        //    s.setAttribute("viewid", this.id);
            document.head.appendChild(s);
            return s;
        }
        createStyleContent(Content) {
            var s = document.createElement("style");
            s.setAttribute("type", "text/css");
        //    s.setAttribute("viewid", this.id);
            s.textContent  = Content;
            document.head.appendChild(s);
            return s;
        }        
        createcontext(content){
            let newcontent = content.replaceAll("$Context", 'Session.views["'+this.id+'"]');            
            newcontent = newcontent.replaceAll("$PageID", this.id);
            newcontent = newcontent.replaceAll("$ViewID", this.id);
            newcontent = newcontent.replaceAll("$View", 'Session.views["'+this.id+'"]');
        //    newcontent = newcontent.replaceAll("$View", this.id+"_");

            newcontent = newcontent.replaceAll("$UserName", UI.userlogin.username);
            newcontent = newcontent.replaceAll("$UserID", UI.userlogin.userID);
            newcontent = newcontent.replaceAll("$LocalDateTime", (new Date()));
            newcontent = newcontent.replaceAll("$UTCDateTime", (new Date()));

            let inputnames = Object.keys(this.inputs);

            for(var i=0;i<inputnames.length;i++){                
                newcontent = newcontent.replaceAll("{"+inputnames[i] +"}", this.inputs[inputnames[i]]);
            }

            if(this.lngcodes){
                let lngcodes = Object.keys(this.lngcodes);
                for(var i=0;i<lngcodes.length;i++){
                    newcontent = newcontent.replaceAll("{@"+lngcodes[i] +"}", this.lngcodes[lngcodes[i]]);
                }
            }

            return newcontent;
        }
        submit(){
        //    // UI.Log("submit",this.inputs,this.outputs);           
            console.log("submit",this.inputs,this.outputs);
            if(this.isform){
                this.formview.then((obj) => {
                    Session.snapshoot.sessionData =  Object.assign({},Session.snapshoot.sessionData, obj["_state"]["data"])
                }).catch((error) => {UI.Log(error)})
                Session.snapshoot.sessionData.action = this.outputs.action
                if(this.outputs.action){
                    this.executeactionchain();
                }
            } else if(this.outputs.action){
                Session.snapshoot.sessionData =  Object.assign({},Session.snapshoot.sessionData, this.getoutputs());
                this.executeactionchain();
            }
        }
        executeactionchain(){
            let that = this;
            let chaintime = 0 ;
            UI.Log(this.configuration.actions[Session.snapshoot.sessionData.action])
            if(Session.snapshoot.sessionData.action){
                UI.Log(this.configuration.actions[Session.snapshoot.sessionData.action])
                    if(this.configuration.actions[Session.snapshoot.sessionData.action]){
                        var action = this.configuration.actions[Session.snapshoot.sessionData.action];
                        UI.Log("selected action:",Session.snapshoot.sessionData.action,action,action.type)
                        Session.snapshoot.sessionData.action ="";
                                                
                        if(action.type.toLowerCase() == "transaction"){
                            if(action.code !="" && action.code){
                                this.executeTransaction(action.code, Session.snapshoot.sessionData, function(response){
                                    //   UI.Log("load data success:", response);
                                       let responsedata = JSON.parse(response);
                                      // Session.snapshoot.sessionData =  Object.assign({},Session.snapshoot.sessionData, responsedata.Outputs);
                                       
                                       that.updateoutputs(responsedata.Outputs)
                                },
                                    function(error){ UI.ShowError(error)});
                            }
                            if(Session.snapshoot.sessionData.action !="")
                                this.executeactionchain();
                            
                            if(action.next && action.next !=""){
                                Session.snapshoot.sessionData.action = action.next;
                                this.executeactionchain();          
                            }                  
                        }
                        else if(action.type.toLowerCase() == "home"){
                            this.Panel.page.clear();
                        //    Session.panels = {};
                        //    Session.views = {};
                        //    Session.pages = {};
                            Session.clearstack();
                            // clear the crumbs
                            let page = new Page({"name":"Portal Menu"});
                        }
                        else if(action.type.toLowerCase() == "back"){
                            console.log(Session.stack)
                            if(Session.stack.length > 1){
                                Session.popFromStack();
                                let stackitem = Session.popFromStack();
                                this.Panel.page.clear();
                                let page = new Page(stackitem.CurrentPage.configuration);
                                
                            }else{
                                this.Panel.page.clear();
                            //    Session.panels = {};
                            //    Session.views = {};
                            //    Session.pages = {};.
                                Session.clearstack();
                                // clear the crumbs
                                let page = new Page({"name":"Portal Menu"});
                            }

                        }
                        else if(action.type.toLowerCase() == "view"){
                            if(action.view){
                                UI.Log("actions:",action.view)

                                for(const key in action.view){
                                    let view = action.view[key];
                                    let viewpanel = key;
                                    let panel = Session.panels[UI.safeId(viewpanel)];
                                    UI.Log("actions:",viewpanel,panel, view)
                                    if(panel){
                                        panel.changeview(view);
                                    }
                                }

                            }
                            if(action.next && action.next !=""){
                                Session.snapshoot.sessionData.action = action.next;
                                this.executeactionchain();          
                            }   

                        }                    
                        else if(action.type.toLowerCase() == "page"){
                            
                            if(!action.page || action.page == ""){
                                UI.Log("there is no page to load");
                                return;
                            }
                            Session.panels = {};

                            this.Panel.page.clear();
                            if(action.page.toLowerCase().indexOf("home.json") !=-1){
                                Session.clearstack();
                            }
                        //    Session.views = {};
                        //    Session.pages = {};
                            if(action.page.endsWith(".json"))
                                new Page({"file":action.page});
                            else
                                new Page({"name":action.page});    
                        }else if(action.type.toLowerCase() == "pagebycode"){
                            
                            if(!action.page || action.page == ""){
                                UI.Log("there is no page to load");
                                return;
                            }
                            Session.panels = {};

                            this.Panel.page.clear();
                        //    Session.views = {};
                        //    Session.pages = {};
                            if(this.outputs.hasOwnProperty(action.page) && this.outputs[action.page] != "")
                               new Page({"name":this.outputs[action.page]});    
                        }else if(action.type.toLowerCase() == "completewftask"){
                            if (!this.inputs.hasOwnProperty("workflow_taskid")){
                                UI.ShowError("there is no taskid. ")
                                return;
                            }
                            UI.Log("view outputs:",this.outputs)
                            let taskid = this.inputs.workflow_taskid;
                            let trancode = this.outputs.workflow_trancode || ""
                            let processdata = this.outputs || {};

                            let inputs = {
                                data:{
                                    taskid: taskid,
                                    trancode: trancode,
                                    processdata: processdata
                                }
                            }

                            UI.Post("/workflow/updatedatacomplete", inputs, function(response){
                                UI.Log("completed updating process data and complete task.")
                                console.log(Session.stack)
                                if(Session.stack.length > 1){
                                    Session.popFromStack();
                                    let stackitem = Session.popFromStack();
                                    that.Panel.page.clear();
                                    let page = new Page(stackitem.CurrentPage.configuration);
                                    
                                }else{
                                    that.Panel.page.clear();
                                //    Session.panels = {};
                                //    Session.views = {};
                                //    Session.pages = {};.
                                    Session.clearstack();
                                    // clear the crumbs
                                    let page = new Page({"name":"Portal Menu"});
                                } 
                            }, function(err){
                                UI.ShowError(err)
                            })

                        }
                        else if(action.type.toLowerCase() == "script"){
                            /*if(action.script){
                                let dynamicFunction = new Function(action.script)
                                //action.script(Session.snapshoot.sessionData);
                                dynamicFunction();
                            } */
                        /*    if(action.next && action.next !=""){
                                Session.snapshoot.sessionData.action = action.next;
                                this.executeactionchain();          
                            }  */
                            if(action.script){
                                action.script(Session.snapshoot.sessionData);
                            }
                            if(action.next && action.next !=""){
                                Session.snapshoot.sessionData.action = action.next;
                                this.executeactionchain();          
                            }   
                        }else if(action.type.toLowerCase() == "popup"){
                            if(action.popupview){
                                this.Panel.page.popupOpen(action.popupview);
                            }else {
                                UI.ShowError("there is no popup view to load");
                            }
                        /*    if(action.next && action.next !=""){
                                Session.snapshoot.sessionData.action = action.next;
                                this.executeactionchain();          
                            }  */
                           

                        }else if(action.type.toLowerCase() == "close_popup" ){
                            this.Panel.page.popupClose();
                            
                         /*   if(action.next && action.next !=""){
                                Session.snapshoot.sessionData.action = action.next;
                                this.executeactionchain();          
                            }   */
                            if(action.next && action.next !=""){
                                Session.snapshoot.sessionData.action = action.next;
                                this.executeactionchain();          
                            }   
                        }else if(action.type.toLowerCase() == "close_popup_refresh" ){

                            this.Panel.page.popupClose();
                            this.Panel.page.Refresh();

                        }else if(action.type.toLowerCase() =="refresh"){
                            this.Panel.page.Refresh();
                        }else{
                            UI.ShowError("The action type dows now support.", action.type);
                        }
                        
                       /* if(action.type != "Script" && action.script && action.script !="" && chaintime == 0){
                            if(action.script){
                                let dynamicFunction = new Function(action.script)
                                //action.script(Session.snapshoot.sessionData);
                                dynamicFunction();
                            }
                            chaintime +=1;
                        } */
                    }
    
            }  

        }
        updateoutputs(outputs){
            Session.snapshoot.sessionData =  Object.assign({},Session.snapshoot.sessionData, outputs);
        }
        executeTransaction(Code, inputs, func, fail){
            UI.CallTranCode(Code, "", inputs, func, fail);
            /*
            let url = "/trancode/execute";
            UI.ajax.post(url, inputs).then((response) => {
                   if(typeof(func) == 'function')
                        func(response); 
    
                }).catch((error) => {
                    if(typeof(fail) == 'function')
                        fail(error);
                    // UI.Log(error);
                }); */
        }
        executeLoadData(Code, inputs, func, fail){
            // UI.Log('execute loading data')
            UI.CallTranCode(Code, "", inputs, func, fail);
           /* let url = "/trancode/execute";
            UI.ajax.post(url, inputs, false).then((response) => {
                if(typeof(func) == 'function')
                    func(response); 
     
                }).catch((error) => {  
                    UI.Log(error);  
                    if(typeof(fail) == 'function')
                        fail(error);
                        // UI.Log(error);
                }); */
        }
        translateview(){
            UI.translate(this.view).then(() => {
                UI.Log("translated view by observer:", this.view);
            })
        }
      /*  observercontentloaded() {
            let that = this;
             const config = { childList: false };
            this.observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    if (mutation.type == "childList") {
                         UI.Log("A child node has been added or removed.", mutation);                      
                        
                        //observer.disconnect();
                    }
                }); 
            });
            observer.observe(that.view, config); 
        } */
        async exeonLoadedFunc(func){
            if(func){
                func()
            }
        }
        
        onLoaded(func) {   
            let that = this;       
            this.addEventListener("loaded",function(){
                UI.Log("onLoaded:",that.loaded, func)
                that.exeonLoadedFunc(func).then(() => {
                   that.translateview();
                });  
                
            });
            this.loaded = true;
            let readyevent = new CustomEvent("Viewready");
            this.view.dispatchEvent(readyevent);
            
        }
        fireOnLoaded() {
            let that = this;           

            if(that.loaded){
                // UI.Log("fireOnLoaded",document.readyState)
                this.fireEvent("loaded");
                this.clearListeners("loaded");
            }
            else{
                this.view.addEventListener("Viewready", function() {
                    UI.Log("fireOnLoaded with Viewready event")
                    that.fireEvent("loaded");
                    that.clearListeners("loaded");
                    that.view.removeEventListener("Viewready",this);
                    that.translateview();                     
                }); 
            }  

        }
        onUnloading(func) {
            this.addEventListener("unloading", func);
        }
        onUnloaded(func) {
            this.addEventListener("unloaded", func);
        }
        fireOnUnloading() {
        //    this.observer.disconnect();
            this.isUnloading = true;
            this.fireEvent("unloading");
            this.clearListeners("unloading");
            this.node = null;
            this.fireEvent("unloaded");
            this.clearListeners("unloaded");            
        }
    }
    UI.View = View;
    
    class Page extends UI.EventDispatcher{
            /*
            sample configuration
            {
                "name": "root page",
                "panels": [{
                        "name": "header",
                        "orientation": 1,
                        "view": {
                            "name": "generic header",
                            "type": "view-type",
                            "content": "<div> header content </div>",
                            "style": "{ \"background-color\": \"blue\", \"height\": \"20%\"}"
                        }
                    },
                    {
                        "name": "content",
                        "orientation": 1,
                        "view": {
                            "name": "generic header",
                            "type": "view-type",
                            "content": "<div> this is the content </div>",
                            "style": "{\"background-color\": \"blue\", \"height\": \"80%\"}"
                        }
                    }
                ]
            }
        */    
        constructor(configuration, pageID = null) {
            super();
            UI.Log("Page configuration:",configuration)
            this.configuration = configuration;
            this.page={};
            this.panels = [];
            this.refresh = false;
            Session.views = {};
            Session.panels = {};

            const elements = document.getElementsByClassName('ui-page');
            for (let i = 0; i < elements.length; i++) {
                elements[i].remove();
            }
        //    UI.tokencheck();
            if(configuration !="" && pageID != null && pageID != undefined){
                this.refresh = true;
            }          
            if(pageID != null && pageID in Session.pages && pageID != undefined){
                
                // UI.Log("pageID:",pageID)
                this.configuration = Object.assign({},Session.pages[pageID].configuration);
                this.configuration = Object.assign({},this.configuration,configuration);
                this.id = pageID;
                this.create();
            }
            else if(configuration.name in Session.pageResponsitory)
            {
                this.configuration = Object.assign({},Session.pageResponsitory[configuration.name]);
                this.configuration = Object.assign({},this.configuration,configuration);
                let found = false;
                
                for(var key in Session.pages){
                  //  UI.Log(key, this.configuration)
                    if(Session.pages[key].configuration.name == this.configuration.name){
                        // UI.Log(Session.pages[key], configuration.name)
                        this.id = key;
                        found = true;
                        this.create();
                        return;
                    }
                }
                if(!found)
                    this.init();
            }            
            else if(configuration.name && (configuration.file == undefined || configuration.file == "")){
                this.loadconfig(configuration);
            }
            else if(configuration.file){
                this.loadfile(configuration);
            }
            else{
                Session.pageResponsitory[this.configuration.name] = JSON.parse(JSON.stringify(this.configuration));

                this.init();
            }

        }
        async loadconfig(configuration){
            let that = this
            let url = "/collection/name"
            
            let inputs ={
                collectionname: "UI_Page",
                data: {"name":configuration.name}
            }

            await UI.Post(url, inputs, function(response){
                let result = JSON.parse(response);
                that.configuration = Object.assign({},that.configuration,result.data,configuration);
                UI.Log("loadconfig:",that.configuration,configuration, result.data);
                Session.pageResponsitory[configuration.name] = JSON.parse(JSON.stringify(that.configuration));
                that.init();
            }, function(error){
                UI.ShowError("Load the data wrong:",error);
            })
            
        }
        loadfile(configuration){
            if(configuration.file in Session.pageResponsitory){
                this.configuration =  Object.assign({},Session.pageResponsitory[configuration.file]);
                let found = false;
                if(Session.pages && Session.pages.length > 0){
                    for(var key in Session.pages){
                        if(Session.pages[key].configuration.name == this.configuration.name){
                            this.id = key;
                            found = true;
                            this.create();
                            return;
                        }
                    }
                }
                if(!found)
                    this.init();
                return;
            }

            let ajax = new UI.Ajax("");
            ajax.get(configuration.file,false).then((response) => {
                let pagedata = JSON.parse(response);               
                
                this.configuration = pagedata;
                Session.pageResponsitory[this.configuration.name || configuration.file] = JSON.parse(JSON.stringify(pagedata));
                this.init();
            }).catch((error) => {
                UI.ShowError(error)
            })

        }
        async init(){
            let that = this;
            let id = 'page_'+UI.generateUUID();
            this.id = id;
            UI.Log("Initialize", this.configuration.initcode,Session.snapshoot.sessionData)
            if(this.configuration.initcode){

                await this.executeTransaction(this.configuration.initcode,Session.snapshoot.sessionData , function(response){
                    UI.Log("onInitialize:",response)
                    let responsedata = JSON.parse(response);
                  //  Session.snapshoot.sessionData =  Object.assign({},Session.snapshoot.sessionData, responsedata.Outputs);
                    that.updatesession(responsedata.Outputs)
                }, function(error){
                    UI.ShowError(error)
                });   
                await this.create();
            }else{
                await this.create();
            }
            
            
        }
        async create(){
            let that = this;
            if(this.configuration.lngcode){
                let data = await UI.translatebycodes([this.configuration.lngcode], function(data){
                    UI.Log("translate page title:",data)
                    
                    if(data && data.hasOwnProperty(that.configuration.lngcode)){
                        let title = data[that.configuration.lngcode];
                        for(var key in Session.snapshoot.sessionData){
                            //  UI.Log(key, this.configuration.title)
                            title = title.replaceAll('{'+key+'}' , Session.snapshoot.sessionData[key])
                        }

                        that.configuration.title = title;
                        that.PageTitle = title;
                        document.title = title;
                    }
                },
                function(error){
                    UI.ShowError(error)
                })               

                /*
                .then((data) => {
                    UI.Log("translate page title:",data)
                    if(data && data.length > 0){
                        this.configuration.title = data[0].text;
                        this.PageTitle = data[0].text;
                    }
                })  */
            }
            this.configuration.title = this.configuration.title || this.configuration.name || '';     
  
            if(this.configuration.onloadcode){

                await this.executeTransaction(this.configuration.onloadcode,Session.snapshoot.sessionData, function(response){
                    let responsedata = JSON.parse(response);
                    //  Session.snapshoot.sessionData =  Object.assign({},Session.snapshoot.sessionData, responsedata.Outputs);
                      that.updatesession(responsedata.Outputs)
                      
                }, function(error){
                     UI.ShowError(error)
                });   
                //await that.loadtrantypedata()
            }
            //else
            //    await this.loadtrantypedata()
            await this.loadtrantypedata();
            await this.load();

        }
        async loadtrantypedata(){
            UI.Log("load trantype data"), this.configuration
            if(this.configuration.trantype == "workflow"){
                await this.getworkflowtaskdata();
             //   await this.load()
            }
            //else
            //    await this.load()
        }
        async load(){            
            
               
            // UI.Log(this.configuration)
            let id = this.id;
            let page =null;
            let pagediv = document.getElementsByClassName("iac-ui-page-header");
            let width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
            let height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
            if(pagediv.length == 0 ){
                let pageid = 'page_'+UI.generateUUID();
                page = document.createElement("div");
                page.className = "ui-page";                
                page.setAttribute("id", pageid); 
                for (var key in this.configuration.attrs) {
                    page.setAttribute(key, this.configuration.attrs[key]);
                }               
                
                page.style.width = width + "px";
                page.style.height = height + "px";
                page.style.display = "flex";
                page.style.flexWrap = "nowrap";
                page.style.overflow = "hidden";
                page.style.alignItems = "flex-start";
                page.style.flexDirection = "column";
                page.id = pageid;
                document.body.appendChild(page);
            }
            else
                page = pagediv[0];
            
            this.container = page;
            this.page = page;

            this.configuration.attrs = this.configuration.attrs || {};
            this.configuration.orientation = this.configuration.orientation || 0;
           
            let pagecontent = document.createElement("div");
            pagecontent.setAttribute("id", id);
            pagecontent.className = "ui-page-content";
            pagecontent.style.width = "100%";
            pagecontent.style.height = (height-45) + "px";
            pagecontent.style.overflow = "auto";
            pagecontent.style.display = "flex";
            pagecontent.style.flexWrap = "nowrap";
            pagecontent.style.alignItems = "flex-start";
            switch (this.configuration.orientation) {                
                case 0:
                case "0":
                    pagecontent.style.flexDirection = "column";
                    break;
                case 1:
                case "1":
                    pagecontent.style.flexDirection = "row";
                    break;
                case 3:
                case "3":
                    pagecontent.style.flexDirection = "floating";
                default:
                    pagecontent.style.flexDirection = "column";
                    break;
            }
            this.page.element = pagecontent;
            this.pageElement = pagecontent;
            page.appendChild(pagecontent);
         //   document.title = this.configuration.title || this.configuration.name;
            this.buildpagepanels();
            

            this.PageID = id;
            this.PageTitle = this.configuration.title || this.configuration.name;

           // UI.Log(Session.snapshoot.sessionData,this.configuration.title)
            for(var key in Session.snapshoot.sessionData){
              //  UI.Log(key, this.configuration.title)
              this.PageTitle = this.PageTitle.replaceAll('{'+key+'}' , Session.snapshoot.sessionData[key])
            }
            document.title = this.PageTitle ;


            Session.pages[this.id] = this;
            Session.CurrentPage = this;
            /*
            if(this.configuration.name == "IAC Home" && (Session.snapshoot.sessionData.menu_parentid == "" 
                || Session.snapshoot.sessionData.menu_parentid == undefined || Session.snapshoot.sessionData.menu_parentid == null 
                || Session.snapshoot.sessionData.menu_parentid == "0" )){
               
                Session.clearstack();
            } */
            
            if(!this.refresh){

                let stackitem = Session.createStackItem(this);               
                UI.Log("push to stack:",stackitem)    
                Session.pushToStack(stackitem);                                
            }
            
            this.pageheader = new Pageheader(page)

            this.setevents();

            return page;
        }
        buildpagepanels(){
            this.page.panels = [];

            for (let i = 0; i < this.configuration.panels.length; i++) {
                let panel = new Panel(this,this.configuration.panels[i]);
                this.page.panel = panel.create();
                this.panels.push(panel);
            }
        }
        async getworkflowtaskdata(){
            let that = this;
            let taskid = Session.snapshoot.sessionData.workflow_taskid;
            if(taskid == null || taskid == 0)
                return;

            let inputs ={
                data: {
                    taskid: taskid
                }
            }
            UI.Log("load the workflow pretask data", inputs)
            await UI.Post("/workflow/pretaskdata", inputs, function(response){
                let data = JSON.parse(response);
                UI.Log("the task pretaskdata is:", data)

                that.updatesession(data.data)
            }, function(err){
                UI.ShowError(err)
            })
        }
        updatesession(data){
            Session.snapshoot.sessionData =  Object.assign({},Session.snapshoot.sessionData, data);
        }
        async executeTransaction(Code, inputs, func, fail){
            UI.CallTranCode(Code, "", inputs, func, fail);

        }
        Refresh(){
           this.clear();
           new Page(this.configuration,this.id);
        }
        popupOpen(view) {
            this.popupClose();
            if (!this.popup) {
                this.popup = new UI.Popup(this.container);
                this.initializePopup(view);
                this.popup.onClose(() => {
                    this.clearPopup();
                });
            }
        //    this.popup.title = view.title;
            this.popup.open();
            if($('.iac-ui-popup-title').html() ==""){
            let safeId = UI.safeId(POPUP_PANEL_ID);
                UI.Log("popup panel:",$('.iac-ui-popup-title'), safeId, Session.panels[safeId].view)
                if(Session.panels.hasOwnProperty(safeId)){
                    let popupview = Session.panels[safeId].view;
                    UI.Log("popup panel:",popupview, safeId, Session.panels[safeId].view, popupview.configuration.title, popupview.configuration.lngcode)
                    $('.iac-ui-popup-title').html(popupview.configuration.title);
                    $('.iac-ui-popup-title').attr("lngcode",popupview.configuration.lngcode);
                }  
            }
        }
        popupClose() {
            if (this.popup)
                this.popup.close();
            this.popup = null;

            if(Session.panels.hasOwnProperty(POPUP_PANEL_ID)){
                delete Session.panels[POPUP_PANEL_ID];
            }
            
        }
        initializePopup(view) { 
            if(typeof view == "string"){
                view = {
                    "name":view,
                    "type":"document"};
            }
            if($('#'+ POPUP_PANEL_ID).length == 0){  
                const panel = new Panel(this,{
                    "name": POPUP_PANEL_ID, 
                    "view": view});
                panel.create(true);
                this.panels.push(panel);
            }
        }
        clearPopup() {
            if (this.popup)
                this.popup.close();
            this.popup = null;
        }
        back(){
            if(Session.stack.length > 1){
                let stackitem = Session.popFromStack();
                stackitem = Session.popFromStack();                

                UI.Log("page back action:", stackitem)
            
                if(!stackitem)
                    return;
                
                if(stackitem.CurrentPage)
                    new Page(stackitem.CurrentPage.configuration);
                    
            }
        }
        home(){
            if(this.configuration.name == "IAC Home")
                return;
            this.clear();
            Session.snapshoot.sessionData={};
            Session.snapshoot.sessionData.menu_title = "IAC Home";
            Session.snapshoot.sessionData.menu_parentid = "0";
            Session.clearstack();
            Session.pages = {};
            Session.panels ={};
            Session.views = {};
            new Page({"name":"Portal Menu"});
        }
        clear(){
            /*this.page.innerHTML = ""; */       
            
            let that =this;
            this.panels.forEach((panel) => {
                panel.clear();
            }); 
            window.removeEventListener("resize", that.resize)
            this.pageElement.remove();
            this.pageElement = null;
            //document.getElementById(this.id).remove();
            this.panels = [];
            this.page={};
        }  
        setevents(){
            // UI.Log('set events')
            let that = this;
            window.addEventListener("resize", that.resize)
        }
        resize(){
         //   // UI.Log('start to resize')
            let width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
            let height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
            $('.ui-page').css('width',width+'px');
            $('.ui-page').css('height',height+'px');
            $('.ui-page-content').css('width',width+'px');
            $('.ui-page-content').css('height',(height-45)+'px');
        }

    }
    UI.Page = Page;

    class Pageheader{
        constructor(root){
            this.root = root;
            // UI.Log('create header for page:',root)
            this.element = this.getHeaderContainer();
            this.headerBreadcrumbs();
            this. headerMenuActions();
        }
        removeHeader() {
            let list = this.root.getElementsByClassName("iac-ui-page-header");
            if (list.length !== 0) {
                let p = list[0].parentElement;
                if (p)
                    p.removeChild(list[0]);
            }
        }
        createEl(tag, className = "", textContent = "") {
            const element = document.createElement(tag);
            if (className)
                element.className = className;
            if (textContent)
                element.textContent = textContent;
            return element;
        }
        createElAndAppend(parent, tag, className = "", textContent = "") {
            const element = this.createEl(tag, className, textContent);
            parent.appendChild(element);
            return element;
        }
        getHeaderContainer() {
            let root = this.root;
            let list = root.getElementsByClassName("iac-ui-page-header");
            if (list.length === 0) {
                let header = this.createEl("div", "iac-ui-page-header");
                let headerLeft = this.createElAndAppend(header, "div", "iac-ui-page-header-left");
                let headerCenter = this.createElAndAppend(header, "div", "iac-ui-page-header-center");
                this.createElAndAppend(headerLeft, "span", "iac-ui-icon-logo");
                this.createElAndAppend(headerLeft, "span", "iac-app-name").innerHTML = `<b>IACF</b>`;
                this.headercrumbs = this.createElAndAppend(headerLeft, "span", "iac-ui-crumbs");
                
                this.createElAndAppend(headerCenter, "span", "iac-ui-header-searchIcon");

                let headerRight = this.createElAndAppend(header, "div", "iac-ui-page-header-right");
                this.headerClock = this.createElAndAppend(headerRight, "span", "iac-ui-header-clock clock");
                this.headerUserinfo = this.createElAndAppend(headerRight, "span", "iac-ui-header-userinfo");
                this.headerUserimage = this.createElAndAppend(headerRight, "span", "iac-ui-header-userimage"); 
                this.headerNotification = this.createElAndAppend(headerRight, "span", "iac-ui-header-notification");                               
                this.headerMenuicon = this.createElAndAppend(headerRight, "span", "iac-ui-header-menuIcon");
                root.insertBefore(header, root.firstChild);
                this.rightElementRenderer();
                return header;
            }
            else{
                this.headercrumbs = root.getElementsByClassName("iac-ui-crumbs")[0];
                this.headerMenuicon = root.getElementsByClassName("iac-ui-header-menuIcon")[0];
                return list[0];
            }
        }
        rightElementRenderer(){
            
            this.clockRenderer();
            this.userInfoRenderer();
            this.headerNotificationRenderer();    
            
        };
        
        getUserLocalTime(offset, culture) {
            let d = new Date();
            let utc = d.getTime() + d.getTimezoneOffset() * 60000;
            let nd = new Date(utc + offset);
            let formatedTime = nd.toLocaleTimeString(culture);
            return formatedTime;
        }
        getClientLocalTime(){
            let d = new Date();
            return d.toLocaleTimeString();
        }
        clockRenderer(){
            let interval = null;
            let that = this;
            let init = true;
                // UI.Log('clock renderer:', init)
                if (init) {
                    
                    let element = that.createElAndAppend(this.headerClock,"span", "iac-ui-header-clock clock");
                    let updateTime = () => {                       
                        element.textContent = that.getClientLocalTime();
                    };
                    updateTime();
                    interval = setInterval(updateTime, 1000);
                    return element;
                }
                else {
                    clearInterval(interval);
                }
        
        };
        headerNotificationRenderer(){
            let that = this;
            let init = true;
            if (init) {
                    let element = that.createElAndAppend(this.headerNotification, "span", "iac-ui-header-notification");
                    element.id = "iac-ui-header-notification";

                    let notificationdiv = that.createElAndAppend(element, "div", "iac-ui-header-notification-div");
                    let icon = that.headerIconRender("notification", "notification.png");
                    notificationdiv.appendChild(icon);
                    let notificationbadge = that.createElAndAppend(notificationdiv, "span", "iac-ui-header-notification-count");
                    notificationbadge.id = "iac-ui-header-notification-count"
                 //   notificationbadge.textContent ="0";
                 //   notificationbadge.style.display = "none";
                    
                    let notifications = UI.Notifications.getData()
                    let newnotificationcount = 0 ;            
                    for(var key in notifications.data){
                        let notification = notifications.data[key];
                        if(notification.status != 4 && 
                            notification.sender != UI.userlogin.username &&
                            (
                            ( notification.receipts.hasOwnProperty(UI.userlogin.username) && notification.receipts[UI.userlogin.username] == 1)
                            || (notification.receipts.hasOwnProperty("all") && !notification.receipts.hasOwnProperty(UI.userlogin.username) )
                            || (notification.receipts.hasOwnProperty("") && !notification.receipts.hasOwnProperty(UI.userlogin.username) ))){
                            newnotificationcount++;
                        }                       
                    };

                    notificationbadge.textContent = newnotificationcount;
                    notificationbadge.setAttribute("count", newnotificationcount);
                    if(newnotificationcount > 0){                            
                        notificationbadge.style.display = "block";
                    }else{
                        notificationbadge.style.display = "none";
                    }

                    icon.addEventListener("click", function(){
                        let height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
                        let container = document.createElement("div");
                        container.id = "iac-ui-notification-container"
                        container.style.display = "flex";
                        container.style.flexDirection = "column";
                        container.style.alignItems = "flex-start";
                        container.style.justifyContent = "flex-start";
                        container.style.minWidth = "450px";
                        container.style.maxWidth = "500px";
                        container.style.minHeight = "200px";
                        container.style.height = (height - 60) + "px"
                        container.style.backgroundColor = "white";
                        container.style.overflow = "auto";
                        that.createElAndAppend(container, "h2", "iac-ui-header-notification-title", "Notifications")

                        let newnotificationcount = that.notificatonsRender(container)
                     /*   notificationbadge.textContent = newnotificationcount;
                        if(newnotificationcount > 0){                            
                            notificationbadge.style.display = "block";
                        }else{
                            notificationbadge.style.display = "none";
                        }
                        */
                        let chatbox = that.createElAndAppend(container, "div", "iac-ui-header-notification-chatbox");
                        chatbox.addEventListener('click', function(event) {
                            // Prevent the click event from propagating to the parent
                            event.stopPropagation();
                        
                        });

                        let chatboxtopic= that.createElAndAppend(chatbox, "input", "iac-ui-header-notification-chatbox-topic");
                        chatboxtopic.placeholder = "Enter topic here"
                        let chartreceiptscontainer = that.createElAndAppend(chatbox, "div", "iac-ui-header-notification-chatbox-receipts-container");
                        chartreceiptscontainer.style.display = "-webkit-flex";
                        chartreceiptscontainer.style.webkitFlexDirection = "row";
                        chartreceiptscontainer.style.webkitFlexWrap = "wrap";
                        chartreceiptscontainer.style.webkitAlignItems = "flex-start";
                        chartreceiptscontainer.style.webkitJustifyContent = "flex-start";
                        chartreceiptscontainer.style.flexShrink = "0";
                        let chatreceipts = that.createElAndAppend(chartreceiptscontainer, "input", "iac-ui-header-notification-chatbox-receipts");
                        chatreceipts.type = "text";
                        chatreceipts.placeholder = "Enter receipter separated by ;"
                        chatreceipts.id = "iac-ui-header-notification-chatbox-receipts"
                        chatreceipts.style.height = "30px"
                        
                    //    let chatreceiptstokencontainer = that.createElAndAppend(chartreceiptscontainer, "div", "iac-ui-header-notification-chatbox-receipts-token-container");
                    //    chatreceiptstokencontainer.id = "iac-ui-header-notification-chatbox-receipts-token-container"

                        let chatboxinput = that.createElAndAppend(chatbox, "textarea", "iac-ui-header-notification-chatbox-input");
                        chatboxinput.placeholder = "Enter message here"

                        let actionsection = that.createElAndAppend(chatbox, "div", "iac-ui-header-notification-chatbox-action-section");
                        actionsection.style.display = "-webkit-flex";
                        actionsection.style.webkitFlexDirection = "row";
                        actionsection.style.webkitFlexWrap = "wrap";
                        actionsection.style.justifyContent = "space-around";
                        actionsection.style.alignItems = "center";
                        let chatboxbutton = that.createElAndAppend(actionsection, "button", "iac-ui-header-notification-chatbox-button");                        
                        that.createElAndAppend(chatboxbutton, "span", "", "Send");
                        let privatelabel = that.createElAndAppend(actionsection, "span", "","Private:");
                        privatelabel.htmlFor = "iac-ui-header-notification-chatbox-chekbox";
                        privatelabel.style.color ="black"
                        let privatecheckbox = that.createElAndAppend(actionsection, "input", "iac-ui-header-notification-chatbox-chekbox");  
                        privatecheckbox.id = "iac-ui-header-notification-chatbox-chekbox";
                        privatecheckbox.type = "checkbox";
                        privatecheckbox.checked = false;
                        let chatboxbuttoncancel = that.createElAndAppend(actionsection, "button", "iac-ui-header-notification-chatbox-button-cancel");
                        that.createElAndAppend(chatboxbuttoncancel, "span", "", "Clear");
                        chatboxbuttoncancel.addEventListener("click", function(){
                            chatboxtopic.value = "";
                            chatreceipts.value = "";
                            chatboxinput.value = "";
                            $('.iac-ui-chatbox-receipters-token').remove();
                        })

                        chatreceipts.addEventListener("keyup", function(event) {
                            if (event.keyCode === 13) {
                                event.preventDefault();
                                chatboxbutton.click();
                            }
                            if (event.key === ';' || event.keyCode === 186 || event.keyCode === 59) {
                                const inputField = document.getElementById('iac-ui-header-notification-chatbox-receipts');
                                const tokenContainer = document.getElementById('iac-ui-header-notification-chatbox-receipts-token-container');
                                const inputValue = inputField.value.trim();
                                if (inputValue === '') {
                                    alert('Please enter a value');
                                    return;
                                }
                                const tokens = inputValue.split(';');
                                tokens.forEach(token => {
                                    if(token.trim() != ""){
                                        const option = that.createToken(token);                                    
                                        chartreceiptscontainer.appendChild(option);
                                    }
                                });

                                inputField.value = '';

                            }
                        });

                        chatboxbutton.addEventListener("click", function(){
                            let topic = chatboxtopic.value;
                            let receipts = chatreceipts.value.split(';');
                            for(var i=0;i<$('.iac-ui-chatbox-receipters-token-value').length;i++){
                                receipts.push($('.iac-ui-chatbox-receipters-token-value')[i].textContent)
                            }

                            let receiptobj = {}
                            let privatemessage = document.querySelector(".iac-ui-header-notification-chatbox-chekbox").checked;
                            for(var i=0;i<receipts.length;i++){
                                if(receipts[i].trim() != "")
                                    receiptobj[receipts[i]] = 1;
                            }
                            if(receipts.length == 0 && !privatemessage)
                                receiptobj ={
                                    "all": 1
                            }
                            
                            let message = chatboxinput.value;
                            let notifdata = {
                                "uuid": UI.generateUUID(),
                                "topic": topic,
                                "receipts": receiptobj, 
                                "private": privatemessage,                               
                                "status": 1,
                                "message": message,
                                "sender": UI.userlogin.username,
                                "system.createdon": new Date().toISOString(),
                                "system.createdby": UI.userlogin.username,
                                "system.updatedon": new Date().toISOString(),
                                "system.updatedby": UI.userlogin.username,
                                "histories":[{
                                    "updatedby": UI.userlogin.username,
                                    "updatedon": new Date().toISOString(),
                                    "status": 1,
                                    "comments": "New Notification"
                                }]
                            }
                            let data = {
                                data: notifdata
                            }
                            UI.Post("/notification/new", data, function(response){
                                UI.Log("send notification:",response)

                                if (!IACMessageBusClient)
                                    IACMessageBusClient = new IACMessageClient();

                                IACMessageBusClient.Publish("IAC_SYSTEM_NOTIICATION", data);

                                chatboxtopic.value = "";
                                chatreceipts.value = "";
                                chatboxinput.value = "";
                                $('.iac-ui-chatbox-receipters-token').remove();

                            }, function(error){
                                UI.ShowError(error)
                            })
                            //UI.Notifications.send(topic, receipts, message);
                        })
                        let popup = UI.ContextPopup.createPopup(container);
                        
                    //    popup.element = list
                        element.appendChild(popup.element);
                      //  UI.Log("select the notification,",list, popup)
                        popup.open();
                        document.querySelector(".iac-ui-header-popup").style.maxWidth = "500px";
                        document.querySelector(".triangle").style.left = "430px"
                        document.querySelector(".iac-ui-header-popup").style.transform = "translateX(-430px)";
                        
                    })   
                    that.headerNotification.appendChild(element);                
                    return element;
            }
        }
        createToken(value){
            const tokenContainer = document.createElement('div');
            tokenContainer.className = 'iac-ui-chatbox-receipters-token';

            const tokenValue = document.createElement('span');
            tokenValue.className = 'iac-ui-chatbox-receipters-token-value';
            tokenValue.textContent = value;

            const removeToken = document.createElement('span');
            removeToken.className = 'iac-ui-chatbox-receipters-remove-token';
            removeToken.innerHTML = '&#10006;'; // Cross symbol
            removeToken.onclick = function () {
                tokenContainer.remove();
            };

            tokenContainer.appendChild(tokenValue);
            tokenContainer.appendChild(removeToken);

            return tokenContainer;
        }
        notificatonsRender(container){
            let that = this
            let height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
            let list = document.createElement("ul");
            list.style.height = (height - 215) + "px"
            list.style.overflowY = "auto"
            list.style.overflowX = "hidden"
            list.style.flexDirection = "column"
            list.id = 'iac-ui-notification-list'

            let notifications = UI.Notifications.getData()
            let newnotificationcount = 0 ;            
            for(var key in notifications.data){
                let notification = notifications.data[key];
                if(notification.status != 4 && (
                    ( notification.receipts.hasOwnProperty(UI.userlogin.username) && notification.receipts[UI.userlogin.username] == 1)
                    || (notification.receipts.hasOwnProperty("all") && !notification.receipts.hasOwnProperty(UI.userlogin.username)  ))){
                    newnotificationcount++;
                }
                that.addNotification(notification,list)
            };
                       
            container.appendChild(list);
            return newnotificationcount
        }
        addNotificationHistoryItem(history, historyul, notification){
            let that = this
            UI.Log(history, historyul, notification)
            let historyitemcontainer = that.createElAndAppend(historyul,"div","iac-ui-notification-history-item-container") 
            historyitemcontainer.display = "-webkit-flex";
            historyitemcontainer.webkitFlexDirection = "column";
            historyitemcontainer.webkitFlexWrap = "wrap";
            historyitemcontainer.justifyContent = "space-around";
            let historyitem = that.createElAndAppend(historyitemcontainer,"li")

            historyitem.style.width = "410px"
            historyitem.style.height= "max-content"                        
            historyitem.style.borderTop = "1px solid blue"
        //    let historyitema = that.createElAndAppend(historyitem, "a");

            var utcDateString = history["updatedon"];
            var utcDate = new Date(utcDateString);
                    // Convert to local date and time
            var localDateString = utcDate.toLocaleDateString();
            var localTimeString = utcDate.toLocaleTimeString();

            let dtsection = that.createElAndAppend(historyitem, "div", "");
            
            dtsection.style.display = "-webkit-flex";
            dtsection.style.webkitFlexDirection = "row";

            that.createElAndAppend(dtsection, "span", "", localDateString);
            that.createElAndAppend(dtsection, "span", "", localTimeString);

            let respondericon = that.headerIconRender("user", "images/avatardefault.png","span")
            dtsection.appendChild(respondericon)
            that.createElAndAppend(dtsection, "span", "", history.updatedby);

            let replyaction = that.createElAndAppend(dtsection, "a", "iac-ui-notification-history-replay");
            replyaction.textContent = "Reply ->"
            replyaction.addEventListener("click",function(event){
                event.stopPropagation();
                let replysection = that.createElAndAppend(historyitem, "div", "iac-ui-notification-history-replay-section");
                replysection.style.display = "-webkit-flex";
                replysection.style.flexDirection = "column";
                replysection.style.flexWrap = "wrap";

                let replycontent = that.createElAndAppend(replysection, "textarea", "iac-ui-notification-history-replay-content");
                replycontent.style.width = "400px"
                replycontent.style.height = "100px"
                replycontent.style.marginLeft = "10px"
                replycontent.style.marginTop = "10px"

                let replybutton = that.createElAndAppend(replysection, "button", "iac-ui-notification-history-replay-button");
                replybutton.textContent = "Send"
                replybutton.addEventListener("click", function(event){
                    event.stopPropagation();
                    
                    let data = {
                        data: notification,
                        status:0,
                        comments: replycontent.value,
                        replyer: UI.userlogin.username,
                        updatedon: new Date().toISOString(),
                    }
                    UI.Post("/notification/response", data, function(response){
                        UI.Log("reply notification:",response)

                        replysection.remove()
                     //   replybutton.remove();

                        if (!IACMessageBusClient)
                            IACMessageBusClient = new IACMessageClient();

                        IACMessageBusClient.Publish("IAC_SYSTEM_NOTIICATION_REPLY", data);

                    }, function(error){
                        UI.ShowError(error)
                    })
                })
            })

            that.createElAndAppend(historyitem, "div", "", history.comments);
        }
        addNotification(notification,list){
            let that = this;
            let msgcontainer = that.createElAndAppend(list, "div", "iac-ui-notification-container");
            msgcontainer.style.display = "-webkit-flex";
            msgcontainer.style.webkitFlexDirection = "column";
            msgcontainer.style.webkitFlexWrap = "wrap";
            msgcontainer.style.justifyContent = "space-around";
            msgcontainer.setAttribute("datakey",notification.uuid);

            
            UI.Log(notification)
            let li = that.createElAndAppend(msgcontainer, "li");
            li.style.width = "440px"
            li.style.height ="fit-content"
            li.style.overflow = "hidden"
            li.style.borderBottom = "2px solid burlywood"
                    //    let a = that.createElAndAppend(li, "a");
            let itemheader = that.createElAndAppend(li, "div", "iac-ui-notification-header");
            itemheader.style.display = "-webkit-flex";
            itemheader.style.webkitFlexDirection = "row";
            
                    var utcDateString = notification["system.createdon"];
                    var utcDate = new Date(utcDateString);
                                 // Convert to local date and time
                    var localDateString = utcDate.toLocaleDateString();
                    var localTimeString = utcDate.toLocaleTimeString();
                        let dtsection = that.createElAndAppend(itemheader, "div", "");
                        that.createElAndAppend(dtsection, "span", "", localDateString);
                        that.createElAndAppend(dtsection, "span", "", localTimeString);

                        let sendericon = that.headerIconRender("user", "images/avatardefault.png", "span");
                        itemheader.appendChild(sendericon)                            
                        that.createElAndAppend(itemheader, "span", "", notification.sender);

                        //that.createElAndAppend(a, "span", "", notification);
            let item = that.createElAndAppend(li, "span", "", notification.topic);
                        item.style.webkitFlexWrap = "wrap";
                        item.style.flexWrap = "wrap";
            
            let itemaction = that.createElAndAppend(li, "div", "iac-ui-notification-action");
                        itemaction.style.display = "-webkit-flex";
                        itemaction.style.webkitFlexDirection = "row";
                        itemaction.style.webkitFlexWrap = "wrap";
                        itemaction.style.justifyContent = "space-around";
                        itemaction.style.alignItems = "center";
                        let messageaction = that.createElAndAppend(itemaction, "a", "iac-ui-notification-action-message");
                        messageaction.textContent = "Message ->";
                        messageaction.setAttribute("lngcode", "Message");
                       

                        let historyaction = that.createElAndAppend(itemaction, "a", "iac-ui-notification-action-history");
                        historyaction.textContent = "History ->";
                        historyaction.setAttribute("lngcode", "History");

                        let chatmodeaction = that.createElAndAppend(itemaction, "a", "iac-ui-notification-action-history");
                        chatmodeaction.textContent = "Chat Mode ->";
                        chatmodeaction.setAttribute("lngcode", "ChatMode");

                        if(notification.sender != UI.userlogin.username && notification.status < 3){
                            let ackaction = that.createElAndAppend(itemaction, "a", "iac-ui-notification-action-close");
                            ackaction.textContent = "Acknowledge ->";
                            ackaction.setAttribute("lngcode", "Acknowledge");
                            ackaction.addEventListener("click", function(event){
                                event.stopPropagation();
    
                                let notificationdata = {
                                    data: notification,
                                    status:3,
                                    comments: 'acknowledge notification'
                                }
                                UI.Post("/notification/response", notificationdata, function(response){
                                    UI.Log("acknowledge notification:",response)
    
                                    if (!IACMessageBusClient)
                                        IACMessageBusClient = new IACMessageClient();
    
                                        IACMessageBusClient.Publish("IAC_SYSTEM_NOTIICATION_CLOSE", notificationdata);
    
                                    }, function(error){
                                        UI.ShowError(error)
                                })
                            })  
                        }
                        if(notification.status < 4){
                            let closeaction = that.createElAndAppend(itemaction, "a", "iac-ui-notification-action-close");
                            closeaction.textContent = "Close ->";
                            closeaction.setAttribute("lngcode", "Close");

                            closeaction.addEventListener("click", function(event){
                                event.stopPropagation();
                                let notificationdata = {
                                    data: notification,
                                    status:4,
                                    comments: 'close notification'
                                }
                                UI.Post("/notification/response", notificationdata, function(response){
                                    UI.Log("close notification:",response)
                                    
                                    if (!IACMessageBusClient)
                                        IACMessageBusClient = new IACMessageClient();

                                    IACMessageBusClient.Publish("IAC_SYSTEM_NOTIICATION_CLOSE", notificationdata);

                                }, function(error){
                                    UI.ShowError(error)
                                })
                            })
                          
                        }
                     //   item.textContent = notification.topic;    
                     //   let content = that.createElAndAppend(li, "span", "", notification.message);                        
                       // content.textContent = notification.message;
                        let contentsection = that.createElAndAppend(li, "div", "iac-ui-notification-content");
                        contentsection.style.display = "none"
                        contentsection.innerHTML = notification.message;                        
                        contentsection.style.display = "contents"
                        contentsection.style.textWrap = "pretty"
                        contentsection.style.position = "relative"
                        contentsection.style.left = "10px"
                        contentsection.style.marginLeft = "10px"
                        
                        let historysection = that.createElAndAppend(li, 'div','iac-ui-notification-history')
                        historysection.style.display = "none"
                        historysection.style.position = "relative"
                        historysection.style.left = "20px"
                        historysection.style.marginLeft = "20px"

                        let historyul = that.createElAndAppend(historysection, "ul")
                        historyul.style.webkitBoxShadow = "none";
                        historyul.style.boxShadow = "none";
                        historyul.id = "iac-ui-notification-history-ul-"+notification.uuid
                        
                    if(notification.hasOwnProperty("histories")){
                        UI.Log(notification["histories"])
                        for(var i=0;i< notification["histories"].length; i++)
                        {
                            let history = notification["histories"][i]
                            UI.Log(i, history, historyul)
                            that.addNotificationHistoryItem(history, historyul, notification)
                        }
                    }
                        
                        messageaction.addEventListener("click", function(event){
                            event.stopPropagation();
                            if(contentsection.style.display == "none")
                                contentsection.style.display = ""
                            else{
                                contentsection.style.display = "none"
                            }
                        })

                        historyaction.addEventListener('click', function(event){
                            event.stopPropagation();
                            
                            if(historysection.style.display == "none")
                                historysection.style.display = ""
                            else{
                                historysection.style.display = "none"
                            }
                        })

                        chatmodeaction.addEventListener('click', function(event){
                            event.stopPropagation();
                            that.chatboxRender(notification)
                        })

                        li.addEventListener("click", function(event){
                            event.stopPropagation();
                        })
                        $('.iac-ui-notification-content').hide();
        }
        chatboxRender(notification){
            let that = this
            let height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
            let container = document.createElement("div");
            container.id = "iac-ui-chat-container"
            container.style.display = "flex";
            container.style.flexDirection = "column";
            container.style.alignItems = "flex-start";
            container.style.justifyContent = "flex-start";
            container.style.minWidth = "450px";
            container.style.maxWidth = "500px";
            container.style.minHeight = "200px";
            container.style.height = (height - 60) + "px"
            container.style.backgroundColor = "white";
            container.style.overflow = "auto";
            container.style.border = "1px solid darkgrey";
            container.addEventListener('click', function(event) {

                // Prevent the click event from propagating to the parent
                event.stopPropagation();
            });

            that.createElAndAppend(container, "h3", "iac-ui-chat-container-title", notification.topic)

            
            let chatlist = that.createElAndAppend(container, "ul", "iac-ui-chat-container-list");
            chatlist.id = "iac-ui-chat-container-list-" + notification.uuid;
            chatlist.style.display = "flex";
           // chatlist.style.webkitFlexDirection = "column";
           // chatlist.style.webkitFlexWrap = "wrap";
            chatlist.style.justifyContent = "flex-start";
            chatlist.style.alignContent = "flex-start";
            chatlist.style.flexShrink = "0";
            chatlist.style.height = (height - 200) + "px"
            chatlist.style.overflowY = "auto";
            chatlist.style.overflowX = "hidden";
            chatlist.style.flexFlow = "wrap";

            if(notification.hasOwnProperty("histories")){
                for(var i=0;i< notification["histories"].length; i++){
                    let history = notification["histories"][i]
                    if(i==0)
                        history.comments = notification.message;

                    that.addchatitem(history, chatlist)
                }
            }

            let inputsection = that.createElAndAppend(container, "div", "iac-ui-chat-container-input-section");
            inputsection.style.display = "-webkit-flex";
            inputsection.style.webkitFlexDirection = "row";
            let chatinput = that.createElAndAppend(inputsection, "textarea", "iac-ui-chat-container-input");
            chatinput.style.width = "450px"
            chatinput.style.height = "100px"
            chatinput.style.marginLeft = "1px"
            chatinput.style.marginTop = "5px"
            let sendbutton = that.createElAndAppend(inputsection, "button", "iac-ui-chat-container-input-button", "Send");
            sendbutton.addEventListener("click", function(event){
                event.stopPropagation();
                notification = UI.Notifications.getData().data[notification.uuid]
                let data = {
                    data: notification,
                    status:0,
                    comments: chatinput.value,
                    replyer: UI.userlogin.username,
                    updatedon: new Date().toISOString(),
                }
                UI.Post("/notification/response", data, function(response){
                    UI.Log("reply notification:",response)

                    chatinput.value = "";

                    IACMessageBusClient.Publish("IAC_SYSTEM_NOTIICATION_REPLY", data);

                }, function(error){
                    UI.ShowError(error)
                })
            })
            chatinput.addEventListener("keyup", function(event) {
                if (event.keyCode === 13) {
                    event.preventDefault();
                    sendbutton.click();
                }
            })

            let popup = UI.ContextPopup.createPopup(container);
            let element = document.getElementById('iac-ui-header-notification')                        
                    //    popup.element = list
            element.appendChild(popup.element);
                      //  UI.Log("select the notification,",list, popup)
            popup.open();
            document.querySelector(".iac-ui-header-popup").style.maxWidth = "500px";
            document.querySelector(".triangle").style.left = "430px"
            document.querySelector(".iac-ui-header-popup").style.transform = "translateX(-430px)";
        }
        addchatitem(history, chatlist){
            let that = this
            let itemsection = that.createElAndAppend(chatlist, "div", "iac-ui-chat-container-list-item-section");
            itemsection.style.display = "-webkit-flex";
            itemsection.style.width = "100%"
            let chatitem = that.createElAndAppend(itemsection, "li", "iac-ui-chat-container-list-item");
            chatitem.style.display = "-webkit-flex";
            chatitem.style.webkitFlexDirection = "column";
            chatitem.style.webkitFlexWrap = "wrap";
            chatitem.style.flexWrap = "wrap";
            chatitem.style.width = "445px"
            chatitem.style.height = "max-content"
        //    chatitem.style.width = "445px"
            let content = history.comments;
            let dt = new Date(history.updatedon);
            
            if(history.updatedby == UI.userlogin.username){
                that.createElAndAppend(chatitem, "div", "iac-ui-chat-container-list-item-send-dt", dt.toLocaleDateString() + " " + dt.toLocaleTimeString());
                let contentsection = that.createElAndAppend(chatitem, "div", "iac-ui-chat-container-list-item-send-content");
                contentsection.style.display = "-webkit-flex";
                contentsection.style.webkitFlexDirection = "column";
                contentsection.style.webkitFlexWrap = "wrap";
                contentsection.style.flexFlow = "wrap";
                that.createElAndAppend(contentsection, "span", "iac-ui-chat-container-list-item-send-content", content);
                that.createElAndAppend(contentsection, "span", "iac-ui-chat-container-list-item-sender", "Me");
                let respondericon = that.headerIconRender("user", "images/avatardefault.png","span")
                contentsection.appendChild(respondericon)
                chatitem.style.alignItems = "flex-end";
                chatitem.style.justifyContent = "flex-end";
            }
            else{
                chatitem.style.alignItems = "flex-start";
                chatitem.style.justifyContent = "flex-start";
                that.createElAndAppend(chatitem, "div", "iac-ui-chat-container-list-item-send-dt", dt.toLocaleDateString() + " " + dt.toLocaleTimeString());

                let contentsection = that.createElAndAppend(chatitem, "div", "iac-ui-chat-container-list-item-send-content");
                contentsection.style.display = "-webkit-flex";
                contentsection.style.webkitFlexDirection = "column";
                contentsection.style.webkitFlexWrap = "wrap";
                contentsection.style.flexFlow = "wrap";
                let respondericon = that.headerIconRender("user", "images/avatardefault.png","span")
                contentsection.appendChild(respondericon)
                
                that.createElAndAppend(contentsection, "span", "iac-ui-chat-container-list-item-sender", history.updatedby);
                that.createElAndAppend(contentsection, "span", "iac-ui-chat-container-list-item-receive-content", content);
            }
        }
        headerIconRender(actionCode, imageUrl, tag = "a") {
            let element = this.createEl(tag);
            if (imageUrl) {
                let img = document.createElement("img");
                img.src = (actionCode != "user") ? ("Images/" + imageUrl) : imageUrl;
                element.appendChild(img);
            }
            element.className = actionCode;
            return element;
        }
        userInfoRenderer() {
            let that = this;
            let init = true;
                if (init) {
                    let userelement = that.createElAndAppend(this.headerUserinfo, "span", "iac-ui-header-userinfo");

                    if(UI.userlogin.username){
                        userelement.textContent = UI.userlogin.username;
                        let ajax = new UI.Ajax();
                        let element = that.headerIconRender("user", "images/avatardefault.png");
                        ajax.get(`../user/image?username=${UI.userlogin.username}`, function (data) {
                            let imageurl = JSON.parse(data);
                            // UI.Log(imageurl)
                                if (imageurl) {
                                    element.children[0].src = imageurl;
                                }
                            }, function (error) {
                                 UI.ShowError(error);
                            });

                            element.classList.add("iac-ui-header-action");
                            element.classList.add("active");

                            element.addEventListener("click", function(){
                                let list = document.createElement("ul");
                                let li = that.createElAndAppend(list, "li");
                                let a = that.createElAndAppend(li, "a");
                                const icon = that.headerIconRender("logout", "", "span");
                                icon.classList.add("iac-ui-header-action");
                                a.appendChild(icon);
                                let item = that.createElAndAppend(a, "span", "", "Logout");
                                item.textContent = "Logout";
                                item.setAttribute("lngcode", "Logout");    
                                li.addEventListener("click", function () {
                                    // UI.Log("logout")
                                    UI.userlogin.logout();
                                });
                                
                                let popup = UI.ContextPopup.createPopup(list);

                                element.appendChild(popup.element);
                               // UI.Log("select the notification,",list, popup)
                                popup.open();

                            })
                            this.headerUserimage.appendChild(element);
                    }
                    else{
                        userelement.textContent = "Guest";
                        let element = that.headerIconRender("user","images/avatardefault.png");
                        element.classList.add("iac-ui-header-action");
                        element.classList.add("active");
                        element.addEventListener("click", function(){
                            let list = document.createElement("ul");
                            let li = that.createElAndAppend(list, "li");
                            let a = that.createElAndAppend(li, "a");
                            const icon = that.headerIconRender("login", "", "span");
                            icon.classList.add("iac-ui-header-action");
                            a.appendChild(icon);
                            let item = that.createElAndAppend(a, "span", "", "Login");
                            item.textContent = "Login";
                            item.setAttribute("lngcode", "Login");    
                            li.addEventListener("click", function () {
                                
                                window.location.href = UI.userlogin.loginurl;
                            });
                            this.headerUserimage.appendChild(element);
                            let popup = UI.ContextPopup.createPopup(list);
                            // UI.Log(popup)
                            element.appendChild(popup.element);
                            //UI.Log("select the notification,",list, popup)
                            popup.open();
                        })
                    }
                //    return element;

                }

        };
        headerBreadcrumbs(){
            let list;
            let that = this;
            let init = true;
            let headerView;
            const createItem = (item, idx) => {
                let li = document.createElement("li");
                li.setAttribute("pageid",item.CurrentPage.PageID);
                li.title = item.CurrentPage.PageTitle;
                li.dataset["crumbs"] = idx++ + "";
                that.createElAndAppend(li, "span", "", item.CurrentPage.PageTitle);
                return li;
            };
            const crumbsFunc = (param) => {
                const stack = Session.stack;
                list.clearChilds();
                let idx = 0;
                stack.forEach(item => {
                    list.appendChild(createItem(item, idx++));
                });
             //   Apr.Breadcrumbs.init();
            };
            const viewFunc = (param) => {
                //headerView = app.layout.getCurrentView(SF.HeaderView.RENDERER_PANEL_ID);
            };
          //  return init => {
                if (init) {
                    let container = this.headercrumbs ;// that.createEl("div", "iac-ui-crumbs");
                    list = that.createElAndAppend(container, "ul");
                    const stack = Session.stack;
                    list.clearChilds();
                    let idx = 0;
                    stack.forEach(item => {
                        list.appendChild(createItem(item, idx++));
                    });
                   // list.appendChild(createItem(Session, idx++));

                    container.addEventListener("click", ev => {
                        let item = ev.target;
                        while (item.dataset["crumbs"] == null && item != container)
                            item = item.parentElement;
                        let idx = item.dataset["crumbs"];
                        if (idx !== undefined) {
                            let pageid = item.attributes["pageid"].value;
                            Session.popFromStack(idx);
                            let page = new UI.Page("",pageid);
                        }
                        // UI.Log("crumbs clicked:", item, idx);



                    });
                

                 //   app.onScreenLoad(crumbsFunc);
                 //   app.onScreenReady(viewFunc);
                 //   return container;
                }
              //  app.offScreenLoad(crumbsFunc);
              //  app.offScreenReady(viewFunc);
             //   headerView = null;
              //  Apr.Breadcrumbs.deinit();
         //   };
        };
        headerMenuActions(){


            let that = this;
            if(Session.stack.length > 1){
                if(that.root.getElementsByClassName("ui-page-header-icon-back").length ==0 ){
                    let element = that.createElAndAppend(this.headerMenuicon, "span","ui-page-header-icon-back");
                    element.classList.add("ui-page-header-icon-back");
                    element.addEventListener("click", function(){ Session.CurrentPage.back()})
                }
            }else if(that.root.getElementsByClassName("ui-page-header-icon-back").length > 0 ){
                let element = that.root.getElementsByClassName("ui-page-header-icon-back")[0];
                element.removeEventListener("click",   function(){ Session.CurrentPage.back()})
                element.remove();
            }

            if(Session.CurrentPage.configuration.name== "IAC Home"){
                if(that.root.getElementsByClassName("ui-page-header-icon-home").length >0 ){
                    let element2 = that.root.getElementsByClassName("ui-page-header-icon-home")[0];
                    element2.removeEventListener("click", function(){
                        // UI.Log("home clicked")
                        Session.CurrentPage.home();})
                    element2.remove();
                }
            } else{
                if(that.root.getElementsByClassName("ui-page-header-icon-home").length ==0 ){
                    let element2 = that.createElAndAppend(this.headerMenuicon, "a","ui-page-header-icon-home");
                    
                    element2.addEventListener("click", function(){
                        // UI.Log("home clicked")
                        Session.CurrentPage.home();})
                }
            }
        };
    }
    UI.Pageheader = Pageheader;

})(UI || (UI = {}));

  
(function (UI) {
    function startpage(pagefile){
        // UI.Log(pagefile);
        let page = new UI.Page({file:pagefile});

       /*
        let ajax = new UI.Ajax("");
        ajax.get(pagefile,false).then((response) => {
            // UI.Log(response)
            let page = new UI.Page(JSON.parse(response));

            //page.create();            
        }).catch((error) => {
            // UI.Log(error);
        })
        */
    }
    UI.startpage = startpage;
    function startbyconfig(configuration){
        
        let page = new UI.Page(configuration);
     
    }
    UI.startbyconfig = startbyconfig;


    
})(UI || (UI = {}));

/*
// UI.Log("UI loaded");
// UI.Log(UI.Ajax);
*/
