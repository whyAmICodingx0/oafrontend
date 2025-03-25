<script setup name="frame">
import { ref, computed, reactive, onMounted } from 'vue';
import { Expand, Fold } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router'
import authHttp from '@/api/authHttp';
import { ElMessage } from 'element-plus';
import routes from '@/router/frame'

const authStore = useAuthStore()
const router = useRouter()


let displayUser = reactive({
    department: {},
    realname: ''
})
let isCollapse = ref(false);
let dialogVisible = ref(false);
let formLabelWidth = '100px'
let resetPwdForm = reactive({
    oldpwd: '',
    pwd1: '',
    pwd2: ''
})
let formTag = ref()
let rules = reactive({
    oldpwd: [
        { required: true, message: '請輸入舊密碼', trigger: 'blur' },
        { min: 6, max: 20, message: '密碼長度需6~20之間', trigger: 'blur' },
    ],
    pwd1: [
        { required: true, message: '請輸入新密碼', trigger: 'blur' },
        { min: 6, max: 20, message: '密碼長度需6~20之間', trigger: 'blur' },
    ],
    pwd2: [
        { required: true, message: '請輸入新密碼', trigger: 'blur' },
        { min: 6, max: 20, message: '密碼長度需6~20之間', trigger: 'blur' },
    ],
})
let asideWidth = computed(() => {
    if (isCollapse.value) {
        return '64px'
    }
    else {
        return '250px'
    }
})

onMounted(() => {
    displayUser.department = authStore.user.department
    displayUser.realname = authStore.user.realname
})

const onCollapse = () => {
    isCollapse.value = !isCollapse.value
}

const onExit = () => {
    authStore.clearUserToken();
    router.push({ name: 'login' })
}

const onControlResetPwdDialog = () => {
    resetPwdForm.oldpwd = ""
    resetPwdForm.pwd1 = ""
    resetPwdForm.pwd2 = ""
    dialogVisible.value = true
}

const onSubmit = () => {
    formTag.value.validate(async (valid, fields) => {
        if (valid) {
            try {
                await authHttp.resrtPwd(resetPwdForm.oldpwd, resetPwdForm.pwd1, resetPwdForm.pwd2)
                ElMessage.success('密碼修改成功')
                dialogVisible.value = false
            } catch (detail) {
                ElMessage.error(detail)
            }
        } else {
            ElMessage.info('請案要求填寫字段')
        }
    })
}

</script>

<template>
    <el-container class="container">
        <el-aside class="aside" :width=asideWidth>
            <router-link to="/" class="brand"><strong>OA</strong><span v-show="!isCollapse">系統</span></router-link>
            <el-menu :router="true" active-text-color="#ffd04b" background-color="#343a40" class="el-menu-vertical-demo"
                :default-active="router.currentRoute.value.name" text-color="#fff" :collapse="isCollapse" :collapse-transition="false">
                <template v-for="route in routes[0].children">
                    <template v-if="authStore.has_permission(route.meta.permissions, route.meta.opt)">
                        <el-menu-item v-if="!route.children" :index="route.name" :route="{ name: route.name }">
                            <el-icon>
                                <component :is="route.meta.icon"></component>
                            </el-icon>
                            <span>{{ route.meta.text }}</span>
                        </el-menu-item>

                        <el-sub-menu v-else :index="route.name">
                            <template #title>
                                <el-icon>
                                    <component :is="route.meta.icon"></component>
                                </el-icon>
                                <span>{{ route.meta.text }}</span>
                            </template>

                            <template v-for="child in route.children">
                                <template v-if="authStore.has_permission(child.meta.permissions, child.meta.opt)">
                                    <el-menu-item v-if="!child.meta.hidden" :index="child.name"
                                        :route="{ name: child.name }">
                                        <el-icon>
                                            <component :is="child.meta.icon"></component>
                                        </el-icon>
                                        {{ child.meta.text }}
                                    </el-menu-item>
                                </template>
                            </template>
                        </el-sub-menu>
                    </template>
                </template>
            </el-menu>
        </el-aside>
        <el-container>
            <el-header class="header">
                <div class="left-header">
                    <el-button v-show="isCollapse" :icon="Expand" @click="onCollapse" />
                    <el-button v-show="!isCollapse" :icon="Fold" @click="onCollapse" />
                </div>
                <el-dropdown>
                    <span class="el-dropdown-link">
                        <el-avatar :size="30" icon="UserFilled" />
                        <span style="margin-left: 10px;">[{{ displayUser.department.name }}]{{
                            displayUser.realname
                        }}</span>
                        <el-icon class="el-icon--right">
                            <arrow-down />
                        </el-icon>
                    </span>
                    <template #dropdown>
                        <el-dropdown-menu>
                            <el-dropdown-item @click="onControlResetPwdDialog">修改密碼</el-dropdown-item>
                            <el-dropdown-item divided @click="onExit">退出登入</el-dropdown-item>
                        </el-dropdown-menu>
                    </template>
                </el-dropdown>
            </el-header>
            <el-main class="main">
                <RouterView></RouterView>
            </el-main>
        </el-container>
    </el-container>
    <el-dialog v-model="dialogVisible" title="修改密碼" width="500">
        <el-form :model="resetPwdForm" :rules="rules" ref="formTag">
            <el-form-item label="舊密碼" :label-width="formLabelWidth" prop="oldpwd">
                <el-input v-model="resetPwdForm.oldpwd" autocomplete="off" type="password" />
            </el-form-item>
            <el-form-item label="新密碼" :label-width="formLabelWidth" prop="pwd1">
                <el-input v-model="resetPwdForm.pwd1" autocomplete="off" type="password" />
            </el-form-item>
            <el-form-item label="新密碼" :label-width="formLabelWidth" prop="pwd2">
                <el-input v-model="resetPwdForm.pwd2" autocomplete="off" type="password" />
            </el-form-item>
        </el-form>
        <template #footer>
            <div class="dialog-footer">
                <el-button @click="dialogVisible = false">取消</el-button>
                <el-button type="primary" @click="onSubmit">
                    確認
                </el-button>
            </div>
        </template>
    </el-dialog>
</template>

<style scoped>
.container {
    height: 100vh;
    background-color: #f4f6f9;
}

.aside {
    background-color: #343a40;
    box-shadow: 0 14px 28px rgba(0, 0, 0, .25), 0 10px 10px rgba(0, 0, 0, .22) !important;
}

.aside .brand {
    color: #fff;
    text-decoration: none;
    border-bottom: 1px solid #434a50;
    background-color: #232631;
    height: 60px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 20px;
}

.header {
    height: 60px;
    background-color: #fff;
    border-bottom: 1px solid #e6e6e6;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.el-dropdown-link {
    display: flex;
    align-items: center;
}

.el-menu {
    border-right: none;
}
</style>
