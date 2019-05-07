<template>
  <div class="wrapper">
    <div class="crumbs">
      <el-breadcrumb separator="/">
          <el-breadcrumb-item style="margin:1% 0;font-size:20px;">API接口参数</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="header">
            <div class="top">
                <label>uid：</label>
                <span>{{ uid }}</span>
                <label>&nbsp;&nbsp;&nbsp;token：</label>
                <span>{{ token }}</span>
            </div>
    </div>
    <div class="phone">
        <div>
          <el-breadcrumb separator="/">
            <el-breadcrumb-item style="margin:1% 0;font-size:20px;">配置手机</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="addPhone">
        <el-button type="success" style="margin:1% 0;" @click="handleAddPhone()">增加收款手机</el-button>
        <el-select style="margin-left:46px;width:128px;" v-if="codeEdit" v-model="value" placeholder="请选择">
        <el-option
        v-for="item in phoneIds"
        :key="item.value"
        :label="item.label"
        :value="item.value"
        >
        </el-option>
        </el-select>
        <el-button type="primary" style="margin:1% 0 1% 46px;" v-if="codeEdit" @click="limitMoney()">设置限额(默认无限额)</el-button>
        <span style="color:green;" v-if="codeEdit">（*多手机并且开启收款时，将轮询收款，如果希望关闭某个手机收款，点击关闭收款即可，如果收款超过限额或没有合适二维码将跳至其他合适手机）</span>
        </div>
        <el-dialog title="设置限额" :visible.sync="limitMoneyEdit" :width="dialogWidth" top="200px">
            <el-form :model="limitForm">
                <el-form-item label="支付宝" :label-width="formLabelWidth">
                    <el-input v-model="limitForm.alipayLimit" autocomplete="off" placeholder="例:100"></el-input>
                </el-form-item>
                <el-form-item label="微信" :label-width="formLabelWidth">
                    <el-input v-model="limitForm.wxpayLimit" autocomplete="off" placeholder="例:100"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="limitMoneyEdit = false">取 消</el-button>
                <el-button type="primary" @click="cLimitMoney()">确 定</el-button>
            </div>
        </el-dialog>
        <div class="code" v-if="codeEdit">
            <div class="crumbs">
                <el-breadcrumb separator="/">
                    <el-breadcrumb-item style="margin:5px 0;font-size:16px;">手机 {{ value }} 收款二维码管理</el-breadcrumb-item>
                    <el-switch
                    style="display: inline-block;"
                    v-model="openPhone"
                    active-color="#13ce66"
                    inactive-color="#ff4949"
                    active-text="开启收款"
                    inactive-text="关闭收款">
                    </el-switch>
                </el-breadcrumb>
            </div>
            <div class="remark">
                    <div class="accountRow">
                        支付宝<el-input v-model="alipayRemark" placeholder="用于备注可不填"></el-input>
                    </div>
                    <span style="margin-left:10px;"></span>
                    <div class="accountRow">
                        <span></span>
                        微信<el-input v-model="wxpayRemark" placeholder="用于备注可不填"></el-input>
                    </div>
                    <el-button type="danger" style="margin-left:10px;" @click="submitRemark" round>备注</el-button>
            </div>
            <div class="container">
                <div class="attention">
                    <p style="color:red;">第1步.用收款手机 {{ value }} 的支付宝扫描二维码下方获得userid，并在下方配置(*不使用支付宝可跳过)。</p>
                <img src="../../assets/images/userid.jpg" />
                <div class="userid">
                <el-input v-model="userid" placeholder="填写扫描所得的userid"></el-input>
                <el-button type="danger" @click="submitUserid" round>配置</el-button>
                </div>
                </div>
                <p style="color:red;">第2步.上传手机 {{ value }} 的微信支付宝二维码(至少要上传支付宝微信的任意码即不固定码 <a style="color:blue;" target="_blank" href="https://www.logpay.cn/document/#getCode">怎么获取收款二维码？</a>)。</p>
                <el-upload
                    :multiple = "true"
                    class="upload-demo"
                    drag
                    action="https://upload.qiniup.com"
                    :data='upData'
                    :file-list="fileList"
                    :before-upload="beforeAvatarUpload"
                    :on-success="upSuccess"
                    :on-exceed="handleExceed"
                    :limit="300">
                    <i class="el-icon-upload"></i>
                    <div class="el-upload__text">将二维码照片拖到此处，或<em>点击上传</em></div>
                    <div class="el-upload__tip" slot="tip">单次最多上传300张<span style="color:red;">(*可批量多选上传，如需更大量上传请联系客服)</span></div>
                </el-upload>
                <p style="color:red;">第3步. <el-button type="success" style="margin:10px 0;" @click="handleTest()">线上测试</el-button></p>
                <el-dialog title="线上测试" :visible.sync="testEdit" :width="dialogWidth" top="100px">
                    <el-form :model="testForm">
                        <el-form-item label="金额" :label-width="formLabelWidth">
                            <el-input v-model="testForm.price" autocomplete="off" placeholder="例:100"></el-input>
                        </el-form-item>
                        <el-form-item label="支付渠道" :label-width="formLabelWidth">
                            <el-select  v-model="pay_type" placeholder="请选择">
                                <el-option
                                v-for="item in pay_types"
                                :key="item.pay_type"
                                :label="item.label"
                                :value="item.pay_type"
                                >
                                </el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item label="用户名" :label-width="formLabelWidth">
                            <el-input v-model="testForm.orderUid" autocomplete="off" placeholder="例:88888888@qq.com"></el-input>
                        </el-form-item>
                        <el-form-item label="商品名称" :label-width="formLabelWidth">
                            <el-input v-model="testForm.orderName" autocomplete="off" placeholder="例:vip充值"></el-input>
                        </el-form-item>
                        <el-form-item label="异步回调地址" :label-width="formLabelWidth">
                            <el-input v-model="testForm.notifyUrl" autocomplete="off" placeholder="www.logpay.cn/notifyUrl"></el-input>
                        </el-form-item>
                        <el-form-item label="异步回调地址" :label-width="formLabelWidth">
                            <el-input v-model="testForm.returnUrl" autocomplete="off" placeholder="可不填"></el-input>
                        </el-form-item>
                    </el-form>
                    <div slot="footer" class="dialog-footer">
                        <el-button @click="testEdit = false">取 消</el-button>
                        <el-button type="primary" @click="submitTest()">确 定</el-button>
                    </div>
                </el-dialog>
                <p style="color:red;">第4步.下载<a style="color:blue;" href="https://api.logpay.cn/download/SDK">对接文件</a>，并安装<a style="color:blue;" href="https://api.logpay.cn/download/APK">LogPay收款助手(安卓)</a>，然后认真阅读<a style="color:blue;" href="https://www.kancloud.cn/alei123/logpay-api-document/954360">接口文档</a>就可以收款了。（*收款的小问题和原理请参考<a href="https://www.logpay.cn/document" style="color:blue;">详细文档</a>）</p>
                <template>
                    <div class="handleDelete"><span style="color:green;">(*默认启用)</span>
                    <el-button type="warning" style="margin:10px 0;" @click="handleCodeOpen(false, 'select', null)">禁用选中</el-button>
                    <el-button type="warning" style="margin:10px 0;" @click="handleCodeOpen(false, 'all', null)">禁用全部</el-button>
                    <el-button type="warning" style="margin:10px 0;" @click="handleCodeOpen(false, 'payType', '微信')">禁用全部微信</el-button>
                    <el-button type="warning" style="margin:10px 0;" @click="handleCodeOpen(false, 'payType', '支付宝')">禁用全部支付宝</el-button>
                    <el-button type="success" style="margin:10px 0;" @click="handleCodeOpen(true, 'select', null)">启用选中</el-button>
                    <el-button type="success" style="margin:10px 0;" @click="handleCodeOpen(true, 'all', null)">启用全部</el-button>
                    <el-button type="success" style="margin:10px 0;" @click="handleCodeOpen(true, 'payType', '微信')">启用全部微信</el-button>
                    <el-button type="success" style="margin:10px 0;" @click="handleCodeOpen(true, 'payType', '支付宝')">启用全部支付宝</el-button>
                    <el-button type="danger" style="margin:10px 0;" @click="handleDelete('select', null)">清除选中</el-button>
                    <el-button type="danger" style="margin:10px 0;" @click="handleDelete('all', null)">清除全部</el-button>
                    <el-button type="danger" style="margin:10px 0;" @click="handleDelete('payType', '微信')">清除全部微信</el-button>
                    <el-button type="danger" style="margin:10px 0;" @click="handleDelete('payType', '支付宝')">清除全部支付宝</el-button>
                    </div>
                    <el-table
                        ref="multipleTable"
                        :data="qrCode"
                        style="width: 100%;margin-top:10px;"
                        :row-class-name="tableRowClassName"
                        border
                        @selection-change="handleSelectionChange"
                        >
                        <el-table-column
                        type="selection"
                        align="center"
                        width="55">
                        </el-table-column>
                        <el-table-column
                        align="center"
                        prop="type"
                        label="收款方式"
                        width="100"
                        :filters="[{ text: '微信', value: '微信' }, { text: '支付宝', value: '支付宝' }]"
                        :filter-method="filterTag">
                        </el-table-column>
                        <el-table-column
                        prop="price"
                        align="center"
                        label="金额">
                        </el-table-column>
                        <el-table-column
                        prop="payUrl"
                        align="center"
                        label="支付url"
                        width="400px;">
                        </el-table-column>
                        <el-table-column label="操作" align="center">
                            <template slot-scope="scope">
                            <el-button type="warning" size="mini" @click="handleCodeOpen(false, scope.row, null)" v-if="scope.row.open">禁用</el-button>
                            <el-button type="success" size="mini" @click="handleCodeOpen(true, scope.row, null)" v-else>启用</el-button>
                            <span style="height:6px;"></span>
                            <el-button size="mini" type="danger" @click="handleDelete('one', scope.row)">删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </template>
                <el-pagination
                background
                :pageSize="10"
                layout="prev, pager, next"
                :total="page.total"
                @current-change="nextPage">
                </el-pagination>
            </div>
        </div>
    </div>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
import { get_userid ,submit_userid, get_phoneIds, add_phone, get_phone_open, c_phone_open, get_limit_money, c_limit_money, submit_remark, get_remark} from '@/api/user'
import { open_code, remove_type, remove_all, remove_select, del_qrcode, up_qiniu, get_qr_list, get_qr_content } from '@/api/qrcode'
export default {
  name: 'recharge',
  data() {
    return {
      // 支付宝备注
      alipayRemark:'',
      // 微信备注
      wxpayRemark:'',
      // form的label宽度
      formLabelWidth: '110px',
      dialogWidth:'92%',
      screenWidth: document.body.clientWidth,  //设置的监听屏幕的变化
      // 是否开启手机收款
      openPhone: true,
      // 是否有码编辑页面
      codeEdit: false,
      // 线上测试
      testEdit: false,
      value: '',
      phoneIds: [],
      fileList:[],
      upData: {
        token: '',
        key: ''
        },
        page: {
        page: 1,
        num: 10,
        total: 0
        },
        qrCode: [],
        userid:'',
        //多选数组
        multipleSelection: [],
        // 是否拉起设置限额
        limitMoneyEdit:false,
        // 设置限额表单
        limitForm:{},
        // 线上测试表单
        testForm:{},
        // pay_types
        pay_types: [{
          pay_type: 'wxpay',
          label: '微信'
        }, {
          pay_type: 'alipay',
          label: '支付宝'
        }],
        pay_type:'wxpay'
    }
    },
    mounted () {
        this.getScreenWidth()
        this.getPhoneIds()
        this.upqiniu()
        },
    computed: {
      ...mapGetters([
        'uid',
        'token',
        'email'
      ]),
      unreadNum(){
            return this.unread.length;
        }
    },
    watch:{
        value (val, oldval) {
            this.getPhoneOpen()
            this.getQrList()
            this.getLimitMoney()
            this.getUserid()
            this.getRemark()
        },
        openPhone (val, oldval) {
            this.cPhoneOpen(val)
        }
    },
    methods:{
        // 获取账号备注
        async getRemark() {
            let params = {
                uid:this.uid,
                phoneId:this.value
            }
            let res = await get_remark(params)
            this.alipayRemark = res.data.alipayRemark
            this.wxpayRemark = res.data.wxpayRemark
        },
        // 提交修改
        async submitRemark() {
            let data = {
                uid:this.uid,
                phoneId:this.value,
                alipayRemark:this.alipayRemark,
                wxpayRemark:this.wxpayRemark
            }
            let res = await submit_remark(data)
            this.$message.success(res.msg)
            this.getRemark()
        },
        // 打开测试页面
        handleTest() {
            this.testEdit = true
            this.testForm.price = 1
            this.testForm.notifyUrl = 'www.logpay.cn'
            this.testForm.returnUrl = ''
            this.testForm.orderUid = this.email
            this.testForm.orderName = 'test'
       },
        // 提交表单
        submitTest() {
            this.testForm.payType = this.pay_type
            location.href = `https://api.logpay.cn/user/test?price=${this.testForm.price}&payType=${this.testForm.payType}&orderUid=${this.testForm.orderUid}&orderName=${this.testForm.orderName}&notifyUrl=${this.testForm.notifyUrl}&returnUrl=${this.testForm.returnUrl}&uid=${this.uid}&token=${this.token}`
        },
        // 获得userid
        async getUserid () {
        let params = {
            uid:this.uid,
            phoneId:this.value
        }
        let res = await get_userid(params)
        this.userid = res.data
        },
        // 适应手机
        getScreenWidth() {
            if (this.screenWidth < 990) {
                this.dialogWidth = '98%'
            } else {
                this.dialogWidth = '42%'
            }
        },
        // 改变限额
        async cLimitMoney() {
            this.limitMoneyEdit = false
            let data = {
                uid:this.uid,
                phoneId:this.value,
                wxpayLimit:this.limitForm.wxpayLimit,
                alipayLimit:this.limitForm.alipayLimit
            }
            let res = await c_limit_money(data)
            this.$message.success(res.msg)
            this.getLimitMoney()
        },
        // 获取限额
        async getLimitMoney () {
            let params = {
                uid:this.uid,
                phoneId:this.value
            }
            let res = await get_limit_money(params)
            this.limitForm = res.data
        },
        // 设置限额
        limitMoney() {
            this.limitMoneyEdit = true
        },
        // 禁用，启动二维码
        handleCodeOpen (Bool, row, payType) {
                let that = this
                let word = ''
                if (Bool) {
                    word = '启用'
                } else {
                    word = '禁用'
                }
                that.$confirm('确定'+ word +'?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(async () => {
                    let res = await that.handleOpenCode(Bool, row, payType)
                        that.$message.success(res.msg)
                        that.getQrList()
                }).catch((err) => {
                    console.log(err)
                })
            },
        // 是否启用，禁用该二维码
        handleOpenCode (Bool, row, payType) {
            return new Promise( async (resolve, reject)=>{
                let data = {}
                if (row === 'all') {
                    data = {
                        uid:this.uid,
                        open:Bool,
                        phoneId:this.value
                    }
                } else if (row === 'select') {
                    if (this.multipleSelection.length == 0) {
                       return this.$message.error('未发现选中')
                    }
                    data = {
                        uid:this.uid,
                        open:Bool,
                        phoneId:this.value,
                        selectId:this.multipleSelection
                    }
                } else if (row === 'payType') {
                    data = {
                        uid:this.uid,
                        open:Bool,
                        phoneId:this.value,
                        payType
                    }
                } else {
                    data = {
                        uid:this.uid,
                        phoneId:this.value,
                        id:row._id,
                        open: Bool
                    }
                }
                let res = await open_code(data)
                resolve(res)
            })
        },
        // 删除选中
        handleDeletePayType(payType) {
            return new Promise( async (resolve, reject)=>{
                let data = {
                    uid:this.uid,
                    phoneId:this.value,
                    payType
                }
                let res = await remove_type(data)
                resolve(res)
            })
        },
        handleDeleteSelect() {
            return new Promise( async (resolve, reject)=>{
                if (this.multipleSelection.length == 0) {
                return this.$message.error('未发现选中')
                }
                let data = {
                    uid:this.uid,
                    phoneId:this.value,
                    qrcode:this.multipleSelection
                }
                let res = await remove_select(data)
                resolve(res)
            })
        },
        handleDeleteAll() {
            return new Promise( async (resolve, reject)=>{
                let data = {
                    uid:this.uid,
                    phoneId:this.value
                }
                let res = await remove_all(data)
                resolve(res)
            })
        },
        // 多选
        toggleSelection(rows) {
            if (rows) {
            rows.forEach(row => {
                this.$refs.multipleTable.toggleRowSelection(row)
            })
            } else {
            this.$refs.multipleTable.clearSelection()
            }
        },
        // 获得选择列表
        handleSelectionChange(val) {
            val = val.map(v=>{
                return v._id
            })
            this.multipleSelection = val
        },
        // 关闭开启收款手机
        async cPhoneOpen(openPhone) {
            let data = {
                uid:this.uid,
                phoneId:this.value,
                openPhone
            }
            let res = await c_phone_open(data)
            if (res.code != 0) {
                this.$message.success(res.msg)
            }
            this.getPhoneOpen()
        },
        // 获得手机开启情况
        async getPhoneOpen () {
            let params = {
                uid:this.uid,
                phoneId:this.value
            }
            let res = await get_phone_open(params)
            this.openPhone = res.data
        },
        // 增加收款手机
        async handleAddPhone () {
            let data = {
                uid:this.uid
            }
            let res = await add_phone(data)
            this.$message.success('添加手机'+ res.msg + '成功')
            this.getPhoneIds()
        },
        // 读取用户手机列表
        async getPhoneIds () {
            let list = []
            let params = {
                uid:this.uid
            }
            let res = await get_phoneIds(params)
            res.data.forEach(v=>{
                list.push({value:v.id,label:'手机'+ v.id})
            })
            this.phoneIds = list
            if (this.phoneIds.length > 0) {
                this.codeEdit = true
                this.value = '1'
            }
        },
        handleExceed (files, fileList) {
            this.$message.warning(`请刷新页面或删除文件，二维码文件堆压缓存过多，如有特殊需要请联系客服`)
        },
        // 提交userid
        async submitUserid () {
            if (!this.userid || this.userid.length != 16) {
                this.$message.error('请认真配置支付宝收款userid')
                return
            }
            let data = { uid:this.uid , phoneId:this.value, userid:this.userid }
            let res = await submit_userid(data)
            this.$message.success(res.msg)
            this.getUserid()
        },
        handleDelete (type, row) { // 删除
                let that = this
                that.$confirm('确定删除?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(async () => {
                    let res = {}
                    if (type === 'one') {
                        res = await that.delQrCode(row._id)
                    } else if (type === 'all') {
                        res = await that.handleDeleteAll()
                    } else if (type === 'select') {
                        res = await that.handleDeleteSelect()
                    } else if (type === 'payType') {
                        res = await that.handleDeletePayType(row)
                    }
                    that.$message.success(res.msg)
                    that.getQrList()
                }).catch((err) => {
                    console.log(err)
                })
            },
            delQrCode (id) {
                return new Promise( async (resolve, reject) => {
                    let data = {
                        id: id
                    }
                    let res = await del_qrcode(data)
                    resolve(res)
                })
            },
            nextPage (val) {
                this.page.page = val;
                this.getQrList()
            },
            filterTag (value, row, column) {
                const property = column['property'];
                return row[property] === value;
            },
            tableRowClassName({row,status}) {
                if (row.status == 1) { // 二维已经绑定
                    return 'warning-row';
                } else if (row.status == 0) { // 二维码未绑定订单
                    return 'success-row';
                }
                    return '';
            },
            async upqiniu () {
                let res = await up_qiniu()
                this.upData.token = res.data.toKen
            },
            async getQrList () {
                let params = {
                    uid: this.uid,
                    phoneId: this.value,
                    page: this.page.page,
                    num: this.page.num
                }
                let res = await get_qr_list(params)
                this.qrCode = res.data.data
                this.page.total = res.data.result.length

            },
            beforeAvatarUpload(file) {
                // const isJPG = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/jpg'
                const isLt2M = file.size / 1024 / 1024 < 2
                // if (!isJPG) {
                // this.$message.error('上传图片只能是 JPG /PNG / JPEG格式!')
                // }
                if (!isLt2M) {
                this.$message.error('上传图片不能大于 2MB!')
                }
                this.upData.key = + new Date() + '.' + file.type.substring(6) // 更改上传图片名称
                return isLt2M
            },
            upSuccess (response, file, fileList) {// 图片上传成功
                let staticUrl = this.$staticUrl
                this.getQrContent(staticUrl + response.key)
            },
            async getQrContent (url) {
                let data = {url: url, uid: this.uid, phoneId: this.value}
                let res = await get_qr_content(data)
                this.$message.success(res.msg)
                this.getQrList()
            }
    }
}
</script>
<style lang="scss" scoped>
.wrapper {
    width: 96%;
    height: 100%;
    margin: 0 auto;
  .header {
    position:relative;
    border-radius: 8px;
    width: 100%;
    height: 100%;
    background-color: #eeeeee;
    margin-top: 8px;
    .top {
        white-space:nowrap;
        overflow-x:auto;
        overflow-y:hidden;
        display:-webkit-box;
        padding: 20px 13px;
        span {
        display: inline;
        color: #ffffff;
        border-radius: 5px;
        padding: 6px;
        background-color: #cccccc;
        }
    }
    a {
    display: block;
    margin-left: 13px;
    margin-bottom: 8px;
    }
  }
  .phone {
      .crumbs {
        white-space:nowrap;
        overflow-x:auto;
        overflow-y:hidden;
        display:-webkit-box;
        width: 100%;
      }
      .addPhone {
        display: inline-block;
        white-space:nowrap;
        overflow-x:auto;
        overflow-y:hidden;
        display:-webkit-box;
        width: 100%;
      }
    .code {
        padding-top: 5px;
            .remark {
                white-space:nowrap;
                overflow-x:auto;
                overflow-y:hidden;
                display:-webkit-box;
                width: 100%;
                margin: 5px 0;
                .accountRow {
                    display: inline-block;
                    .el-input {
                        margin-left: 5px;
                        width: 188px;
                    }
                }
            }
            .attention {
            .userid {
                width: 100%;
                display: inline-block;
                .el-input {
                    width: 268px;
                }
                .el-button {
                    margin-left: 10px;
                }
                }
            }
            .handleDelete {
                white-space:nowrap;
                overflow-x:auto;
                overflow-y:hidden;
                display:-webkit-box;
                width: 100%;
            }
        }
  }

.message-title{
    cursor: pointer;
    margin-bottom: 10px;
}
.handle-row{
    margin-top: 30px;
}
.el-table .warning-row {
    background: oldlace;
}

.el-table .success-row {
    background: #f0f9eb;
}
}
</style>