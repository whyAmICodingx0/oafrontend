<script setup name="login">
import login_img from "@/assets/image/login.png"
import { reactive } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import authHttp from '@/api/authHttp'
import { ElMessage } from 'element-plus'
import OADialog from "@/components/OADialog.vue"

const authStore = useAuthStore()
const router = useRouter()


let form = reactive({
    email: '',
    password: '',
})

const onSubmit = async () => {
    let pwdRgx = /^[0-9a-zA-Z_-]{6,20}/
    let emailRgx = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/
    if (!emailRgx.test(form.email)) {
        // alert('信箱格式錯誤')
        ElMessage.info('信箱格式錯誤')
        return;
    }
    if (!pwdRgx.test(form.password)) {
        // alert('密碼格式錯誤')
        ElMessage.info('密碼格式錯誤')
        return;
    }
    // axios
    // promise
    // 配置: 設置超時時間
    // url: 完整的url
    // 1. 第一版，直接使用axios
    // axios.post('http://127.0.0.1:8000/auth/login',{
    //     email: form.email,
    //     password: form.password,
    // }).then((res) => {
    //     // then: 代表成功的情況(在這代表返回的狀態碼是200)
    //     let data = res.data;
    //     let token = data.token;
    //     let user = data.user;
    //     authStore.setUserToken(user, token)
    //     // 跳轉業面
    //     router.push({name: 'frame'})
    // }).catch((err) => {
    //     // catch: 代表失敗的情況(在這代表返回狀態碼是非200)
    //     let detail = err.response.data.detail;
    //     alert(detail)
    //     console.log(err);
    // })
    // 2. 第二版 對axios進行一層封裝
    // authHttp.login(form.email, form.password).then((res) => {
    //     // then: 代表成功的情況(在這代表返回的狀態碼是200)
    //     let data = res.data;
    //     let token = data.token;
    //     let user = data.user;
    //     authStore.setUserToken(user, token)
    //     // 跳轉業面
    //     router.push({ name: 'frame' })
    // }).catch((err) => {
    //     // catch: 代表失敗的情況(在這代表返回狀態碼是非200)
    //     let detail = err.response.data.detail;
    //     alert(detail)
    //     console.log(err);
    // })
    // 3. 第三版本改成了異步調用方式
    try {
        let data = await authHttp.login(form.email, form.password)
        let token = data.token;
        let user = data.user;
        authStore.setUserToken(user, token)
        // 跳轉業面
        router.push({ name: 'home' })
    } catch (detail) {
        // alert(detail)
        ElMessage.error(detail)
    }
}
</script>

<template>
    <div class="dowebok">
        <div class="container-login100">
            <div class="wrap-login100">
                <div class="login100-pic js-tilt" data-tilt>
                    <img :src="login_img" alt="IMG" />
                </div>

                <div class="login100-form validate-form">
                    <span class="login100-form-title"> 員工登入 </span>

                    <div class="wrap-input100 validate-input">
                        <input class="input100" type="text" name="email" placeholder="信箱" v-model="form.email" />
                        <span class="focus-input100"></span>
                        <span class="symbol-input100">
                            <i class="iconfont icon-fa-envelope" aria-hidden="true"></i>
                        </span>
                    </div>

                    <div class="wrap-input100 validate-input">
                        <input class="input100" type="password" name="password" placeholder="密碼"
                            v-model="form.password" />
                        <span class="focus-input100"></span>
                        <span class="symbol-input100">
                            <i class="iconfont icon-fa-lock" aria-hidden="true"></i>
                        </span>
                    </div>

                    <div class="container-login100-form-btn">
                        <button class="login100-form-btn" @click="onSubmit">
                            登入
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped src="@/assets/css/login.css"></style>
<style scoped src="@/assets/iconfont/iconfont.css"></style>