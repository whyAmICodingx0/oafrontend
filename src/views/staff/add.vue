<script setup name="staffadd">
import { ref, reactive, onMounted } from 'vue';
import OAMain from '@/components/OAMain.vue';
import OADialog from '@/components/OADialog.vue';
import { useAuthStore } from '@/stores/auth';
import { ElMessage } from 'element-plus';
import { useRouter } from 'vue-router';
import staffHttp from '@/api/staffHttp';

const router = useRouter()
const authStore = useAuthStore()

let staffForm = reactive({
    email: '',
    password: '',
    realname: '',
})
const formRef = ref()
let rules = reactive({
    email: [{ required: true, message: "請輸入郵箱！", trigger: "blur" }],
    password: [{ required: true, message: "請輸入密碼！", trigger: "blur" }],
    realname: [{ required: true, message: "請輸入真實姓名！", trigger: "blur" }],
})

const onSubmit = () => {
    formRef.value.validate(async (valid, fields) => {
        if(valid){
            try{
                await staffHttp.addStaff(staffForm.realname, staffForm.email, staffForm.password)
                ElMessage.success('員工添加成功')
                router.push({name: 'staff_list'})
            }catch(detail){
                ElMessage.error(detail)
            }
        }
    })
}


</script>

<template>
    <OAMain title="新增員工">
        <el-card shadow="always">
            <el-form :model="staffForm" :rules="rules" ref="formRef" label-width="80px">
                <el-form-item label="姓名" prop="realname">
                    <el-input v-model="staffForm.realname" placeholder="請輸入姓名" />
                </el-form-item>
                <el-form-item label="信箱" prop="email">
                    <el-input v-model="staffForm.email" placeholder="請輸入信箱" />
                </el-form-item>
                <el-form-item label="密碼" prop="password">
                    <el-input v-model="staffForm.password" placeholder="請輸入密碼" type="password" />
                </el-form-item>
                <el-form-item label="部門">
                    <el-input readonly disabled placeholder="請輸入部門" :value="authStore.user.department.name" />
                </el-form-item>
                <el-form-item label="領導">
                    <el-input readonly disabled :placeholder="'[' + authStore.user.email + ']' + authStore.user.realname" />
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="onSubmit">提交</el-button>
                </el-form-item>
            </el-form>
        </el-card>
    </OAMain>
</template>

<style scoped></style>