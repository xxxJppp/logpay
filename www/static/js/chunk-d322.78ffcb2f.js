(window.webpackJsonp=window.webpackJsonp||[]).push([["chunk-d322"],{"+Lc1":function(t,e,r){"use strict";r.d(e,"b",function(){return i}),r.d(e,"a",function(){return a}),r.d(e,"c",function(){return o}),r.d(e,"d",function(){return s});var n=r("t3Un");function i(t){return Object(n.a)({url:"/order/getOrder",method:"get",params:t})}function a(t){return Object(n.a)({url:"/order/getMissOrder",method:"get",params:t})}function o(t){return Object(n.a)({url:"/order/getDayMoney",method:"get",params:t})}function s(t){return Object(n.a)({url:"/order/getOrderNumber",method:"get",params:t})}},"14Xm":function(t,e,r){t.exports=r("u938")},D3Ub:function(t,e,r){"use strict";e.__esModule=!0;var n=function(t){return t&&t.__esModule?t:{default:t}}(r("4d7F"));e.default=function(t){return function(){var e=t.apply(this,arguments);return new n.default(function(t,r){return function i(a,o){try{var s=e[a](o),c=s.value}catch(t){return void r(t)}if(!s.done)return n.default.resolve(c).then(function(t){i("next",t)},function(t){i("throw",t)});t(c)}("next")})}}},"Ng+W":function(t,e,r){},QYGT:function(t,e,r){"use strict";r.r(e);var n=r("14Xm"),i=r.n(n),a=r("D3Ub"),o=r.n(a),s=r("QbLZ"),c=r.n(s),u=r("L2JU"),l=r("+Lc1"),p={data:function(){return{picker:{shortcuts:[{text:"最近一天",onClick:function(t){var e=new Date,r=new Date;r.setTime(r.getTime()-864e5),t.$emit("pick",[r,e])}},{text:"最近一周",onClick:function(t){var e=new Date,r=new Date;r.setTime(r.getTime()-6048e5),t.$emit("pick",[r,e])}},{text:"最近一个月",onClick:function(t){var e=new Date,r=new Date;r.setTime(r.getTime()-2592e6),t.$emit("pick",[r,e])}}]},phoneid:"",missOrderDate:"",money:null,pay_type:[{type:null,label:"所有支付渠道"},{type:"alipay",label:"支付宝"},{type:"wxpay",label:"微信"},{type:"lakala",label:"拉卡拉"}],type:null,missOrderList:null,page:{page:1,num:10,total:0},missOrdersExport:!1,exportMissList:null,listLoading:!1}},computed:c()({},Object(u.b)(["uid","roles"])),created:function(){this.get_miss_order(),this.$notify({title:"有4种情况可能匹配不到订单",dangerouslyUseHTMLString:!0,message:'<div style="font-size:17px;color:red;"><span>1.有人向您收款二维码直接转账,没经过LogPay支付接口(很有可能是朋友, 所以尽量找没有朋友知道的账号)</span><br><span>2.用户用支付宝微信扫码后未及时支付,在订单超时后才回来支付,此时订单已关闭。(解决方案:如此情况较多,请在设置中适当延长二维码过期时间)</span></br><span>3.任意金额二维码收款时,用户输错金额,导致订单匹配不上。(解决方案:多上传定额收款二维码,尽量覆盖用户可能用到的金额)</span><br><span>4.手机通知延迟到订单超时和支付宝微信的重复通知,也会在这里留下记录。(解决方案:请勿在多台手机安装APP并登录同一个账号，同时确保手机网络通畅。)</span></div>',duration:0})},methods:{selectMissOrder:function(){this.get_miss_order()},handleSizeChange:function(t){this.page.num=t,this.get_miss_order()},nextPage:function(t){this.page.page=t,this.get_miss_order()},exportMissOrders:function(){var t=this;return o()(i.a.mark(function e(){var n,a,o;return i.a.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return n=t.money,null!==t.money&&(n=parseFloat(t.money).toFixed(2,"0")),null===t.missOrderDate&&(t.missOrderDate=""),t.listLoading=!0,a={payPrice:n,payType:t.type,uid:t.uid,page:t.page.page,num:t.page.num,missOrderDate:t.missOrderDate,merchantUid:t.merchantUid,role:t.roles[0]},e.next=7,Object(l.a)(a);case 7:o=e.sent,t.listLoading=!1,Promise.all([r.e("chunk-180f"),r.e("chunk-fc70")]).then(r.bind(null,"S/jZ")).then(function(e){t.exportMissList=o.data.missOrder,t.exportMissList.map(function(t){t.createTime=t.createTime.substring(0,10)+" "+t.createTime.substring(11,19)});var r=t.formatJson(["payPrice","payType","createTime"],t.exportMissList);e.export_json_to_excel({header:["未匹配金额","支付渠道","支付时间"],data:r,filename:"LogPayMissOrders",autoWidth:!0,bookType:"xls"})});case 10:case"end":return e.stop()}},e,t)}))()},formatJson:function(t,e){return e.map(function(e){return t.map(function(t){return"timestamp"===t?parseTime(e[t]):"alipay"===e[t]?"支付宝":"wxpay"===e[t]?"微信支付":"lakala"===e[t]?"拉卡拉":e[t]})})},get_miss_order:function(){var t=this;return o()(i.a.mark(function e(){var r,n,a;return i.a.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return r=t.money,null!==t.money&&(r=parseFloat(t.money).toFixed(2,"0")),null===t.missOrderDate&&(t.missOrderDate=""),t.listLoading=!0,n={payPrice:r,payType:t.type,uid:t.uid,page:t.page.page,num:t.page.num,missOrderDate:t.missOrderDate,merchantUid:t.merchantUid,role:t.roles[0]},e.next=7,Object(l.a)(n);case 7:a=e.sent,t.missOrderList=a.data.select,t.missOrderList.map(function(t){t.createTime=t.createTime.substring(0,10)+" "+t.createTime.substring(11,19)}),t.page.total=a.data.missOrder.length,t.listLoading=!1;case 12:case"end":return e.stop()}},e,t)}))()}}},f=(r("Ultn"),r("KHd+")),d=Object(f.a)(p,function(){var t=this,e=t.$createElement,r=t._self._c||e;return r("div",{staticClass:"container"},[r("div",{staticClass:"header"},["admin"===this.roles[0]?r("el-input",{staticStyle:{width:"49%"},attrs:{placeholder:"商户号"},model:{value:t.merchantUid,callback:function(e){t.merchantUid=e},expression:"merchantUid"}}):t._e(),t._v(" "),r("el-input",{staticStyle:{width:"49%"},attrs:{placeholder:"未匹配金额"},model:{value:t.money,callback:function(e){t.money=e},expression:"money"}}),t._v(" "),r("el-select",{staticStyle:{margin:"5px 0",width:"49%"},attrs:{placeholder:"请选择"},model:{value:t.type,callback:function(e){t.type=e},expression:"type"}},t._l(t.pay_type,function(t){return r("el-option",{key:t.type,attrs:{label:t.label,value:t.type}})})),t._v(" "),r("el-date-picker",{staticStyle:{"margin-bottom":"5px"},attrs:{type:"datetimerange","picker-options":t.picker,"range-separator":"至","start-placeholder":"开始日期","end-placeholder":"结束日期",align:"right"},model:{value:t.missOrderDate,callback:function(e){t.missOrderDate=e},expression:"missOrderDate"}}),t._v(" "),r("el-button",{staticStyle:{margin:"0 0 5px 5px"},attrs:{size:"mini"},on:{click:t.selectMissOrder}},[t._v("查询")]),t._v(" "),r("el-checkbox",{staticStyle:{"margin-left":"10px"},model:{value:t.missOrdersExport,callback:function(e){t.missOrdersExport=e},expression:"missOrdersExport"}},[t._v("订单导出")]),t._v(" "),t.missOrdersExport?r("el-button",{staticStyle:{"margin-left":"5px"},attrs:{size:"mini"},on:{click:t.exportMissOrders}},[t._v("确认导出")]):t._e(),t.missOrdersExport?r("span",{staticStyle:{color:"#cccccc","font-size":"10px","margin-left":"5px"}},[t._v("不支持Safari ")]):t._e()],1),t._v(" "),r("el-table",{directives:[{name:"loading",rawName:"v-loading",value:t.listLoading,expression:"listLoading"}],attrs:{data:t.missOrderList,"element-loading-text":"Loading",border:"",fit:""}},["admin"===this.roles[0]?r("el-table-column",{attrs:{prop:"uid",label:"商户号",align:"center"}}):t._e(),t._v(" "),r("el-table-column",{attrs:{prop:"payPrice",label:"未匹配价格",align:"center"}}),t._v(" "),r("el-table-column",{attrs:{prop:"payType",label:"支付渠道",align:"center"},scopedSlots:t._u([{key:"default",fn:function(e){return["alipay"==e.row.payType?r("span",[t._v("支付宝")]):"lakala"==e.row.payType?r("span",[t._v("拉卡拉")]):r("span",[t._v("微信支付")])]}}])}),t._v(" "),r("el-table-column",{attrs:{prop:"createTime",label:"支付时间",align:"center"}})],1),t._v(" "),r("el-pagination",{attrs:{"page-sizes":[10,20,30,40],"page-size":t.page.num,layout:"total, sizes, prev, pager, next, jumper",total:t.page.total},on:{"size-change":t.handleSizeChange,"current-change":t.nextPage}})],1)},[],!1,null,null,null);d.options.__file="index.vue";e.default=d.exports},Ultn:function(t,e,r){"use strict";var n=r("Ng+W");r.n(n).a},ls82:function(t,e){!function(e){"use strict";var r,n=Object.prototype,i=n.hasOwnProperty,a="function"==typeof Symbol?Symbol:{},o=a.iterator||"@@iterator",s=a.asyncIterator||"@@asyncIterator",c=a.toStringTag||"@@toStringTag",u="object"==typeof t,l=e.regeneratorRuntime;if(l)u&&(t.exports=l);else{(l=e.regeneratorRuntime=u?t.exports:{}).wrap=b;var p="suspendedStart",f="suspendedYield",d="executing",h="completed",m={},y={};y[o]=function(){return this};var g=Object.getPrototypeOf,v=g&&g(g(P([])));v&&v!==n&&i.call(v,o)&&(y=v);var x=L.prototype=_.prototype=Object.create(y);O.prototype=x.constructor=L,L.constructor=O,L[c]=O.displayName="GeneratorFunction",l.isGeneratorFunction=function(t){var e="function"==typeof t&&t.constructor;return!!e&&(e===O||"GeneratorFunction"===(e.displayName||e.name))},l.mark=function(t){return Object.setPrototypeOf?Object.setPrototypeOf(t,L):(t.__proto__=L,c in t||(t[c]="GeneratorFunction")),t.prototype=Object.create(x),t},l.awrap=function(t){return{__await:t}},k(E.prototype),E.prototype[s]=function(){return this},l.AsyncIterator=E,l.async=function(t,e,r,n){var i=new E(b(t,e,r,n));return l.isGeneratorFunction(e)?i:i.next().then(function(t){return t.done?t.value:i.next()})},k(x),x[c]="Generator",x[o]=function(){return this},x.toString=function(){return"[object Generator]"},l.keys=function(t){var e=[];for(var r in t)e.push(r);return e.reverse(),function r(){for(;e.length;){var n=e.pop();if(n in t)return r.value=n,r.done=!1,r}return r.done=!0,r}},l.values=P,S.prototype={constructor:S,reset:function(t){if(this.prev=0,this.next=0,this.sent=this._sent=r,this.done=!1,this.delegate=null,this.method="next",this.arg=r,this.tryEntries.forEach(D),!t)for(var e in this)"t"===e.charAt(0)&&i.call(this,e)&&!isNaN(+e.slice(1))&&(this[e]=r)},stop:function(){this.done=!0;var t=this.tryEntries[0].completion;if("throw"===t.type)throw t.arg;return this.rval},dispatchException:function(t){if(this.done)throw t;var e=this;function n(n,i){return s.type="throw",s.arg=t,e.next=n,i&&(e.method="next",e.arg=r),!!i}for(var a=this.tryEntries.length-1;a>=0;--a){var o=this.tryEntries[a],s=o.completion;if("root"===o.tryLoc)return n("end");if(o.tryLoc<=this.prev){var c=i.call(o,"catchLoc"),u=i.call(o,"finallyLoc");if(c&&u){if(this.prev<o.catchLoc)return n(o.catchLoc,!0);if(this.prev<o.finallyLoc)return n(o.finallyLoc)}else if(c){if(this.prev<o.catchLoc)return n(o.catchLoc,!0)}else{if(!u)throw new Error("try statement without catch or finally");if(this.prev<o.finallyLoc)return n(o.finallyLoc)}}}},abrupt:function(t,e){for(var r=this.tryEntries.length-1;r>=0;--r){var n=this.tryEntries[r];if(n.tryLoc<=this.prev&&i.call(n,"finallyLoc")&&this.prev<n.finallyLoc){var a=n;break}}a&&("break"===t||"continue"===t)&&a.tryLoc<=e&&e<=a.finallyLoc&&(a=null);var o=a?a.completion:{};return o.type=t,o.arg=e,a?(this.method="next",this.next=a.finallyLoc,m):this.complete(o)},complete:function(t,e){if("throw"===t.type)throw t.arg;return"break"===t.type||"continue"===t.type?this.next=t.arg:"return"===t.type?(this.rval=this.arg=t.arg,this.method="return",this.next="end"):"normal"===t.type&&e&&(this.next=e),m},finish:function(t){for(var e=this.tryEntries.length-1;e>=0;--e){var r=this.tryEntries[e];if(r.finallyLoc===t)return this.complete(r.completion,r.afterLoc),D(r),m}},catch:function(t){for(var e=this.tryEntries.length-1;e>=0;--e){var r=this.tryEntries[e];if(r.tryLoc===t){var n=r.completion;if("throw"===n.type){var i=n.arg;D(r)}return i}}throw new Error("illegal catch attempt")},delegateYield:function(t,e,n){return this.delegate={iterator:P(t),resultName:e,nextLoc:n},"next"===this.method&&(this.arg=r),m}}}function b(t,e,r,n){var i=e&&e.prototype instanceof _?e:_,a=Object.create(i.prototype),o=new S(n||[]);return a._invoke=function(t,e,r){var n=p;return function(i,a){if(n===d)throw new Error("Generator is already running");if(n===h){if("throw"===i)throw a;return M()}for(r.method=i,r.arg=a;;){var o=r.delegate;if(o){var s=T(o,r);if(s){if(s===m)continue;return s}}if("next"===r.method)r.sent=r._sent=r.arg;else if("throw"===r.method){if(n===p)throw n=h,r.arg;r.dispatchException(r.arg)}else"return"===r.method&&r.abrupt("return",r.arg);n=d;var c=w(t,e,r);if("normal"===c.type){if(n=r.done?h:f,c.arg===m)continue;return{value:c.arg,done:r.done}}"throw"===c.type&&(n=h,r.method="throw",r.arg=c.arg)}}}(t,r,o),a}function w(t,e,r){try{return{type:"normal",arg:t.call(e,r)}}catch(t){return{type:"throw",arg:t}}}function _(){}function O(){}function L(){}function k(t){["next","throw","return"].forEach(function(e){t[e]=function(t){return this._invoke(e,t)}})}function E(t){var e;this._invoke=function(r,n){function a(){return new Promise(function(e,a){!function e(r,n,a,o){var s=w(t[r],t,n);if("throw"!==s.type){var c=s.arg,u=c.value;return u&&"object"==typeof u&&i.call(u,"__await")?Promise.resolve(u.__await).then(function(t){e("next",t,a,o)},function(t){e("throw",t,a,o)}):Promise.resolve(u).then(function(t){c.value=t,a(c)},o)}o(s.arg)}(r,n,e,a)})}return e=e?e.then(a,a):a()}}function T(t,e){var n=t.iterator[e.method];if(n===r){if(e.delegate=null,"throw"===e.method){if(t.iterator.return&&(e.method="return",e.arg=r,T(t,e),"throw"===e.method))return m;e.method="throw",e.arg=new TypeError("The iterator does not provide a 'throw' method")}return m}var i=w(n,t.iterator,e.arg);if("throw"===i.type)return e.method="throw",e.arg=i.arg,e.delegate=null,m;var a=i.arg;return a?a.done?(e[t.resultName]=a.value,e.next=t.nextLoc,"return"!==e.method&&(e.method="next",e.arg=r),e.delegate=null,m):a:(e.method="throw",e.arg=new TypeError("iterator result is not an object"),e.delegate=null,m)}function j(t){var e={tryLoc:t[0]};1 in t&&(e.catchLoc=t[1]),2 in t&&(e.finallyLoc=t[2],e.afterLoc=t[3]),this.tryEntries.push(e)}function D(t){var e=t.completion||{};e.type="normal",delete e.arg,t.completion=e}function S(t){this.tryEntries=[{tryLoc:"root"}],t.forEach(j,this),this.reset(!0)}function P(t){if(t){var e=t[o];if(e)return e.call(t);if("function"==typeof t.next)return t;if(!isNaN(t.length)){var n=-1,a=function e(){for(;++n<t.length;)if(i.call(t,n))return e.value=t[n],e.done=!1,e;return e.value=r,e.done=!0,e};return a.next=a}}return{next:M}}function M(){return{value:r,done:!0}}}(function(){return this}()||Function("return this")())},u938:function(t,e,r){var n=function(){return this}()||Function("return this")(),i=n.regeneratorRuntime&&Object.getOwnPropertyNames(n).indexOf("regeneratorRuntime")>=0,a=i&&n.regeneratorRuntime;if(n.regeneratorRuntime=void 0,t.exports=r("ls82"),i)n.regeneratorRuntime=a;else try{delete n.regeneratorRuntime}catch(t){n.regeneratorRuntime=void 0}}}]);