<template>
    <div class="login-container" ref="login-container">
      <el-form ref="loginForm" :model="loginForm" :rules="loginRules" class="login-form" auto-complete="on" label-position="left">
        <h3 class="title">LogPay 收款系统</h3>
        <el-form-item prop="email">
          <span class="svg-container">
            <svg-icon icon-class="user" />
          </span>
          <el-input 
          v-model="loginForm.email"
          name="email" 
          type="email" 
          auto-complete="on" 
          placeholder="邮箱" />
        </el-form-item>
        <el-form-item prop="password">
          <span class="svg-container">
            <svg-icon icon-class="password" />
          </span>
          <el-input
            :type="pwdType"
            v-model="loginForm.password"
            name="password"
            auto-complete="on"
            placeholder="密码"
            @keyup.enter.native="handleLogin" />
          <span class="show-pwd" @click="showPwd">
            <svg-icon :icon-class="pwdType === 'password' ? 'eye' : 'eye-open'" />
          </span>
        </el-form-item>
        <el-checkbox v-model="checked" style="margin-bottom:3px;">注册一个新用户</el-checkbox>
        <el-checkbox v-model="rememberAccount" style="margin-bottom:3px;float:right;">记住密码</el-checkbox>
        <a href="/account/#/user/argeement" v-if="checked" style="color:#409EFF;display:block;text-align:center;margin:5px 0;font-size:15px;">注册即代表同意《LogPay 用户协议》</a>
        <el-form-item>
          <el-button :loading="loading" type="success" style="width:100%;" @click.native.prevent="handleLogin" v-if="!checked">
            登陆
          </el-button>
          <el-button :loading="loading" type="primary" style="width:100%;" @click.native.prevent="handleRegister" v-else>
            注册
          </el-button>
          <el-button style="width:100%;backgroundColor:#F2F6FC;margin:0 auto;margin-top:5px;" @click.native.prevent="handleFpassword">
            忘记密码?
          </el-button>
        </el-form-item>
      </el-form>
    </div>
</template>

<script>
export default {
  name: 'Login',
  data() {
    const validateEmail = (rule, value, callback) => {
      if (!/^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/.test(value)) {
        callback(new Error('请输入正确的邮箱'))
      } else {
        callback()
      }
    }
    const validatePass = (rule, value, callback) => {
      if (value.length < 5) {
        callback(new Error('密码不能小于5位'))
      } else {
        callback()
      }
    }
    return {
      // 记住密码
      rememberAccount: true,
      checked:false,
      loginForm: {
        email: '',
        password: ''
      },
      loginRules: {
        email: [{ required: true, trigger: 'blur', validator: validateEmail }],
        password: [{ required: true, trigger: 'blur', validator: validatePass }]
      },
      loading: false,
      pwdType: 'password',
      redirect: undefined
    }
  },
  watch: {
    $route: {
      handler: function(route) {
        this.redirect = route.query && route.query.redirect
      },
      immediate: true
    }
  },
  methods: {
    showPwd() {
      if (this.pwdType === 'password') {
        this.pwdType = ''
      } else {
        this.pwdType = 'password'
      }
    },
    handleRegister() {
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          this.loading = true
          //判断复选框是否被勾选 勾选则调用配置cookie方法
          if (this.rememberAccount == true) {
              //传入账号名，密码，和保存天数3个参数
              this.setCookie(this.loginForm.email, this.loginForm.password, 1314)
          }else {
            console.log("清空Cookie")
            //清空Cookie
            this.clearCookie()
          }
          this.$store.dispatch('Register', this.loginForm).then(() => {
            this.loading = false
            this.$router.push({ path: this.redirect || '/' })
          }).catch(() => {
            this.loading = false
          })
        } else {
          return false
        }
      })
    },
    handleLogin() {
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          this.loading = true
          //判断复选框是否被勾选 勾选则调用配置cookie方法
          if (this.rememberAccount == true) {
              //传入账号名，密码，和保存天数3个参数
              this.setCookie(this.loginForm.email, this.loginForm.password, 1314)
          }else {
            console.log("清空Cookie")
            //清空Cookie
            this.clearCookie()
          }
          this.$store.dispatch('Login', this.loginForm).then(() => {
            this.loading = false
            this.$router.push({ path: this.redirect || '/' })
          }).catch((err) => {
            this.loading = false
          })
        } else {
          return false
        }
      })
    },
    handleFpassword() {
      location.href = '/account/#/user/fpassword'
    },
    //设置cookie
    setCookie(c_name, c_pwd, exdays) {
        let exdate = new Date(); //获取时间
        exdate.setTime(exdate.getTime() + 24 * 60 * 60 * 1000 * exdays); //保存的天数
        //字符串拼接cookie
        window.document.cookie = "email" + "=" + c_name + ";path=/;expires=" + exdate.toGMTString();
        window.document.cookie = "password" + "=" + c_pwd + ";path=/;expires=" + exdate.toGMTString();
    },
    //读取cookie
    getCookie() {
        if (document.cookie.length > 0) {
            let arr = document.cookie.split('; ') //这里显示的格式需要切割一下自己可输出看下
            for (let i = 0; i < arr.length; i++) {
                let arr2 = arr[i].split('=') //再次切割
                //判断查找相对应的值
                if (arr2[0] == 'email') {
                  //  console.log(arr2[1])
                    this.loginForm.email = arr2[1] //保存到保存数据的地方
                } else if (arr2[0] == 'password') {
                  // console.log(arr2[1])
                    this.loginForm.password = arr2[1]
                }
            }
        }
    },
    //清除cookie
    clearCookie() {
        this.setCookie("", "", -1) //修改2值都为空，天数为负1天就好了
    }
  },
  mounted() {
    this.getCookie()
  }
}
</script>

<style rel="stylesheet/scss" lang="scss">
$bg:transparent;
$light_gray:#333;

/* reset element-ui css */
.login-container {
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
.login-container {
  position: fixed;
  background-size: cover;
  background-position:top center;
  background-image: url('../../assets/images/bg.jpg');
  width:100%;
  height:100%;
  background-color: #fff;
  background-repeat: no-repeat;
  .login-form {
    border-radius:10px;
    background-color: #fff;
    position: absolute;
    left: 0;
    right: 0;
    width: 433px;
    max-width: 88%;
    padding: 20px 26px 8px 26px;
    margin: 13% auto;
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
    margin: 12px auto 30px auto;
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
