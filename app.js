const { createApp, nextTick, onMounted, ref, computed } = Vue

const REMOTE_URL = 'https://book.niceinfos.com/demo/27/api'
const HOST_URL = './api'

/**
 * API 網址
 */
const PAINS_API_URL = `${HOST_URL}/pains.json`
const SERVICES_API_URL = `${HOST_URL}/services.json`
const PROCESSES_API_URL = `${HOST_URL}/processes.json`
const ABOUTS_API_URL = `${HOST_URL}/abouts.json`
const PARTNERS_API_URL = `${HOST_URL}/partners.json`
const FAQS_API_URL = `${HOST_URL}/faqs.json`

const CONTACT_API_URL = `${REMOTE_URL}/contact.php`

const GAS_URL = 'https://script.google.com/macros/s/AKfycby52Flz3GNdKMXPx__7iJqw-j38I4BaZu2tKaAR7uJKVgkGwLmM7So1opzwu5z3Sf8caw/exec'
const GAS_TOKEN = '584bfe20c42fb5581f7c9a82b2c0a2ab4e308a806e9a26ee5e9e9636ef33502a'

/**
 * 1. 靜態內容轉為資料欄位
 * 2. 使用陣列變數儲存資料
 * 3. 套入 v-for 確認資料是否正確
 * 4. 建立 json 檔案儲存資料
 * 5. 使用 api 取得資料
 * 6. 再次確認資料是否正確
 */

const app = createApp({
    setup() {
        const mobileMenuOpen = ref(false)
        const pains = ref([])
        const services = ref([])
        const processes = ref([])
        const abouts = ref([])
        const partners = ref([])
        const faqs = ref([])
        const form = ref({})
        const formContactTypeOptions = ref([
            { value: 'email', label: 'Email' },
            { value: 'phone', label: '電話' },
            { value: 'line', label: 'Line' },
        ])
        const formServiceOptions = ref([
            { value: 'takeover', label: '網站接管' },
            { value: 'refresh', label: '網站改版' },
            { value: 'custom', label: '客製開發' },
            { value: 'proposal', label: '合作提案' },
            { value: 'undetermined', label: '還不確定' },
        ])
        const formSending = ref(false)
        const stats = ref(null)
        const statsLoading = ref(false)
        const statsError = ref('')
        const dailyChartCanvas = ref(null)
        const serviceChartCanvas = ref(null)
        const contactChartCanvas = ref(null)
        const statusChartCanvas = ref(null)
        const chartInstances = []
        const chartPalette = ['#16705c', '#c66a3d', '#183f34', '#8ba398', '#dd681a', '#53685e']

        /**
         * 切換手機選單開關
         */
        const toggleMobileMenu = () => {
            mobileMenuOpen.value = !mobileMenuOpen.value
        }

        /**
         * 將數字前面補上 0，如果數字小於 10
         * @param {*} number
         * @returns 補上 0 的數字
         */
        const prefixNumber = (number) => {
            if (number < 10) {
                number = `0${number}`
            }
            return number
        }

        /**
         * 取得 API 資料
         * @param {string} apiUrl - API 網址
         * @returns {Array} API 資料
         */
        const getApi = async (apiUrl) => {
            try {
                const response = await fetch(apiUrl, {
                    mode: 'no-cors',
                })
                if (!response.ok) {
                    throw new Error('Failed to fetch data')
                }
                const data = await response.json()
                return data
            } catch (error) {
                console.error('Error fetching data:', error)
                return []
            }
        }

        /**
         * 初始化痛點資料
         */
        const initPains = async () => {
            pains.value = await getApi(PAINS_API_URL)
        }

        /**
         * 初始化服務資料
         */
        const initServices = async () => {
            services.value = await getApi(SERVICES_API_URL)
        }

        /**
         * 初始化流程資料
         */
        const initProcesses = async () => {
            processes.value = await getApi(PROCESSES_API_URL)
        }

        /**
         * 初始化關於我們資料
         */
        const initAbouts = async () => {
            abouts.value = await getApi(ABOUTS_API_URL)
        }

        /**
         * 初始化夥伴資料
         */
        const initPartners = async () => {
            partners.value = await getApi(PARTNERS_API_URL)
        }

        /**
         * 初始化常見問題資料
         */
        const initFaqs = async () => {
            faqs.value = await getApi(FAQS_API_URL)
        }

        /**
         * 發送表單
         * @returns
         */
        const submitContact = async () => {
            if (formSending.value || !canSubmitContact.value) {
                return
            }
            formSending.value = true

            let payload = {
                name: form.value.name,
                contact_type: form.value.contact_type,
                contact_value: '',
                service: form.value.service,
                message: form.value.message,
                website: form.value.website,
                consent: form.value.consent,
            }

            if (form.value.contact_type === 'email') {
                payload.contact_value = form.value.email
            }
            if (form.value.contact_type === 'phone') {
                payload.contact_value = form.value.phone
            }
            if (form.value.contact_type === 'line') {
                payload.contact_value = form.value.line
            }

            payload.service = formServiceOptions.value.find((option) => option.value === form.value.service).label

            // await submitFormData(payload)
            await submitGAS(payload)
            formSending.value = false
            formReset()
        }

        function newRequestId() {
            if (window.crypto && typeof window.crypto.randomUUID === 'function') return window.crypto.randomUUID()
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
                const random = (Math.random() * 16) | 0
                const value = char === 'x' ? random : (random & 0x3) | 0x8
                return value.toString(16)
            })
        }

        const submitGAS = async (payload) => {
            try {
                payload.requestId = newRequestId()
                payload.contactType = payload.contact_type
                payload.contactValue = payload.contact_value
                payload.consent = payload.consent ? 'yes' : 'no'
                delete payload.contact_type
                delete payload.contact_value
                let options = {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
                    body: new URLSearchParams(payload),
                    redirect: 'follow',
                    credentials: 'omit',
                }
                const response = await fetch(GAS_URL, options)
                if (!response.ok) {
                    throw new Error('Failed to submit form data')
                }
                const data = await response.json()
                console.log(data)
            } catch (error) {
                console.error('Error submitting form data:', error)
            }
        }

        /**
         * 發送表單資料 POST
         * @param {*} payload
         */
        const submitFormData = async (payload) => {
            let formData = new FormData()
            for (let key in payload) {
                formData.append(key, payload[key])
            }

            try {
                let options = {
                    method: 'POST',
                    body: formData,
                }
                const response = await fetch(CONTACT_API_URL, options)
                if (!response.ok) {
                    throw new Error('Failed to submit form data')
                }
                const data = await response.json()
                console.log(data)
            } catch (error) {
                console.error('Error submitting form data:', error)
            }
        }

        const destroyCharts = () => {
            chartInstances.forEach((chart) => chart.destroy())
            chartInstances.length = 0
        }

        const renderCharts = () => {
            if (!stats.value || typeof Chart === 'undefined') {
                return
            }
            destroyCharts()
            Chart.defaults.font.family = "'Noto Sans TC', 'PingFang TC', sans-serif"
            Chart.defaults.color = '#53685e'

            const daily = stats.value.daily || []
            chartInstances.push(
                new Chart(dailyChartCanvas.value, {
                    type: 'bar',
                    data: {
                        labels: daily.map((item) => item.date.slice(5)),
                        datasets: [
                            {
                                label: '詢問數',
                                data: daily.map((item) => item.count),
                                backgroundColor: '#16705c',
                                borderRadius: 4,
                            },
                        ],
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false } },
                        scales: {
                            y: { beginAtZero: true, ticks: { precision: 0 }, grid: { color: '#e7efe9' } },
                            x: { grid: { display: false } },
                        },
                    },
                })
            )

            const doughnut = (canvas, items) => {
                chartInstances.push(
                    new Chart(canvas, {
                        type: 'doughnut',
                        data: {
                            labels: items.map((item) => item.label),
                            datasets: [
                                {
                                    data: items.map((item) => item.count),
                                    backgroundColor: chartPalette,
                                    borderWidth: 0,
                                },
                            ],
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                legend: { position: 'bottom' },
                            },
                        },
                    })
                )
            }

            doughnut(serviceChartCanvas.value, stats.value.services || [])
            doughnut(contactChartCanvas.value, stats.value.contacts || [])
            doughnut(statusChartCanvas.value, stats.value.statuses || [])
        }

        const getGASData = async () => {
            statsLoading.value = true
            statsError.value = ''
            let days = 7
            let options = {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
                body: new URLSearchParams({ action: 'stats', days: String(days), token: GAS_TOKEN }),
                credentials: 'omit',
                redirect: 'follow',
            }
            try {
                const response = await fetch(GAS_URL, options)
                if (!response.ok) {
                    throw new Error('Failed to fetch data')
                }
                const data = await response.json()
                if (!data.ok || !data.stats) {
                    throw new Error(data.code || 'FORMAT')
                }
                stats.value = data.stats
                console.log(stats.value)
                await nextTick()
                renderCharts()
            } catch (error) {
                stats.value = null
                statsError.value = '無法取得詢問統計，請稍後再試。'
                console.error('Error fetching GAS stats:', error)
            } finally {
                statsLoading.value = false
            }
        }

        /**
         * 重置表單
         */
        const formReset = () => {
            form.value = {
                name: '',
                email: '',
                phone: '',
                line: '',
                contact_type: 'email',
                service: 'takeover',
                message: '',
                consent: false,
                website: '', // 蜜罐(honeypot)欄位，正常表單維持空白(防止機器人 spam)
            }
        }

        /**
         * 是否可以提交表單
         * @returns {boolean}
         */
        const canSubmitContact = computed(() => {
            if (formSending.value) {
                return false
            }
            if (!form.value.name) {
                return false
            }
            if (form.value.contact_type === 'email' && !form.value.email) {
                return false
            }
            if (form.value.contact_type === 'phone' && !form.value.phone) {
                return false
            }
            if (form.value.contact_type === 'line' && !form.value.line) {
                return false
            }
            if (!form.value.service) {
                return false
            }
            if (!form.value.message) {
                return false
            }
            if (!form.value.consent) {
                return false
            }
            if (form.value.website) {
                return false
            }

            return true
        })

        onMounted(() => {
            console.log('APP MOUNTED')
            formReset()
            initPains()
            initServices()
            initProcesses()
            initAbouts()
            initPartners()
            initFaqs()
            getGASData()
        })

        return {
            mobileMenuOpen,
            pains,
            services,
            processes,
            abouts,
            partners,
            faqs,
            form,
            formContactTypeOptions,
            formServiceOptions,
            canSubmitContact,
            formSending,
            stats,
            statsLoading,
            statsError,
            dailyChartCanvas,
            serviceChartCanvas,
            contactChartCanvas,
            statusChartCanvas,
            prefixNumber,
            toggleMobileMenu,
            submitContact,
        }
    },
})

app.mount('#app')
