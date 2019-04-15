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
            <div>
                <a href="https://www.kancloud.cn/alei123/logpay-api-document/954360" style="color:blue;display:block;">查看接口文档</a>
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
        </div>
        <el-dialog title="设置限额" :visible.sync="limitMoneyEdit" :width="dialogWidth">
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
            <div class="container">
                <div class="attention">
                    <p style="color:red;">1.用收款手机 {{ value }} 的支付宝扫描二维码下方获得userid，并在下方配置</p>
                <img src="../../assets/images/userid.jpg" />
                <div class="userid">
                <el-input v-model="userid" placeholder="填写扫描所得的userid"></el-input>
                <el-button type="danger" @click="submitUserid" round>配置</el-button>
                </div>
                </div>
                <div>

                </div>
                <p style="color:red;">2.上传手机 {{ value }} 的微信支付宝二维码(至少要上传支付宝微信的任意码即不固定码)</p>
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
                    :limit="20">
                    <i class="el-icon-upload"></i>
                    <div class="el-upload__text">将二维码照片拖到此处，或<em>点击上传</em></div>
                    <div class="el-upload__tip" slot="tip">只能上传jpg/png/jpge文件，且不超过2MB<span style="color:red;">(*可批量多选上传)</span></div>
                </el-upload>
                <template>
                    <div class="handleDelete">
                    <el-button type="success" style="margin:10px 0;" @click="handleCodeOpen(true, 'select', null)">启用选中</el-button>
                    <el-button type="success" style="margin:10px 0;" @click="handleCodeOpen(true, 'all', null)">启用全部</el-button>
                    <el-button type="success" style="margin:10px 0;" @click="handleCodeOpen(true, 'payType', '微信')">启用全部微信</el-button>
                    <el-button type="success" style="margin:10px 0;" @click="handleCodeOpen(true, 'payType', '支付宝')">启用全部支付宝</el-button>
                    <el-button type="warning" style="margin:10px 0;" @click="handleCodeOpen(false, 'select', null)">禁用选中</el-button>
                    <el-button type="warning" style="margin:10px 0;" @click="handleCodeOpen(false, 'all', null)">禁用全部</el-button>
                    <el-button type="warning" style="margin:10px 0;" @click="handleCodeOpen(false, 'payType', '微信')">禁用全部微信</el-button>
                    <el-button type="warning" style="margin:10px 0;" @click="handleCodeOpen(false, 'payType', '支付宝')">禁用全部支付宝</el-button>
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
import axios from 'axios'
import { mapGetters } from 'vuex'
export default {
  name: 'recharge',
  data() {
    return {
      // form的label宽度
      formLabelWidth: '78px',
      dialogWidth:'92%',
      screenWidth: document.body.clientWidth,  //设置的监听屏幕的变化
      // 是否开启手机收款
      openPhone: true,
      // 是否有码编辑页面
      codeEdit: false,
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
        limitForm:{}
    }
    },
    mounted () {
            this.getScreenWidth()
            this.value = '1'
            this.getPhoneIds()
            this.getPhoneOpen()
            this.upqiniu()
            this.getQrList()
        },
    computed: {
      ...mapGetters([
        'uid',
        'token'
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
        },
        openPhone (val, oldval) {
            this.cPhoneOpen(val)
        }
    },
    methods:{
        // 获得userid
        getUserid () {
            axios({
            url: 'https://api.logpay.cn/user/getUserid?t='+Date.now(),
            method: 'get',
            params: {
                uid:this.uid,
                phoneId:this.value
            }
            }).then(res => {
                if (res.data.code == -1) {
                    this.$message.error(res.data.msg)
                    return false
                }
                if (res.data.code == 1) {
                    this.userid = res.data.data
                }
            })
            .catch(err => this.$message.error('系统繁忙请稍等' + err)) 
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
        cLimitMoney() {
            this.limitMoneyEdit = false
            axios({
                url: 'https://api.logpay.cn/user/cLimitMoney',
                method: 'post',
                data:{
                    uid:this.uid,
                    phoneId:this.value,
                    wxpayLimit:this.limitForm.wxpayLimit,
                    alipayLimit:this.limitForm.alipayLimit
                }
                }).then(res => {
                    if (res.data.code == -1) {
                        this.$message.error(res.data.msg)
                        return false
                    }
                    if (res.data.code == 1) {
                        this.$message.success(res.data.msg)
                        this.getLimitMoney()
                    }
                })
                .catch(err => this.$message.error('系统繁忙请稍等' + err))
        },
        // 获取限额
        getLimitMoney () {
            axios({
            url: 'https://api.logpay.cn/user/getLimitMoney?t='+Date.now(),
            method: 'get',
            params: {
                uid:this.uid,
                phoneId:this.value
            }
            }).then(res => {
                if (res.data.code == -1) {
                    this.$message.error(res.data.msg)
                    return false
                }
                if (res.data.code == 1) {
                    this.limitForm = res.data.data
                }
            })
            .catch(err => this.$message.error('系统繁忙请稍等' + err)) 
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
                    if (res.data.code == 1) {
                        that.$message.success(res.data.msg)
                        that.getQrList()
                    } else {
                        that.$message.error(res.data.msg)
                    }
                }).catch((err) => {
                    if (err.data) {
                        that.$message.error(err.data.msg)
                    }
                })
            },
        // 是否启用，禁用该二维码
        handleOpenCode (Bool, row, payType) {
            return new Promise((resolve, reject)=>{
                let data = {}
                if (row === 'all') {
                    data = {
                        uid:this.uid,
                        open:Bool,
                        phoneId:this.value
                    }
                } else if (row === 'select') {
                    if (this.multipleSelection.length == 0) {
                    return reject({data:{
                        code: -1,
                        msg:'未发现选中'
                    }})
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
                axios({
                url: 'https://api.logpay.cn/qrcode/codeOpen',
                method: 'post',
                data
                }).then(res => {
                    resolve(res)
                })
                .catch(err => reject(err))
            })
        },
        // 删除选中
        handleDeletePayType(payType) {
            return new Promise((resolve, reject)=>{
                axios({
                url: 'https://api.logpay.cn/qrcode/removeType',
                method: 'post',
                data:{
                    uid:this.uid,
                    phoneId:this.value,
                    payType
                }
                }).then(res => {
                    resolve(res)
                })
                .catch(err => reject(err))
            })
        },
        handleDeleteSelect() {
            return new Promise((resolve, reject)=>{
                if (this.multipleSelection.length == 0) {
                return reject({data:{
                    code: -1,
                    msg:'未发现选中'
                }})
            }
            axios({
                url: 'https://api.logpay.cn/qrcode/removeSelect',
                method: 'post',
                data:{
                    uid:this.uid,
                    phoneId:this.value,
                    qrcode:this.multipleSelection
                }
                }).then(res => {
                    resolve(res)
                })
                .catch(err => reject(err))
            })
        },
        handleDeleteAll() {
            return new Promise((resolve, reject)=>{
                axios({
                url: 'https://api.logpay.cn/qrcode/removeAll',
                method: 'post',
                data:{
                    uid:this.uid,
                    phoneId:this.value
                }
                }).then(res => {
                    resolve(res)
                })
                .catch(err => reject(err))
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
        cPhoneOpen(openPhone) {
            axios({
                url: 'https://api.logpay.cn/user/cPhoneOpen',
                method: 'post',
                data:{
                    uid:this.uid,
                    phoneId:this.value,
                    openPhone
                }
                }).then(res => {
                    if (res.data.code == -1) {
                        this.$message.error(res.data.msg)
                        return false
                    }
                    if (res.data.code == 1) {
                        this.$message.success(res.data.msg)
                        this.getPhoneOpen()
                    }
                })
                .catch(err => this.$message.error('系统繁忙请稍等' + err))
        },
        // 获得手机开启情况
        getPhoneOpen () {
            axios({
                url: 'https://api.logpay.cn/user/getPhoneOpen?t='+Date.now(),
                method: 'get',
                params: {
                    uid:this.uid,
                    phoneId:this.value
                }
                }).then(res => {
                    if (res.data.code == -1) {
                        this.$message.error(res.data.msg)
                        return false
                    }
                    if (res.data.code == 1) {
                        this.openPhone = res.data.data
                    }
                })
                .catch(err => this.$message.error('系统繁忙请稍等' + err))
        },
        // 增加收款手机
        handleAddPhone () {
            axios({
                url: 'https://api.logpay.cn/user/addPhone',
                method: 'post',
                data:{
                    uid:this.uid
                }
                }).then(res => {
                    if (res.data.code == -1) {
                        this.$message.error(res.data.msg)
                        return false
                    }
                    this.$message.success('添加手机'+ res.data.msg + '成功')
                    this.getPhoneIds()
                })
                .catch(err => this.$message.error('系统繁忙请稍等' + err))
        },
        // 读取用户手机列表
        getPhoneIds () {
            let list = []
            axios({
                url: 'https://api.logpay.cn/user/getPhone',
                method: 'get',
                params: {
                    uid:this.uid
                }
                }).then(res => {
                    if (res.data.code == -1) {
                        this.$message.error(res.data.msg)
                        return false
                    }
                    res.data.data.forEach(v=>{
                        list.push({value:v.id,label:'手机'+ v.id})
                    })
                    this.phoneIds = list
                    if (this.phoneIds.length > 0) {
                        this.codeEdit = true
                    }
                })
                .catch(err => this.$message.error('系统繁忙请稍等' + err))
        },
        handleExceed (files, fileList) {
            this.$message.warning(`请刷新页面或删除文件，二维码文件堆压缓存过多，如有协助需要请联系客服`)
        },
        submitUserid () {
            if (!this.userid || this.userid.length != 16) {
                this.$message.error('请认真配置支付宝收款userid')
                return
            }
            axios.post('https://api.logpay.cn/user/userid',{ uid:this.uid , phoneId:this.value, userid:this.userid})
                 .then( res =>{
                    if (res.data.code == -1) {
                        this.$message.error(res.data.msg)
                        return false
                    }
                     if(res.data.code == 1) {
                         this.$message.success(res.data.msg)
                     }
                 })
                 .catch( err =>{
                     this.$message.error('系统繁忙请稍等' + err)
                 })
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
                    if (res.data.code == 1) {
                        that.$message.success(res.data.msg)
                        that.getQrList()
                    } else {
                        that.$message.error(res.data.msg)
                    }
                }).catch((err) => {
                    if (err.data) {
                        that.$message.error(err.data.msg)
                    }
                })
            },
            delQrCode (id) {
                return new Promise(async (resolve, reject) => {
                    axios({
                        url: 'https://api.logpay.cn/qrcode/del',
                        method: 'delete',
                        data: {
                            id: id
                        }
                    }).then(res => {
                        resolve(res)
                    }).catch(err =>{
                        reject(err)
                    })
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
            upqiniu (e) {
                let self = this
                axios({
                    url: 'https://api.logpay.cn/qrcode/updata',
                    method: 'post',
                }).then(res  => {
                    if (res.data.code == -1) {
                         this.$message.error(res.data.msg);
                         return false
                    } else {
                        self.upData.token = res.data.data.toKen
                    }
                })
            },
            getQrList () {
                axios({
                    url: 'https://api.logpay.cn/qrcode/all',
                    method: 'get',
                    params: {
                        uid: this.uid,
                        phoneId: this.value,
                        page: this.page.page,
                        num: this.page.num
                    }
                }).then(res => {
                    if (res.data.code == -1) {
                        this.$message.error(res.data.msg)
                        return false
                    }
                    this.qrCode = res.data.data.data
                    this.page.total = res.data.data.result.length
                })
            },
            beforeAvatarUpload(file) {
                const isJPG = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/jpg';
                const isLt2M = file.size / 1024 / 1024 < 2;
                if (!isJPG) {
                this.$message.error('上传图片只能是 JPG /PNG / JPEG格式!');
                }
                if (!isLt2M) {
                this.$message.error('上传图片不能大于 2MB!');
                }
                this.upData.key = + new Date() + '.' + file.type.substring(6); // 更改上传图片名称
                return isJPG && isLt2M;
            },
            upSuccess (response, file, fileList) {// 图片上传成功
                let staticUrl = this.$staticUrl
                this.getQrContent(staticUrl + response.key)
            },
            getQrContent (url) {
                let self = this
                axios({
                    url: 'https://api.logpay.cn/qrcode/add',
                    method: 'post',
                    data: {url: url,uid:self.uid, phoneId: this.value}
                }).then(res => {
                    if (res.data.code == -1) {
                        this.$message.error(res.data.msg)
                        return false
                    } else {
                        this.$message.success(res.data.msg)
                        this.getQrList()
                    }
                })
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