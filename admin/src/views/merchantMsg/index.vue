<template>
   <div class="merchantMsg">
        <!-- <el-breadcrumb separator="/">
            <el-breadcrumb-item style="margin:2% 0 0 2%;font-size:20px;">个人资料</el-breadcrumb-item>
        </el-breadcrumb> -->
    <el-form :model="merchantForm">
        <el-form-item label="邮箱：">
            <el-input v-model="merchantForm.email" ref="formWidth1" auto-complete="off" placeholder="" :disabled="true"></el-input>
        </el-form-item>
        <el-form-item label="真实姓名：">
            <el-input v-model="merchantForm.name" ref="formWidth2" auto-complete="off" placeholder="" :disabled="true"></el-input>
        </el-form-item>
    </el-form>
    </div>
</template>
<script>
import axios from 'axios'
import { mapGetters } from 'vuex'
import { constants } from 'fs';
export default {
   data() {
    return {
        screenWidth: document.body.clientWidth,
        merchantForm:{
            name:'暂不需要',
            email:''
        }
    }
    },
    computed:{
        ...mapGetters([
            'uid'
        ])
    },
    methods:{
    getScreenWidth() {
        if(this.screenWidth < 990 ) {
            this.$refs.formWidth1.$el.style.width = '60%'
            this.$refs.formWidth2.$el.style.width = '60%'
        } else {
            this.$refs.formWidth1.$el.style.width = '30%'
            this.$refs.formWidth2.$el.style.width = '30%'
        }
    },
    getMerchantMsg() {
        axios.get('http://127.0.0.1:10008/user/getMerchant',{ params: { type:'uid', value:this.uid} })
             .then( res => {
                if (res.data.code == -1) {
                this.$message.error(res.data.msg + res.data.errData)
                return false
                }
                console.log(res.data.user.email)
                this.merchantForm.email = res.data.user.email
             })
             .catch( err =>{
                this.$message.error(err.data.msg + err.data.errData)
             })
    }
    },
    mounted() {
        this.getScreenWidth()
        this.getMerchantMsg()
    }
}
</script>
<style lang="scss" scoped>
.merchantMsg {
    width: 94%;
    margin:0 auto;
    margin-top: 20px;
    .row {
        margin:0 auto;
        width: 100%;
        margin: 6px 6px;
        p {
            display: inline-block;
        }
        .el-input {
            width: 300px;
            margin-top: 3px; 
            display: inline-block;
        }
    }
}
</style>