<script setup name="informdetail">
import informHttp from '@/api/informHttp';
import { ref, reactive, onMounted, watch } from 'vue';
import { ElMessage } from 'element-plus';
import timeFormatter from '@/utils/timeFormatter';
import OAMain from '@/components/OAMain.vue';
import OAPagination from '@/components/OAPagination.vue';
import OADialog from '@/components/OADialog.vue';
import { useRoute } from 'vue-router';

const route = useRoute()

let inform = reactive({
    title: '',
    content: '',
    create_time: '',
    author: {
        realname: '',
        department: {
            name: ''
        }
    }
})

onMounted( async () => {
    const pk = route.params.pk
    try {
        let data = await informHttp.getInformDetail(pk)
        Object.assign(inform, data)

    } catch (detail) {
        ElMessage.error(detail)
    }
    // 發送請求，用於閱讀通知
    await informHttp.readInform(pk)
})

</script>

<template>
    <OAMain title="通知詳情">
        <el-card>
            <template #header>
                <div style="text-align: center;">
                    <h2 style="padding-bottom: 50px;">{{ inform.title }}</h2>
                    <div>
                        <span style="margin-right: 20px;">作者: {{ inform.author.realname }}</span>
                        <span>發布時間: {{ timeFormatter.stringFromDateTime(inform.create_time) }}</span>
                    </div>
                </div>
            </template>
            <template #default>
                <div v-html="inform.content" class="content"></div>
            </template>
            <template #footer>
                閱讀量: {{ inform.read_count }}
            </template>
        </el-card>
    </OAMain>
</template>

<style scoped>
.content :deep(img) {
    max-width: 100%;
}
</style>