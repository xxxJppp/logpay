(window.webpackJsonp=window.webpackJsonp||[]).push([["chunk-c343"],{"N/kD":function(a,t,e){"use strict";e.r(t);var l=e("QbLZ"),d=e.n(l),_=e("L2JU"),r=e("vDqi"),o=e.n(r),s={computed:d()({},Object(_.b)(["meal","mealtime","money","uid"])),data:function(){return{mf:"",bz:"",gj:"",otherMeal:"",tod_yes_data:[{tod_yes:"今交易额",all:"加载中...",ali:"加载中...",wx:"加载中..."},{tod_yes:"今手续费",all:"加载中...",ali:"加载中...",wx:"加载中..."},{tod_yes:"昨交易额",all:"加载中...",ali:"加载中...",wx:"加载中..."},{tod_yes:"昨手续费",all:"加载中...",ali:"加载中...",wx:"加载中..."},{tod_yes:"总交易额",all:"加载中...",ali:"加载中...",wx:"加载中..."},{tod_yes:"总手续费",all:"加载中...",ali:"加载中...",wx:"加载中..."}],yes_tod_data:[{yes_tod:"今日",all_orderNumber:"加载中...",no_orderNumber:"加载中...",pay_orderNumber:"加载中...",pay_all:"加载中..."},{yes_tod:"昨日",all_orderNumber:"加载中...",no_orderNumber:"加载中...",pay_orderNumber:"加载中...",pay_all:"加载中..."},{yes_tod:"总",all_orderNumber:"加载中...",no_orderNumber:"加载中...",pay_orderNumber:"加载中...",pay_all:"加载中..."}]}},methods:{getDayMoney:function(){var a=this;o.a.get("https://api.logpay.cn/order/getDayMoney",{params:{uid:this.uid}}).then(function(t){if(-1==t.data.code)return a.$message.error(t.data.msg),!1;a.tod_yes_data[0].ali=t.data.data.tod_ali,a.tod_yes_data[1].ali=t.data.data.tod_ali_fee,a.tod_yes_data[0].wx=t.data.data.tod_wx,a.tod_yes_data[1].wx=t.data.data.tod_wx_fee,a.tod_yes_data[0].all=t.data.data.tod_all,a.tod_yes_data[1].all=t.data.data.tod_all_fee,a.yes_tod_data[0].pay_all=t.data.data.tod_all,a.tod_yes_data[2].ali=t.data.data.yes_ali,a.tod_yes_data[3].ali=t.data.data.yes_ali_fee,a.tod_yes_data[2].wx=t.data.data.yes_wx,a.tod_yes_data[3].wx=t.data.data.yes_wx_fee,a.tod_yes_data[2].all=t.data.data.yes_all,a.tod_yes_data[3].all=t.data.data.yes_all_fee,a.yes_tod_data[1].pay_all=t.data.data.yes_all,a.tod_yes_data[4].ali=t.data.data.all_ali,a.tod_yes_data[5].ali=t.data.data.all_ali_fee,a.tod_yes_data[4].wx=t.data.data.all_wx,a.tod_yes_data[5].wx=t.data.data.all_wx_fee,a.tod_yes_data[4].all=t.data.data.all_all,a.tod_yes_data[5].all=t.data.data.all_all_fee,a.yes_tod_data[2].pay_all=t.data.data.all_all})},getOrderNumber:function(){var a=this;o.a.get("https://api.logpay.cn/order/getOrderNumber",{params:{uid:this.uid}}).then(function(t){if(-1==t.data.code)return a.$message.error(t.data.msg),!1;a.yes_tod_data[0].pay_orderNumber=t.data.data.today_success_order.length,a.yes_tod_data[0].no_orderNumber=t.data.data.today_no_order.length,a.yes_tod_data[0].all_orderNumber=t.data.data.today_all_order.length,a.yes_tod_data[1].pay_orderNumber=t.data.data.yes_success_order.length,a.yes_tod_data[1].no_orderNumber=t.data.data.yes_no_order.length,a.yes_tod_data[1].all_orderNumber=t.data.data.yes_all_order.length,a.yes_tod_data[2].pay_orderNumber=t.data.data.all_success_order.length,a.yes_tod_data[2].no_orderNumber=t.data.data.all_no_order.length,a.yes_tod_data[2].all_orderNumber=t.data.data.all_order.length})},getMeal:function(){"mf"==this.meal?this.mf=!0:"bz"==this.meal?this.bz=!0:"gj"==this.meal?this.gj=!0:this.otherMeal=this.meal}},mounted:function(){this.getMeal(),this.getDayMoney(),this.getOrderNumber()}},n=(e("T+HA"),e("KHd+")),i=Object(n.a)(s,function(){var a=this,t=a.$createElement,e=a._self._c||t;return e("div",{staticClass:"wrapper"},[e("div",{staticClass:"header"},[e("div",{staticClass:"hleft"},[e("el-button",{attrs:{type:"primary",size:"mini"}},[e("a",{attrs:{href:"https://www.logpay.cn/account/#/user/cmeal"}},[a._v("修改套餐")])]),a._v(" "),a.mf?e("p",[a._v("免费版")]):a.bz?e("p",[a._v("标准版")]):a.gj?e("p",[a._v("高级版")]):e("p",[a._v(a._s(a.otherMeal))])],1),a._v(" "),e("div",{staticClass:"hright"},[e("el-button",{attrs:{type:"success",size:"mini"}},[e("a",{attrs:{href:"https://www.logpay.cn/account/#/user/recharge"}},[a._v("账户充值")])]),a._v(" "),e("p",[a._v(a._s(a.money))])],1)]),a._v(" "),e("div",{staticClass:"today"},[e("p",{staticStyle:{"text-align":"center"}},[a._v("交易额数据")]),a._v(" "),e("el-table",{staticStyle:{width:"100%"},attrs:{data:a.tod_yes_data,border:""}},[e("el-table-column",{attrs:{align:"center",prop:"tod_yes",label:""}}),a._v(" "),e("el-table-column",{attrs:{align:"center",prop:"all",label:"总收入"}}),a._v(" "),e("el-table-column",{attrs:{align:"center",prop:"ali",label:"支付宝"}}),a._v(" "),e("el-table-column",{attrs:{align:"center",prop:"wx",label:"微信支付"}})],1),a._v(" "),e("div",{staticClass:"yes_tod_data"},[e("p",{staticStyle:{"text-align":"center"}},[a._v("订单数据")]),a._v(" "),e("el-table",{staticStyle:{width:"100%"},attrs:{data:a.yes_tod_data,border:""}},[e("el-table-column",{attrs:{align:"center",prop:"yes_tod",label:""}}),a._v(" "),e("el-table-column",{attrs:{align:"center",prop:"all_orderNumber",label:"总订单数"}}),a._v(" "),e("el-table-column",{attrs:{align:"center",prop:"no_orderNumber",label:"未回调订单数"},scopedSlots:a._u([{key:"default",fn:function(t){return[e("span",{staticStyle:{color:"red"}},[a._v(a._s(t.row.no_orderNumber))])]}}])}),a._v(" "),e("el-table-column",{attrs:{align:"center",prop:"pay_orderNumber",label:"付款订单数"}}),a._v(" "),e("el-table-column",{attrs:{align:"center",prop:"pay_all",label:"总收入"}})],1)],1)],1)])},[],!1,null,"46ff62b2",null);i.options.__file="index.vue";t.default=i.exports},"T+HA":function(a,t,e){"use strict";var l=e("fMhq");e.n(l).a},fMhq:function(a,t,e){}}]);