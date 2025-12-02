<template>
  <q-page padding>
    <div class="row q-mb-md">
      <div class="col">
        <div class="text-h4">Часы работы</div>
        <div class="text-subtitle2 text-grey-7">
          Настройте расписание работы вашего сервиса
        </div>
      </div>
    </div>

    <q-card>
      <q-card-section>
        <div v-if="loading" class="text-center q-pa-lg">
          <q-spinner color="primary" size="3em" />
          <div class="q-mt-md text-grey-7">Загрузка...</div>
        </div>

        <div v-else>
          <q-list separator>
            <q-item
              v-for="(day, index) in days"
              :key="index"
              class="q-py-md"
            >
              <q-item-section style="max-width: 150px">
                <q-item-label class="text-weight-medium">
                  {{ day.name }}
                </q-item-label>
              </q-item-section>

              <q-item-section>
                <div class="row q-gutter-md items-center">
                  <!-- Переключатель работает/закрыто -->
                  <div style="width: 140px">
                    <q-toggle
                      v-model="day.isOpen"
                      :label="day.isOpen ? 'Работает' : 'Закрыто'"
                      color="primary"
                      @update:model-value="validateDay(index)"
                    />
                  </div>

                  <!-- Время открытия -->
                  <div v-if="day.isOpen" style="width: 150px">
                    <q-input
                      v-model="day.openTime"
                      label="Открытие"
                      outlined
                      dense
                      mask="time"
                      :rules="['time']"
                    >
                      <template v-slot:append>
                        <q-icon name="access_time" class="cursor-pointer">
                          <q-popup-proxy
                            cover
                            transition-show="scale"
                            transition-hide="scale"
                          >
                            <q-time
                              v-model="day.openTime"
                              format24h
                              @update:model-value="validateDay(index)"
                            >
                              <div class="row items-center justify-end">
                                <q-btn
                                  v-close-popup
                                  label="OK"
                                  color="primary"
                                  flat
                                />
                              </div>
                            </q-time>
                          </q-popup-proxy>
                        </q-icon>
                      </template>
                    </q-input>
                  </div>

                  <!-- Время закрытия -->
                  <div v-if="day.isOpen" style="width: 150px">
                    <q-input
                      v-model="day.closeTime"
                      label="Закрытие"
                      outlined
                      dense
                      mask="time"
                      :rules="['time']"
                    >
                      <template v-slot:append>
                        <q-icon name="access_time" class="cursor-pointer">
                          <q-popup-proxy
                            cover
                            transition-show="scale"
                            transition-hide="scale"
                          >
                            <q-time
                              v-model="day.closeTime"
                              format24h
                              @update:model-value="validateDay(index)"
                            >
                              <div class="row items-center justify-end">
                                <q-btn
                                  v-close-popup
                                  label="OK"
                                  color="primary"
                                  flat
                                />
                              </div>
                            </q-time>
                          </q-popup-proxy>
                        </q-icon>
                      </template>
                    </q-input>
                  </div>

                  <!-- Ошибка валидации -->
                  <div v-if="day.isOpen && day.error" class="text-negative text-caption">
                    {{ day.error }}
                  </div>
                </div>
              </q-item-section>

              <!-- Кнопка копирования на все дни -->
              <q-item-section side v-if="day.isOpen">
                <q-btn
                  flat
                  round
                  dense
                  icon="content_copy"
                  color="grey-7"
                  @click="copyToAll(index)"
                >
                  <q-tooltip>Применить ко всем дням</q-tooltip>
                </q-btn>
              </q-item-section>
            </q-item>
          </q-list>
        </div>
      </q-card-section>

      <q-separator />

      <q-card-actions align="right" class="q-pa-md">
        <q-btn
          flat
          label="Сбросить"
          color="grey-7"
          @click="loadBusinessHours"
          :disable="loading || saving"
        />
        <q-btn
          unelevated
          label="Сохранить"
          color="primary"
          @click="saveBusinessHours"
          :loading="saving"
          :disable="loading || hasErrors"
        />
      </q-card-actions>
    </q-card>

    <!-- Подсказки -->
    <q-card class="q-mt-md bg-blue-1">
      <q-card-section>
        <div class="text-subtitle2 text-primary">💡 Подсказки</div>
        <ul class="q-pl-md text-caption">
          <li>Настройте часы работы для каждого дня недели</li>
          <li>Используйте кнопку копирования для применения одного расписания ко всем дням</li>
          <li>Время открытия должно быть раньше времени закрытия</li>
          <li>Клиенты смогут записываться только в рабочие часы</li>
        </ul>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script>
import { defineComponent, ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'

export default defineComponent({
  name: 'BusinessHoursPage',

  setup() {
    const $q = useQuasar()
    const loading = ref(false)
    const saving = ref(false)

    const days = ref([
      { name: 'Понедельник', isOpen: false, openTime: '09:00', closeTime: '18:00', error: null },
      { name: 'Вторник', isOpen: false, openTime: '09:00', closeTime: '18:00', error: null },
      { name: 'Среда', isOpen: false, openTime: '09:00', closeTime: '18:00', error: null },
      { name: 'Четверг', isOpen: false, openTime: '09:00', closeTime: '18:00', error: null },
      { name: 'Пятница', isOpen: false, openTime: '09:00', closeTime: '18:00', error: null },
      { name: 'Суббота', isOpen: false, openTime: '10:00', closeTime: '16:00', error: null },
      { name: 'Воскресенье', isOpen: false, openTime: '10:00', closeTime: '16:00', error: null }
    ])

    const hasErrors = computed(() => {
      return days.value.some(day => day.error !== null)
    })

    const validateDay = (index) => {
      const day = days.value[index]
      if (!day.isOpen) {
        day.error = null
        return
      }

      if (!day.openTime || !day.closeTime) {
        day.error = 'Укажите время открытия и закрытия'
        return
      }

      if (day.openTime >= day.closeTime) {
        day.error = 'Время открытия должно быть раньше времени закрытия'
        return
      }

      day.error = null
    }

    const copyToAll = (sourceIndex) => {
      const source = days.value[sourceIndex]
      days.value.forEach((day, index) => {
        if (index !== sourceIndex) {
          day.isOpen = source.isOpen
          day.openTime = source.openTime
          day.closeTime = source.closeTime
          validateDay(index)
        }
      })

      $q.notify({
        type: 'positive',
        message: 'Расписание скопировано на все дни'
      })
    }

    const loadBusinessHours = async () => {
      try {
        loading.value = true
        const response = await api.get('/admin/business-hours')

        // Map response to days array
        response.data.forEach(hour => {
          const day = days.value[hour.day_of_week]
          day.isOpen = !hour.is_closed
          if (hour.open_time) {
            day.openTime = hour.open_time.substring(0, 5) // HH:MM
          }
          if (hour.close_time) {
            day.closeTime = hour.close_time.substring(0, 5) // HH:MM
          }
          validateDay(hour.day_of_week)
        })
      } catch (error) {
        console.error('Failed to load business hours:', error)
        $q.notify({
          type: 'negative',
          message: 'Не удалось загрузить часы работы'
        })
      } finally {
        loading.value = false
      }
    }

    const saveBusinessHours = async () => {
      // Validate all days
      days.value.forEach((_, index) => validateDay(index))

      if (hasErrors.value) {
        $q.notify({
          type: 'negative',
          message: 'Исправьте ошибки перед сохранением'
        })
        return
      }

      try {
        saving.value = true

        const hoursData = days.value.map((day, index) => ({
          day_of_week: index,
          is_closed: !day.isOpen,
          open_time: day.isOpen ? day.openTime + ':00' : null,
          close_time: day.isOpen ? day.closeTime + ':00' : null
        }))

        await api.put('/admin/business-hours', {
          hours: hoursData
        })

        $q.notify({
          type: 'positive',
          message: 'Часы работы успешно сохранены',
          icon: 'check_circle'
        })
      } catch (error) {
        console.error('Failed to save business hours:', error)
        $q.notify({
          type: 'negative',
          message: error.response?.data?.detail || 'Не удалось сохранить часы работы'
        })
      } finally {
        saving.value = false
      }
    }

    onMounted(() => {
      loadBusinessHours()
    })

    return {
      loading,
      saving,
      days,
      hasErrors,
      validateDay,
      copyToAll,
      loadBusinessHours,
      saveBusinessHours
    }
  }
})
</script>
