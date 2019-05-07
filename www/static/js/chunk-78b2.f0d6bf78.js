(window.webpackJsonp=window.webpackJsonp||[]).push([["chunk-78b2"],{RsI7:function(e,o,t){"use strict";var n=t("mAct");t.n(n).a},c11S:function(e,o,t){"use strict";var n=t("gTgX");t.n(n).a},gTgX:function(e,o,t){},mAct:function(e,o,t){},ntYl:function(e,o,t){"use strict";t.r(o);var n={name:"Login",data:function(){return{rememberAccount:!0,checked:!1,loginForm:{email:"",password:""},loginRules:{email:[{required:!0,trigger:"blur",validator:function(e,o,t){/^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/.test(o)?t():t(new Error("请输入正确的邮箱"))}}],password:[{required:!0,trigger:"blur",validator:function(e,o,t){o.length<5?t(new Error("密码不能小于5位")):t()}}]},loading:!1,pwdType:"password",redirect:void 0}},watch:{$route:{handler:function(e){this.redirect=e.query&&e.query.redirect},immediate:!0}},methods:{showPwd:function(){"password"===this.pwdType?this.pwdType="":this.pwdType="password"},handleRegister:function(){var e=this;this.$refs.loginForm.validate(function(o){if(!o)return!1;e.loading=!0,1==e.rememberAccount?e.setCookie(e.loginForm.email,e.loginForm.password,1314):(console.log("清空Cookie"),e.clearCookie()),e.$store.dispatch("Register",e.loginForm).then(function(){e.loading=!1,e.$router.push({path:e.redirect||"/"})}).catch(function(){e.loading=!1})})},handleLogin:function(){var e=this;this.$refs.loginForm.validate(function(o){if(!o)return!1;e.loading=!0,1==e.rememberAccount?e.setCookie(e.loginForm.email,e.loginForm.password,1314):(console.log("清空Cookie"),e.clearCookie()),e.$store.dispatch("Login",e.loginForm).then(function(){e.loading=!1,e.$router.push({path:e.redirect||"/"})}).catch(function(o){e.loading=!1})})},handleFpassword:function(){location.href="/account/#/user/fpassword"},setCookie:function(e,o,t){var n=new Date;n.setTime(n.getTime()+864e5*t),window.document.cookie="email="+e+";path=/;expires="+n.toGMTString(),window.document.cookie="password="+o+";path=/;expires="+n.toGMTString()},getCookie:function(){if(document.cookie.length>0)for(var e=document.cookie.split("; "),o=0;o<e.length;o++){var t=e[o].split("=");"email"==t[0]?this.loginForm.email=t[1]:"password"==t[0]&&(this.loginForm.password=t[1])}},clearCookie:function(){this.setCookie("","",-1)}},mounted:function(){this.getCookie()}},i=(t("c11S"),t("RsI7"),t("KHd+")),r=Object(i.a)(n,function(){var e=this,o=e.$createElement,t=e._self._c||o;return t("div",{ref:"login-container",staticClass:"login-container"},[t("el-form",{ref:"loginForm",staticClass:"login-form",attrs:{model:e.loginForm,rules:e.loginRules,"auto-complete":"on","label-position":"left"}},[t("h3",{staticClass:"title"},[e._v("LogPay 收款系统")]),e._v(" "),t("el-form-item",{attrs:{prop:"email"}},[t("span",{staticClass:"svg-container"},[t("svg-icon",{attrs:{"icon-class":"user"}})],1),e._v(" "),t("el-input",{attrs:{name:"email",type:"email","auto-complete":"on",placeholder:"邮箱"},model:{value:e.loginForm.email,callback:function(o){e.$set(e.loginForm,"email",o)},expression:"loginForm.email"}})],1),e._v(" "),t("el-form-item",{attrs:{prop:"password"}},[t("span",{staticClass:"svg-container"},[t("svg-icon",{attrs:{"icon-class":"password"}})],1),e._v(" "),t("el-input",{attrs:{type:e.pwdType,name:"password","auto-complete":"on",placeholder:"密码"},nativeOn:{keyup:function(o){return"button"in o||!e._k(o.keyCode,"enter",13,o.key,"Enter")?e.handleLogin(o):null}},model:{value:e.loginForm.password,callback:function(o){e.$set(e.loginForm,"password",o)},expression:"loginForm.password"}}),e._v(" "),t("span",{staticClass:"show-pwd",on:{click:e.showPwd}},[t("svg-icon",{attrs:{"icon-class":"password"===e.pwdType?"eye":"eye-open"}})],1)],1),e._v(" "),t("el-checkbox",{staticStyle:{"margin-bottom":"3px"},model:{value:e.checked,callback:function(o){e.checked=o},expression:"checked"}},[e._v("注册一个新用户")]),e._v(" "),t("el-checkbox",{staticStyle:{"margin-bottom":"3px",float:"right"},model:{value:e.rememberAccount,callback:function(o){e.rememberAccount=o},expression:"rememberAccount"}},[e._v("记住密码")]),e._v(" "),e.checked?t("a",{staticStyle:{color:"#409EFF",display:"block","text-align":"center",margin:"5px 0","font-size":"15px"},attrs:{href:"/account/#/user/argeement"}},[e._v("注册即代表同意《LogPay 用户协议》")]):e._e(),e._v(" "),t("el-form-item",[e.checked?t("el-button",{staticStyle:{width:"100%"},attrs:{loading:e.loading,type:"primary"},nativeOn:{click:function(o){return o.preventDefault(),e.handleRegister(o)}}},[e._v("\n        注册\n      ")]):t("el-button",{staticStyle:{width:"100%"},attrs:{loading:e.loading,type:"success"},nativeOn:{click:function(o){return o.preventDefault(),e.handleLogin(o)}}},[e._v("\n        登陆\n      ")]),e._v(" "),t("el-button",{staticStyle:{width:"100%",backgroundColor:"#F2F6FC",margin:"0 auto","margin-top":"5px"},nativeOn:{click:function(o){return o.preventDefault(),e.handleFpassword(o)}}},[e._v("\n        忘记密码?\n      ")])],1)],1)],1)},[],!1,null,"12f12ba8",null);r.options.__file="index.vue";o.default=r.exports}}]);