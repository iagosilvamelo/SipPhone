"use strict";var ctxSip;$(document).ready(function(){if(void 0===user&&(user=JSON.parse(localStorage.getItem("SIPCreds"))),!(ctxSip={config:{password:user.Pass,displayName:user.Display,uri:"sip:"+user.User+"@"+user.Realm,wsServers:user.WSServer,registerExpires:30,traceSip:!0,log:{level:0}},ringtone:document.getElementById("ringtone"),ringbacktone:document.getElementById("ringbacktone"),dtmfTone:document.getElementById("dtmfTone"),Sessions:[],callTimers:{},callActiveID:null,callVolume:1,Stream:null,formatPhone:function(t){var e;return 10===(e=(e=t.indexOf("@")?t.split("@")[0]:t).toString().replace(/[^0-9]/g,"")).length?"("+e.substr(0,3)+") "+e.substr(3,3)+"-"+e.substr(6,4):11===e.length?"("+e.substr(1,3)+") "+e.substr(4,3)+"-"+e.substr(7,4):e},startRingTone:function(){try{ctxSip.ringtone.play()}catch(t){}},stopRingTone:function(){try{ctxSip.ringtone.pause()}catch(t){}},startRingbackTone:function(){try{ctxSip.ringbacktone.play()}catch(t){}},stopRingbackTone:function(){try{ctxSip.ringbacktone.pause()}catch(t){}},getUniqueID:function(){return Math.random().toString(36).substr(2,9)},newSession:function(e){var t;e.displayName=e.remoteIdentity.displayName||e.remoteIdentity.uri.user,e.ctxid=ctxSip.getUniqueID(),"incoming"===e.direction?(t="Incoming: "+e.displayName,ctxSip.startRingTone()):(t="Trying: "+e.displayName,ctxSip.startRingbackTone()),ctxSip.logCall(e,"ringing"),ctxSip.setCallSessionStatus(t),e.on("progress",function(t){"outgoing"===t.direction&&ctxSip.setCallSessionStatus("Calling...")}),e.on("connecting",function(t){"outgoing"===t.direction&&ctxSip.setCallSessionStatus("Connecting...")}),e.on("accepted",function(t){ctxSip.callActiveID&&ctxSip.callActiveID!==e.ctxid&&ctxSip.phoneHoldButtonPressed(ctxSip.callActiveID),ctxSip.stopRingbackTone(),ctxSip.stopRingTone(),ctxSip.setCallSessionStatus("Answered"),ctxSip.logCall(e,"answered"),ctxSip.callActiveID=e.ctxid}),e.on("hold",function(t){ctxSip.callActiveID=null,ctxSip.logCall(e,"holding")}),e.on("unhold",function(t){ctxSip.logCall(e,"resumed"),ctxSip.callActiveID=e.ctxid}),e.on("muted",function(t){ctxSip.Sessions[e.ctxid].isMuted=!0,ctxSip.setCallSessionStatus("Muted")}),e.on("unmuted",function(t){ctxSip.Sessions[e.ctxid].isMuted=!1,ctxSip.setCallSessionStatus("Answered")}),e.on("cancel",function(t){ctxSip.stopRingTone(),ctxSip.stopRingbackTone(),ctxSip.setCallSessionStatus("Canceled"),"outgoing"===this.direction&&(ctxSip.callActiveID=null,e=null,ctxSip.logCall(this,"ended"))}),e.on("bye",function(t){ctxSip.stopRingTone(),ctxSip.stopRingbackTone(),ctxSip.setCallSessionStatus(""),ctxSip.logCall(e,"ended"),ctxSip.callActiveID=null,e=null}),e.on("failed",function(t){ctxSip.stopRingTone(),ctxSip.stopRingbackTone(),ctxSip.setCallSessionStatus("Terminated")}),e.on("rejected",function(t){ctxSip.stopRingTone(),ctxSip.stopRingbackTone(),ctxSip.setCallSessionStatus("Rejected"),ctxSip.callActiveID=null,ctxSip.logCall(this,"ended"),e=null}),ctxSip.Sessions[e.ctxid]=e},getUserMediaFailure:function(t){window.console.error("getUserMedia failed:",t),ctxSip.setError(!0,"Media Error.","You must allow access to your microphone.  Check the address bar.",!0)},getUserMediaSuccess:function(t){ctxSip.Stream=t},setCallSessionStatus:function(t){$("#txtCallStatus").html(t)},setStatus:function(t){$("#txtRegStatus").html('<i class="fa fa-signal"></i> '+t)},logCall:function(t,e){var i={clid:t.displayName,uri:t.remoteIdentity.uri.toString(),id:t.ctxid,time:(new Date).getTime()},n=JSON.parse(localStorage.getItem("sipCalls"));(n=n||{}).hasOwnProperty(t.ctxid)||(n[i.id]={id:i.id,clid:i.clid,uri:i.uri,start:i.time,flow:t.direction}),"ended"===e&&(n[i.id].stop=i.time),"ended"===e&&"ringing"===n[i.id].status?n[i.id].status="missed":n[i.id].status=e,localStorage.setItem("sipCalls",JSON.stringify(n)),ctxSip.logShow()},logItem:function(t){var e,i,n="ended"!==t.status&&"missed"!==t.status,s="ended"!==t.status?'<span id="'+t.id+'"></span>':moment.duration(t.stop-t.start).humanize(),o="";switch(t.status){case"ringing":o="list-group-item-success",e="fa-bell";break;case"missed":o="list-group-item-danger","incoming"===t.flow&&(e="fa-chevron-left"),"outgoing"===t.flow&&(e="fa-chevron-right");break;case"holding":o="list-group-item-warning",e="fa-pause";break;case"answered":case"resumed":o="list-group-item-info",e="fa-phone-square";break;case"ended":"incoming"===t.flow&&(e="fa-chevron-left"),"outgoing"===t.flow&&(e="fa-chevron-right")}if(i='<div class="list-group-item sip-logitem clearfix '+o+'" data-uri="'+t.uri+'" data-sessionid="'+t.id+'" title="Double Click to Call">',i+='<div class="clearfix"><div class="pull-left">',i+='<i class="fa fa-fw '+e+' fa-fw"></i> <strong>'+ctxSip.formatPhone(t.uri)+"</strong><br><small>"+moment(t.start).format("MM/DD hh:mm:ss a")+"</small>",i+="</div>",i+='<div class="pull-right text-right"><em>'+t.clid+"</em><br>"+s+"</div></div>",n&&(i+='<div class="btn-group btn-group-xs pull-right">',"ringing"===t.status&&"incoming"===t.flow?i+='<button class="btn btn-xs btn-success btnCall" title="Call"><i class="fa fa-phone"></i></button>':(i+='<button class="btn btn-xs btn-primary btnHoldResume" title="Hold"><i class="fa fa-pause"></i></button>',i+='<button class="btn btn-xs btn-info btnTransfer" title="Transfer"><i class="fa fa-random"></i></button>',i+='<button class="btn btn-xs btn-warning btnMute" title="Mute"><i class="fa fa-fw fa-microphone"></i></button>'),i+='<button class="btn btn-xs btn-danger btnHangUp" title="Hangup"><i class="fa fa-stop"></i></button>',i+="</div>"),i+="</div>",$("#sip-logitems").append(i),"answered"===t.status){var a=document.getElementById(t.id);ctxSip.callTimers[t.id]=new r(a),ctxSip.callTimers[t.id].start()}n&&"ringing"!==t.status&&ctxSip.callTimers[t.id].start({startTime:t.start}),$("#sip-logitems").scrollTop(0)},logShow:function(){var t=JSON.parse(localStorage.getItem("sipCalls")),i=[];null!==t?($("#sip-splash").addClass("hide"),$("#sip-log").removeClass("hide"),$("#sip-logitems").empty(),$.each(t,function(t,e){i.push(e)}),i.sort(function(t,e){return e.start-t.start}),$.each(i,function(t,e){ctxSip.logItem(e)})):($("#sip-splash").removeClass("hide"),$("#sip-log").addClass("hide"))},logClear:function(){localStorage.removeItem("sipCalls"),ctxSip.logShow()},sipCall:function(t){try{var e=ctxSip.phone.invite(t,{media:{stream:ctxSip.Stream,constraints:{audio:!0,video:!1},render:{remote:$("#audioRemote").get()[0]},RTCConstraints:{optional:[{DtlsSrtpKeyAgreement:"true"}]}}});e.direction="outgoing",ctxSip.newSession(e)}catch(t){throw t}},sipTransfer:function(t){var e=ctxSip.Sessions[t],i=window.prompt("Enter destination number","");ctxSip.setCallSessionStatus("<i>Transfering the call...</i>"),e.refer(i)},sipHangUp:function(t){var e=ctxSip.Sessions[t];e&&(e.startTime?e.bye():e.reject?e.reject():e.cancel&&e.cancel())},sipSendDTMF:function(t){try{ctxSip.dtmfTone.play()}catch(t){}var e=ctxSip.callActiveID;e&&ctxSip.Sessions[e].dtmf(t)},phoneCallButtonPressed:function(t){var e=ctxSip.Sessions[t],i=$("#numDisplay").val();e?e.accept&&!e.startTime&&e.accept({media:{stream:ctxSip.Stream,constraints:{audio:!0,video:!1},render:{remote:{audio:$("#audioRemote").get()[0]}},RTCConstraints:{optional:[{DtlsSrtpKeyAgreement:"true"}]}}}):($("#numDisplay").val(""),ctxSip.sipCall(i))},phoneMuteButtonPressed:function(t){var e=ctxSip.Sessions[t];e.isMuted?e.unmute():e.mute()},phoneHoldButtonPressed:function(t){var e=ctxSip.Sessions[t];!0===e.isOnHold().local?e.unhold():e.hold()},setError:function(t,e,i,n){if(!0===t){if($("#mdlError p").html(i),$("#mdlError").modal("show"),n){$("#mdlError .modal-header").find("button").remove(),$("#mdlError .modal-header").prepend('<button type="button" class="close" data-dismiss="modal">&times;</button>'),$("#mdlError .modal-title").html(e),$("#mdlError").modal({keyboard:!0})}else $("#mdlError .modal-header").find("button").remove(),$("#mdlError .modal-title").html(e),$("#mdlError").modal({keyboard:!1});$("#numDisplay").prop("disabled","disabled")}else $("#numDisplay").removeProp("disabled"),$("#mdlError").modal("hide")},hasWebRTC:function(){return!!navigator.webkitGetUserMedia||(!!navigator.mozGetUserMedia||(!!navigator.getUserMedia||(ctxSip.setError(!0,"Unsupported Browser.","Your browser does not support the features required for this phone."),window.console.error("WebRTC support not found"),!1)))}}).hasWebRTC())return!0;ctxSip.phone=new SIP.UA(ctxSip.config),ctxSip.phone.on("connected",function(t){ctxSip.setStatus("Connected")}),ctxSip.phone.on("disconnected",function(t){ctxSip.setStatus("Disconnected"),ctxSip.setError(!0,"Websocket Disconnected.","An Error occurred connecting to the websocket."),$("#sessions > .session").each(function(t,e){ctxSip.removeSession(e,500)})}),ctxSip.phone.on("registered",function(t){window.onbeforeunload=function(){return"If you close this window, you will not be able to make or receive calls from your browser."},window.onunload=function(){localStorage.removeItem("ctxPhone"),ctxSip.phone.stop()},localStorage.setItem("ctxPhone","true"),$("#mldError").modal("hide"),ctxSip.setStatus("Ready"),SIP.WebRTC.isSupported()&&SIP.WebRTC.getUserMedia({audio:!0,video:!1},ctxSip.getUserMediaSuccess,ctxSip.getUserMediaFailure)}),ctxSip.phone.on("registrationFailed",function(t){ctxSip.setError(!0,"Registration Error.","An Error occurred registering your phone. Check your settings."),ctxSip.setStatus("Error: Registration Failed")}),ctxSip.phone.on("unregistered",function(t){ctxSip.setError(!0,"Registration Error.","An Error occurred registering your phone. Check your settings."),ctxSip.setStatus("Error: Registration Failed")}),ctxSip.phone.on("invite",function(t){var e=t;e.direction="incoming",ctxSip.newSession(e)}),$("#sipClient").keydown(function(t){8===t.which&&$("#numDisplay").focus()}),$("#numDisplay").keypress(function(t){13===t.which&&ctxSip.phoneCallButtonPressed()}),$(".digit").click(function(t){t.preventDefault();var e=$("#numDisplay").val(),i=$(this).data("digit");return $("#numDisplay").val(e+i),ctxSip.sipSendDTMF(i),!1}),$("#phoneUI .dropdown-menu").click(function(t){t.preventDefault()}),$("#phoneUI").delegate(".btnCall","click",function(t){return ctxSip.phoneCallButtonPressed(),!0}),$(".sipLogClear").click(function(t){t.preventDefault(),ctxSip.logClear()}),$("#sip-logitems").delegate(".sip-logitem .btnCall","click",function(t){var e=$(this).closest(".sip-logitem").data("sessionid");return ctxSip.phoneCallButtonPressed(e),!1}),$("#sip-logitems").delegate(".sip-logitem .btnHoldResume","click",function(t){var e=$(this).closest(".sip-logitem").data("sessionid");return ctxSip.phoneHoldButtonPressed(e),!1}),$("#sip-logitems").delegate(".sip-logitem .btnHangUp","click",function(t){var e=$(this).closest(".sip-logitem").data("sessionid");return ctxSip.sipHangUp(e),!1}),$("#sip-logitems").delegate(".sip-logitem .btnTransfer","click",function(t){var e=$(this).closest(".sip-logitem").data("sessionid");return ctxSip.sipTransfer(e),!1}),$("#sip-logitems").delegate(".sip-logitem .btnMute","click",function(t){var e=$(this).closest(".sip-logitem").data("sessionid");return ctxSip.phoneMuteButtonPressed(e),!1}),$("#sip-logitems").delegate(".sip-logitem","dblclick",function(t){t.preventDefault();var e=$(this).data("uri");$("#numDisplay").val(e),ctxSip.phoneCallButtonPressed()}),$("#sldVolume").on("change",function(){var t=$(this).val()/100,e=$("#btnVol"),i=$("#btnVol").find("i"),n=ctxSip.callActiveID;return ctxSip.Sessions[n]&&(ctxSip.Sessions[n].player.volume=t,ctxSip.callVolume=t),$("audio").each(function(){$(this).get()[0].volume=t}),t<.1?(e.removeClass(function(t,e){return(e.match(/(^|\s)btn\S+/g)||[]).join(" ")}).addClass("btn btn-sm btn-danger"),i.removeClass().addClass("fa fa-fw fa-volume-off")):t<.8?(e.removeClass(function(t,e){return(e.match(/(^|\s)btn\S+/g)||[]).join(" ")}).addClass("btn btn-sm btn-info"),i.removeClass().addClass("fa fa-fw fa-volume-down")):(e.removeClass(function(t,e){return(e.match(/(^|\s)btn\S+/g)||[]).join(" ")}).addClass("btn btn-sm btn-primary"),i.removeClass().addClass("fa fa-fw fa-volume-up")),!1}),setTimeout(function(){ctxSip.logShow()},3e3);var r=function(t,e){var i,n,s,o=document.createElement("span");function a(){n+=function(){var t=Date.now(),e=t-i;return i=t,e}(),r()}function r(){o.innerHTML=moment(n).format("mm:ss")}(e=e||{}).delay=e.delay||1e3,e.startTime=e.startTime||Date.now(),t.appendChild(o),n=0,r(),this.start=function(){s||(i=e.startTime,s=setInterval(a,e.delay))},this.stop=function(){s&&(clearInterval(s),s=null)}}});var user={User:"1005",Pass:"12345678",Realm:"172.21.255.246",Display:"Iago Melo",WSServer:"wss://wss.sample.com:8443"};