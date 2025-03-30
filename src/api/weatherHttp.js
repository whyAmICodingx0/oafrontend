import http from "./http";


const getHomeWeather = () => {
    const path = '/cwa/home/weather'
    return http.get(path)
}

const getWeatherData = (city) => {
    const path = '/cwa/weather'
    const params = { city }
    return http.get(path, params)
}

export default{
    getHomeWeather,
    getWeatherData
}