(window.webpackJsonp=window.webpackJsonp||[]).push([["Vy2M"],{Vy2M:function(e,r,s){"use strict";s.r(r);var t={data:function(){var e=this,r=function(r,s,t){""===s?t(new Error("请输入密码")):(""!==e.ruleForm2.checkPass&&e.$refs.ruleForm2.validateField("checkPass"),t())};return{ruleForm2:{oldpass:"",pass:"",checkPass:""},rules2:{oldpass:[{validator:r,trigger:"blur"}],pass:[{validator:r,trigger:"blur"}],checkPass:[{validator:function(r,s,t){""===s?t(new Error("请再次输入密码")):s!==e.ruleForm2.pass?t(new Error("两次输入密码不一致!")):t()},trigger:"blur"}]}}},methods:{handleChange:function(){var e=this;this.$refs.ruleForm2.validate(function(r){if(!r)return console.log("error submit!!"),!1;e.$store.dispatch("Cpassword",e.ruleForm2).then(function(){e.$router.push({path:e.redirect||"/index"})}).catch(function(e){console.log(e)})})}}},o=s("KHd+"),l=Object(o.a)(t,function(){var e=this,r=e.$createElement,s=e._self._c||r;return s("div",{staticStyle:{width:"88%","margin-top":"28px"}},[s("el-form",{ref:"ruleForm2",staticClass:"demo-ruleForm",attrs:{model:e.ruleForm2,"status-icon":"",rules:e.rules2,"label-width":"100px"}},[s("el-form-item",{attrs:{label:"旧密码",prop:"oldpass"}},[s("el-input",{attrs:{type:"password",autocomplete:"off"},model:{value:e.ruleForm2.oldpass,callback:function(r){e.$set(e.ruleForm2,"oldpass",r)},expression:"ruleForm2.oldpass"}})],1),e._v(" "),s("el-form-item",{attrs:{label:"密码",prop:"pass"}},[s("el-input",{attrs:{type:"password",autocomplete:"off"},model:{value:e.ruleForm2.pass,callback:function(r){e.$set(e.ruleForm2,"pass",r)},expression:"ruleForm2.pass"}})],1),e._v(" "),s("el-form-item",{attrs:{label:"确认密码",prop:"checkPass"}},[s("el-input",{attrs:{type:"password",autocomplete:"off"},model:{value:e.ruleForm2.checkPass,callback:function(r){e.$set(e.ruleForm2,"checkPass",r)},expression:"ruleForm2.checkPass"}})],1),e._v(" "),s("el-form-item",[s("el-button",{attrs:{type:"primary"},on:{click:e.handleChange}},[e._v("提交")])],1)],1)],1)},[],!1,null,null,null);l.options.__file="index.vue";r.default=l.exports}}]);