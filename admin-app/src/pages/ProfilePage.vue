<template>
  <q-page padding>
    <div class="text-h4 q-mb-md">Личный кабинет</div>

    <!-- Business Information Card -->
    <q-card class="q-mb-md">
      <q-card-section>
        <div class="text-h6 q-mb-md">Информация о сервисе</div>

        <q-form @submit="saveProfile" class="q-gutter-md">
          <q-input
            v-model="businessForm.name"
            label="Название сервиса"
            outlined
            dense
            :rules="[val => !!val || 'Название обязательно']"
            hint="Например: Автомойка Премиум"
          />

          <q-input
            v-model="businessForm.address"
            label="Адрес"
            outlined
            dense
            :rules="[val => !!val || 'Адрес обязателен']"
            hint="Полный адрес с улицей и номером дома"
          />

          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-input
                v-model="businessForm.phone"
                label="Телефон"
                outlined
                dense
                mask="+7 (###) ###-##-##"
                :rules="[val => !!val || 'Телефон обязателен']"
                hint="Телефон для клиентов"
              />
            </div>
            <div class="col-12 col-md-6">
              <q-input
                v-model="businessForm.email"
                label="Email (необязательно)"
                outlined
                dense
                type="email"
                hint="Email для связи с клиентами"
              />
            </div>
          </div>

          <q-input
            v-model="businessForm.description"
            label="Описание"
            outlined
            dense
            type="textarea"
            rows="3"
            hint="Краткое описание вашего сервиса"
          />

          <div class="row q-col-gutter-md">
            <div class="col-6">
              <q-input
                v-model="businessForm.lat"
                label="Широта"
                outlined
                dense
                readonly
                hint="Географическая широта"
              />
            </div>
            <div class="col-6">
              <q-input
                v-model="businessForm.lon"
                label="Долгота"
                outlined
                dense
                readonly
                hint="Географическая долгота"
              />
            </div>
          </div>

          <div class="q-mt-md">
            <q-btn
              label="Сохранить информацию"
              type="submit"
              color="primary"
              :loading="loadingSaveProfile"
              :disable="loadingSaveProfile"
            />
          </div>
        </q-form>
      </q-card-section>
    </q-card>

    <!-- Business Hours Card -->
    <q-card>
      <q-card-section>
        <div class="text-h6 q-mb-md">Время работы</div>

        <q-form @submit="saveBusinessHours" class="q-gutter-md">
          <div v-for="(day, index) in businessHours" :key="index" class="row q-col-gutter-md items-center q-mb-sm">
            <div class="col-12 col-md-3">
              <div class="text-weight-medium">{{ getDayName(index) }}</div>
            </div>

            <div class="col-12 col-md-2">
              <q-checkbox
                v-model="day.is_closed"
                label="Выходной"
                dense
                @update:model-value="toggleDayClosed(index)"
              />
            </div>

            <div class="col-12 col-md-3">
              <q-input
                v-model="day.open_time"
                label="Открытие"
                outlined
                dense
                mask="##:##"
                :disable="day.is_closed"
                placeholder="09:00"
              >
                <template v-slot:append>
                  <q-icon name="schedule" class="cursor-pointer">
                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                      <q-time v-model="day.open_time" format24h :disable="day.is_closed">
                        <div class="row items-center justify-end">
                          <q-btn v-close-popup label="Закрыть" color="primary" flat />
                        </div>
                      </q-time>
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </div>

            <div class="col-12 col-md-3">
              <q-input
                v-model="day.close_time"
                label="Закрытие"
                outlined
                dense
                mask="##:##"
                :disable="day.is_closed"
                placeholder="18:00"
              >
                <template v-slot:append>
                  <q-icon name="schedule" class="cursor-pointer">
                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                      <q-time v-model="day.close_time" format24h :disable="day.is_closed">
                        <div class="row items-center justify-end">
                          <q-btn v-close-popup label="Закрыть" color="primary" flat />
                        </div>
                      </q-time>
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </div>
          </div>

          <div class="q-mt-md">
            <q-btn
              label="Сохранить время работы"
              type="submit"
              color="primary"
              :loading="loadingSaveHours"
              :disable="loadingSaveHours"
            />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script>
import { defineComponent, ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'

export default defineComponent({
  name: 'ProfilePage',

  setup() {
    const $q = useQuasar()

    const businessForm = ref({
      name: '',
      address: '',
      phone: '',
      email: '',
      description: '',
      lat: null,
      lon: null
    })

    const businessHours = ref([
      { day_of_week: 0, open_time: null, close_time: null, is_closed: true },
      { day_of_week: 1, open_time: null, close_time: null, is_closed: true },
      { day_of_week: 2, open_time: null, close_time: null, is_closed: true },
      { day_of_week: 3, open_time: null, close_time: null, is_closed: true },
      { day_of_week: 4, open_time: null, close_time: null, is_closed: true },
      { day_of_week: 5, open_time: null, close_time: null, is_closed: true },
      { day_of_week: 6, open_time: null, close_time: null, is_closed: true }
    ])

    const loadingSaveProfile = ref(false)
    const loadingSaveHours = ref(false)

    const getDayName = (dayIndex) => {
      const days = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье']
      return days[dayIndex]
    }

    const toggleDayClosed = (index) => {
      if (businessHours.value[index].is_closed) {
        businessHours.value[index].open_time = null
        businessHours.value[index].close_time = null
      }
    }

    const loadBusinessProfile = async () => {
      try {
        const response = await api.get('/admin/business/profile')
        businessForm.value = {
          name: response.data.name,
          address: response.data.address,
          phone: response.data.phone,
          email: response.data.email || '',
          description: response.data.description || '',
          lat: response.data.lat,
          lon: response.data.lon
        }
      } catch (error) {
        console.error('Error loading business profile:', error)
        $q.notify({
          type: 'negative',
          message: 'Ошибка загрузки профиля',
          caption: error.response?.data?.detail || error.message
        })
      }
    }

    const loadBusinessHours = async () => {
      try {
        const response = await api.get('/admin/business-hours')
        if (response.data && response.data.length === 7) {
          businessHours.value = response.data.map(hour => ({
            day_of_week: hour.day_of_week,
            open_time: hour.open_time || null,
            close_time: hour.close_time || null,
            is_closed: hour.is_closed
          }))
        }
      } catch (error) {
        console.error('Error loading business hours:', error)
        $q.notify({
          type: 'negative',
          message: 'Ошибка загрузки времени работы',
          caption: error.response?.data?.detail || error.message
        })
      }
    }

    const saveProfile = async () => {
      loadingSaveProfile.value = true
      try {
        await api.patch('/admin/business/profile', {
          name: businessForm.value.name,
          address: businessForm.value.address,
          phone: businessForm.value.phone,
          email: businessForm.value.email || null,
          description: businessForm.value.description || null
        })
        $q.notify({
          type: 'positive',
          message: 'Профиль успешно обновлен',
          icon: 'check_circle'
        })
      } catch (error) {
        console.error('Error saving profile:', error)
        $q.notify({
          type: 'negative',
          message: 'Ошибка сохранения профиля',
          caption: error.response?.data?.detail || error.message
        })
      } finally {
        loadingSaveProfile.value = false
      }
    }

    const saveBusinessHours = async () => {
      loadingSaveHours.value = true
      try {
        // Validate and prepare data
        const hoursData = businessHours.value.map(hour => ({
          day_of_week: hour.day_of_week,
          open_time: hour.is_closed ? null : hour.open_time,
          close_time: hour.is_closed ? null : hour.close_time,
          is_closed: hour.is_closed
        }))

        await api.put('/admin/business-hours', {
          hours: hoursData
        })

        $q.notify({
          type: 'positive',
          message: 'Время работы успешно обновлено',
          icon: 'check_circle'
        })
      } catch (error) {
        console.error('Error saving business hours:', error)
        $q.notify({
          type: 'negative',
          message: 'Ошибка сохранения времени работы',
          caption: error.response?.data?.detail || error.message
        })
      } finally {
        loadingSaveHours.value = false
      }
    }

    onMounted(() => {
      loadBusinessProfile()
      loadBusinessHours()
    })

    return {
      businessForm,
      businessHours,
      loadingSaveProfile,
      loadingSaveHours,
      getDayName,
      toggleDayClosed,
      saveProfile,
      saveBusinessHours
    }
  }
})
</script>

<style scoped>
.text-weight-medium {
  font-weight: 500;
}
</style>
