<template>
    <div style="width:88%;margin-top:28px;">
        <el-form :model="ruleForm2" status-icon :rules="rules2" ref="ruleForm2" label-width="100px" class="demo-ruleForm">
          <el-form-item label="旧密码" prop="oldpass">
            <el-input type="password" v-model="ruleForm2.oldpass" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item label="密码" prop="pass">
            <el-input type="password" v-model="ruleForm2.pass" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item label="确认密码" prop="checkPass">
            <el-input type="password" v-model="ruleForm2.checkPass" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleChange">提交</el-button>
          </el-form-item>
        </el-form>
    </div>
</template>
<script>
  export default {
    data() {
      var validatePass = (rule, value, callback) => {
        if (value === '') {
          callback(new Error('请输入密码'))
        } else {
          if (this.ruleForm2.checkPass !== '') {
            this.$refs.ruleForm2.validateField('checkPass')
          }
          callback()
        }
      };
      var validatePass2 = (rule, value, callback) => {
        if (value === '') {
          callback(new Error('请再次输入密码'))
        } else if (value !== this.ruleForm2.pass) {
          callback(new Error('两次输入密码不一致!'))
        } else {
          callback()
        }
      }
      return {
        ruleForm2: {
          oldpass: '',
          pass: '',
          checkPass: '',
        },
        rules2: {
          oldpass: [
            { validator: validatePass, trigger: 'blur' }
          ],
          pass: [
            { validator: validatePass, trigger: 'blur' }
          ],
          checkPass: [
            { validator: validatePass2, trigger: 'blur' }
          ]
        }
      }
    },
    methods: {
      handleChange() {
      this.$refs.ruleForm2.validate(valid => {
        if (valid) {
          this.$store.dispatch('Cpassword', this.ruleForm2).then(() => {
           this.$router.push({ path: this.redirect || '/index' })
          }).catch((data) => {
              console.log(data)
          })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    }
    }
  }
</script>