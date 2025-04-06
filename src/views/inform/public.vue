<script setup name="publicinform">
import OAMain from '@/components/OAMain.vue';
import { ref, reactive, onBeforeUnmount, shallowRef, onMounted, computed, watch } from 'vue';
import '@wangeditor/editor/dist/css/style.css'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import staffHttp from '@/api/staffHttp';
import { ElMessage } from 'element-plus';
import { useAuthStore } from '@/stores/auth';
import informHttp from '@/api/informHttp';
import { useRouter } from 'vue-router';

const authStore = useAuthStore()
const router = useRouter()

let informForm = reactive({
    title: '',
    content: '',
    department_ids: []
})

const rules = reactive({
    title: [{ required: true, message: '請輸入標題', trigger: 'blur' }],
    content: [{ required: true, message: '請輸入內容', trigger: 'blur' }],
    department_ids: [{ required: true, message: '請選擇部門', trigger: 'change' }],
})
let formRef = ref()
let formLabelWidth = '100px'
let departments = ref([])

//////////////////////// 下面: wangEditor相關配置 ////////////////////////
// 编辑器实例，必须用 shallowRef
const editorRef = shallowRef()

const toolbarConfig = {}
const editorConfig = {
    placeholder: '請輸入內容...',
    MENU_CONF: {
        uploadImage: {
            server: import.meta.env.VITE_BASE_URL + '/image/upload',
            fieldName: 'image',
            maxFileSize: 0.5 * 1024 * 1024,
            maxNumberOfFiles: 10,
            allowedFileTypes: ['image/*'],
            headers: {
                Authorization: 'JWT ' + authStore.token,
            },
            timeout: 6 * 1000, // 6 秒
            // 字定義插入圖片
            customInsert(res, insertFn) {
                if (res.errno == 0) {
                    let data = res.data
                    let url = import.meta.env.VITE_MEDIA_URL + data.url
                    let href = import.meta.env.VITE_MEDIA_URL + data.href
                    let alt = data.alt
                    insertFn(url, alt, href)
                }else{
                    ElMessage.error(res.message)
                }
            },
            onFailed(file, res) {
                console.log(`${file.name} 上傳失敗`, res)
            },
            onError(file, err, res) {
                if(file.size > 0.5 * 1024 * 1024){
                    ElMessage.error('圖片文件最大不能超過0.5MB')
                }else{
                    ElMessage.error('圖片格式不正確')
                }
            },
        }
    }
}
let mode = 'default'

// 组件销毁时，也及时销毁编辑器
onBeforeUnmount(() => {
    const editor = editorRef.value
    if (editor == null) return
    editor.destroy()
})

const handleCreated = (editor) => {
    editorRef.value = editor // 记录 editor 实例，重要！
}
//////////////////////// 上面: wangEditor相關配置 ////////////////////////

onMounted(async () => {
    try {
        let data = await staffHttp.getAllDepartment()
        departments.value = data.results
    } catch (detail) {
        ElMessage.error(detail)
    }
})

const onSubmit = () => {
    formRef.value.validate(async (valid, fields) => {
        if (valid) {
            try{
                let data = await informHttp.publishInform(informForm)
                console.log(data)
                
                ElMessage.success('訊息發布成功')
                router.push({name: 'inform_list'})
            }catch(detail){
                ElMessage.error(detail)
            }
        }
    })
}

</script>

<template>
    <OAMain title="發布通知">
        <el-card>
            <el-form :model="informForm" :rules="rules" ref="formRef">
                <el-form-item label="標題" :label-width="formLabelWidth" prop="title">
                    <el-input v-model="informForm.title" autocomplete="off" />
                </el-form-item>
                <el-form-item label="部門可見" :label-width="formLabelWidth" prop="department_ids">
                    <el-select multiple v-model="informForm.department_ids" placeholder="請選擇部門">
                        <el-option :value="0" label="所有部門"></el-option>
                        <el-option v-for="department in departments" :label="department.name" :value="department.id"
                            :key="department.name" />
                    </el-select>
                </el-form-item>
                <el-form-item label="內容" :label-width="formLabelWidth" prop="content">
                    <div style="border: 1px solid #ccc; width:100%">
                        <Toolbar style="border-bottom: 1px solid #ccc" :editor="editorRef"
                            :defaultConfig="toolbarConfig" :mode="mode" />
                        <Editor style="height: 500px; overflow-y: hidden;" v-model="informForm.content"
                            :defaultConfig="editorConfig" :mode="mode" @onCreated="handleCreated" />
                    </div>
                </el-form-item>
                <el-form-item>
                    <div style="text-align: right; flex: 1">
                        <el-button type="primary" @click="onSubmit">提交</el-button>
                    </div>
                </el-form-item>
            </el-form>
        </el-card>
    </OAMain>

</template>

<style scoped></style>