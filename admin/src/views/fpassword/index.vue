<template>
    <div class="fpassword-container">
      <el-form ref="FpasswordForm" :model="FpasswordForm" :rules="FpasswordRule" class="fpassword-form" auto-complete="on" label-position="left">
        <h3 class="title">重置密码</h3>
        <el-form-item prop="email">
          <span class="svg-container">
            <svg-icon icon-class="user" />
          </span>
          <el-input 
          v-model="FpasswordForm.email" 
          name="email" 
          type="email" 
          auto-complete="on" 
          placeholder="请输入要重置密码的邮箱" />
        </el-form-item>
        <el-form-item>
          <el-button :loading="loading" type="success" style="width:100%;" @click.native.prevent="handleForget">
            提交
          </el-button>
          <el-button type="primary" style="width:100%;margin:0 auto;margin-top:5px;" @click.native.prevent="back">
            返回登陆
          </el-button>
        </el-form-item>
      </el-form>
    </div>
</template>

<script>
import axios from 'axios'
export default {
  name: 'fpassword',
  data() {
    const validateEmail = (rule, value, callback) => {
      if (!/^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/.test(value)) {
        callback(new Error('请输入正确的邮箱'))
      } else {
        callback()
      }
    }
    return {
      checked:false,
      FpasswordForm: {
        email: ''
      },
      FpasswordRule: {
        email: [{ required: true, trigger: 'blur', validator: validateEmail }]
      },
      loading: false,
      redirect: undefined
    }
  },
  methods: {
    handleForget() {
    axios.post('http://logpay.paywz.cn/user/passwordreset',{ email:this.FpasswordForm.email })
         .then( res => {
           if (res.data.code === -1) {
             this.$message.error(res.data.msg)
           }
           this.$message.success(res.data.msg)
         })
         .catch(err=> this.$message.error(err))
    },
    back() {
        location.href = '/'
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss">
$bg:transparent;
$light_gray:#333;

/* reset element-ui css */
.fpassword-container {
  .el-input {
    display: inline-block;
    height: 47px;
    width: 85%;
    input {
      background: transparent;
      border: 0px;
      -webkit-appearance: none;
      border-radius: 0px;
      padding: 12px 5px 12px 15px;
      color: $light_gray;
      height: 47px;
      &:-webkit-autofill {
        -webkit-box-shadow: 0 0 0px 1000px $bg inset !important;
        -webkit-text-fill-color: #333 !important;
      }
      .el-input__inner {
        color: #333;
      }
    }
  }
  .el-form-item {
    border: 1px solid rgba(255, 255, 255, 1);
    // background: rgba(0, 0, 0, 0.2);
    border-radius: 5px;
    color: #333;
  }
}

</style>

<style rel="stylesheet/scss" lang="scss" scoped>
$dark_gray:#333;
$light_gray:#454545;
.fpassword-container {
  position: fixed;
  background-size: cover;
  background-position: center 0;
  background-image: url('../../assets/images/bg.jpg');
  width:100%;
  height:100%;
  .fpassword-form {
    background-color: #fff;
    position: absolute;
    left: 0;
    right: 0;
    width: 488px;
    max-width: 88%;
    padding: 35px 35px 15px 35px;
    margin: 120px auto;
  }
  .tips {
    font-size: 14px;
    color: #fff;
    margin-bottom: 10px;
    span {
      &:first-of-type {
        margin-right: 16px;
      }
    }
  }
  .svg-container {
    padding: 6px 5px 6px 15px;
    color: $dark_gray;
    vertical-align: middle;
    width: 30px;
    display: inline-block;
  }
  .title {
    font-size: 26px;
    font-weight: 400;
    color: $light_gray;
    margin: 0px auto 40px auto;
    text-align: center;
    font-weight: bold;
  }
  .show-pwd {
    position: absolute;
    right: 10px;
    top: 7px;
    font-size: 16px;
    color: $dark_gray;
    cursor: pointer;
    user-select: none;
  }
}
</style>
