<script setup name="weather">
import { ref, reactive, onMounted, watch } from 'vue';
import { ElMessage } from 'element-plus';
import OAMain from '@/components/OAMain.vue';
import weatherHttp from '@/api/weatherHttp';
import * as echarts from 'echarts';


const taiwanCities = [
    "宜蘭縣",
    "花蓮縣",
    "臺東縣",
    "澎湖縣",
    "金門縣",
    "連江縣",
    "臺北市",
    "新北市",
    "桃園市",
    "臺中市",
    "臺南市",
    "高雄市",
    "基隆市",
    "新竹市",
    "嘉義市",
    "新竹縣",
    "苗栗縣",
    "彰化縣",
    "南投縣",
    "雲林縣",
    "嘉義縣",
    "屏東縣"
];
let selectedCity = ref('')
let weatherData = ref([])

watch(selectedCity, async (newCity) => {
    if (!newCity) return
    try {
        console.log(newCity)
        const res = await weatherHttp.getWeatherData(newCity)
        console.log('res', res)
        weatherData.value = res
        console.log(weatherData.value)

        var myChart = echarts.init(document.getElementById('weather-chart'));

        const categories = res.溫度.map(item => item.time.replace('T', ' '));
        const temps = res.溫度.map(item => Number(item.value));
        const apparentTemps = res.體感溫度.map(item => Number(item.value));

        const minTemp = Math.min(...temps, ...apparentTemps);
        const yMin = Math.floor(minTemp) - 1;

        const option = {
            backgroundColor: '#1f1f1f',
            tooltip: {
                trigger: 'axis',
                formatter: params => {
                    const t = params[0];
                    const a = params[1];
                    const rawTime = t.axisValue;
                    const date = new Date(rawTime);
                    return `
                            ${date.toLocaleString()}<br/>
                            溫度：${t.data}°C<br/>
                            體感：${a.data}°C
                        `;
                }
            },
            grid: {
                bottom: 100
            },
            xAxis: {
                type: 'category',
                data: categories,
                axisLabel: {
                    color: '#fff',
                    formatter: value => {
                        const date = new Date(value);
                        return `${String(date.getHours()).padStart(2, '0')}`;
                    }
                }
            },
            yAxis: {
                type: 'value',
                name: '溫度(°C)',
                min: yMin,
                axisLabel: {
                    formatter: '{value} °C',
                    color: '#fff'
                },
                splitLine: { lineStyle: { color: '#444' } }
            },
            series: [
                {
                    name: '溫度',
                    type: 'line',
                    data: temps,
                    symbol: 'circle',
                    label: {
                        show: true,
                        position: 'top',
                        color: '#fff'
                    },
                    lineStyle: {
                        color: '#f1f1f1'
                    }
                },
                {
                    name: '體感溫度',
                    type: 'line',
                    data: apparentTemps,
                    symbol: 'diamond',
                    label: {
                        show: true,
                        position: 'bottom',
                        color: '#f19c9c'
                    },
                    lineStyle: {
                        color: '#f19c9c'
                    }
                }
            ],
        };

        myChart.setOption(option);

    } catch (err) {
        ElMessage.error('取得天氣資料失敗')
    }
})
</script>

<template>
    <OAMain title="天氣預報">
        <el-row :gutter="20">
            <el-col :span="6">
                <el-card>
                    <el-select v-model="selectedCity" placeholder="請選擇地區" style="width: 100%;">
                        <el-option v-for="city in taiwanCities" :key="city" :label="city" :value="city"
                            style="text-align: center;" />
                    </el-select>
                </el-card>
            </el-col>
            <el-col :span="18">
                <el-card>
                    <template #header>
                        <h2>天氣預報</h2>
                    </template>
                    <div id="weather-chart" style="width: 100%;height:500px;"></div>
                </el-card>
            </el-col>
        </el-row>
    </OAMain>

</template>

<style scoped>
:deep(.el-select__placeholder) {
    text-align: center;
}
</style>