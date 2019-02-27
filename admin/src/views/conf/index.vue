<template>
  <div class="wrapper">
    <div class="crumbs">
      <el-breadcrumb separator="/">
          <el-breadcrumb-item style="margin:1% 0 0 3%;font-size:20px;">应用配置参数</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="header">
      <div class="top">
        <div class="uid">商户uid
          <p>{{ uid }}</p>
        </div>
        <div class="token">商户token
          <p>{{ token }}</p>
        </div>
      </div>    
      <div>
      <a href="https://www.kancloud.cn/alei123/logpay-api-document/954360" style="color:blue;display:block;">查看接口文档</a>
      </div>
    </div>
    <div class="code">
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item style="margin-bottom:10px;font-size:20px;">收款二维码上传</el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <div class="container">
            <el-upload 
                class="upload-demo"
                drag
                action="https://upload.qiniup.com"
                :data='upData'
                :before-upload="beforeAvatarUpload"
                :on-success="upSuccess">
                <i class="el-icon-upload"></i>
                <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
                <div class="el-upload__tip" slot="tip">只能上传jpg/png/jpge文件，且不超过2MB</div>
            </el-upload>
            <div class="attention">
                <p style="color:red;">注意!&nbsp;&nbsp;&nbsp;1.支付宝收款推荐使用支付宝userid(企业,个人都可以),收款支付宝扫描二维码获得userid</p>
            <img src="../../assets/images/userid.jpg" />
            <div class="userid">
               <el-input v-model="userid" placeholder="填写扫描所得的userid"></el-input>
               <el-button type="danger" @click="submitUserid" round>配置</el-button> 
            </div>
            </div>
            <!-- 二维码展示 -->
            <template>
                <el-table
                    :data="qrCode"
                    style="width: 100%"
                    :row-class-name="tableRowClassName">
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
                    prop="pay_url"
                    align="center"
                    label="支付url">
                    </el-table-column>
                    <el-table-column label="操作" align="center">
                        <template slot-scope="scope">
                            <el-button
                            size="mini"
                            type="danger"
                            @click="handleDelete(scope.row)">删除</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </template>
            <!-- 分页 -->
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
</template>
<script>
import axios from 'axios'
import { mapGetters } from 'vuex'
export default {
  name: 'recharge',
  data() {
    return {
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
        userid:''
    }
    },
    mounted () {
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
    methods:{
        submitUserid () {
            if (!this.userid || this.userid.length != 16) {
                this.$message.error('请认真配置支付宝收款userid')
                return
            }
            axios.post('http://logpay.paywz.cn/user/userid',{ uid:this.uid ,userid:this.userid})
                 .then( data =>{
                     if(data = 'success') {
                         this.$message.success('配置成功')
                     } else {
                     this.$message.error('配置失败!请重新配置')
                     }
                 })
                 .catch( err =>{
                     this.$message.error('配置失败!请重新配置')
                 })
        },
        handleDelete (row) { // 删除
                let that = this
                that.$confirm('确定删除此收款二维码?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(async () => {
                    let result = await that.delQrCode(row._id)
                    if (result == '删除成功!') {
                        that.$message({
                            type: 'success',
                            message: result
                        });
                        that.getQrList()
                    } else {
                        that.$message({
                            type: 'error',
                            message: result
                        });
                    }
                    
                }).catch(() => {
                    that.$message({
                        type: 'info',
                        message: '已取消删除'
                    });          
                });
            },
            delQrCode (id) {
                return new Promise(async (res, rej) => {
                    axios({
                        url: 'http://logpay.paywz.cn/qrcode/del',
                        method: 'delete',
                        data: {
                            id: id
                        }
                    }).then(result => {
                        res(result.data.msg)
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
                    url: 'http://logpay.paywz.cn/qrcode/updata',
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
                    url: 'http://logpay.paywz.cn/qrcode/all',
                    method: 'get',
                    params: {
                        uid: this.uid,
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
            upSuccess (response, file, fileList) { // 图片上传成功
                let staticUrl = this.$staticUrl
                this.getQrContent(staticUrl + file.response.key)
            },
            getQrContent (url) {
                let self = this
                axios({
                    url: 'http://logpay.paywz.cn/qrcode/add',
                    method: 'post',
                    data: {url: url,uid:self.uid}
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
  .header {
    border-radius: 8px;
    background-color: #eeeeee;
    width: 94%;
    height: 118px;
    margin: 0 auto;
    margin-top: 8px;
    .top {
        width: 100%;
    display: flex;
    .uid {
      margin-left: 16px;
      margin-top: 10px;
      p {
        color: #ffffff;
        border-radius: 10px;
        padding: 6px;
        height: 30px;
        background-color: #cccccc;
      }
    }
    .token {
      margin-top: 10px;
      margin-left: 20px;
      p {
        font-size: 16px;
        color: #ffffff;
        border-radius: 10px;
        padding: 6px;
        height: 30px;
        background-color: #cccccc;
      }
    }
  }
  a {
      margin-left: 28px;
    }
  }
  .code {
    padding-top: 1.8%;
    width: 94%;
    margin: 0 auto;
  }
  .attention {
      .userid {
          width: 100%;
          display: inline-block;
          .el-input {
              width: 70%;
          }
          .el-button {
              margin-left: 10px;
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