<template>
  <q-page padding>
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h4">Услуги</div>
      <q-btn color="primary" icon="add" label="Добавить услугу" @click="openCreateDialog" />
    </div>

    <q-card>
      <q-card-section>
        <q-table
          :rows="services"
          :columns="columns"
          row-key="id"
          :loading="loading"
          flat
          bordered
          :grid="$q.screen.lt.md"
        >
          <template v-slot:body-cell-is_active="props">
            <q-td :props="props">
              <q-toggle
                :model-value="props.row.is_active"
                @update:model-value="toggleServiceActive(props.row)"
                color="positive"
              />
            </q-td>
          </template>

          <template v-slot:body-cell-price="props">
            <q-td :props="props">
              {{ formatPrice(props.row.price) }}
            </q-td>
          </template>

          <template v-slot:body-cell-duration_minutes="props">
            <q-td :props="props">
              {{ props.row.duration_minutes }} мин
            </q-td>
          </template>

          <template v-slot:body-cell-actions="props">
            <q-td :props="props">
              <q-btn
                flat
                dense
                round
                icon="edit"
                color="primary"
                @click="openEditDialog(props.row)"
              >
                <q-tooltip>Редактировать</q-tooltip>
              </q-btn>
              <q-btn
                flat
                dense
                round
                icon="delete"
                color="negative"
                @click="confirmDelete(props.row)"
              >
                <q-tooltip>Удалить</q-tooltip>
              </q-btn>
            </q-td>
          </template>

          <!-- Grid mode для мобильных устройств -->
          <template v-slot:item="props">
            <div class="q-pa-xs col-xs-12 col-sm-6 col-md-4">
              <q-card>
                <q-card-section>
                  <div class="row items-center q-mb-sm">
                    <div class="col">
                      <div class="text-subtitle1 text-weight-medium">
                        {{ props.row.name }}
                      </div>
                      <div class="text-caption text-grey-7" v-if="props.row.description">
                        {{ props.row.description }}
                      </div>
                    </div>
                    <div class="col-auto">
                      <q-toggle
                        :model-value="props.row.is_active"
                        @update:model-value="toggleServiceActive(props.row)"
                        color="positive"
                      />
                    </div>
                  </div>

                  <q-separator class="q-my-sm" />

                  <div class="text-body2">
                    <div class="row q-mb-xs">
                      <div class="col-5 text-grey-7">Цена:</div>
                      <div class="col-7 text-weight-medium">{{ formatPrice(props.row.price) }}</div>
                    </div>
                    <div class="row q-mb-xs">
                      <div class="col-5 text-grey-7">Длительность:</div>
                      <div class="col-7">{{ props.row.duration_minutes }} мин</div>
                    </div>
                    <div class="row q-mb-xs">
                      <div class="col-5 text-grey-7">Статус:</div>
                      <div class="col-7">
                        <q-badge :color="props.row.is_active ? 'positive' : 'grey'">
                          {{ props.row.is_active ? 'Активна' : 'Неактивна' }}
                        </q-badge>
                      </div>
                    </div>
                  </div>
                </q-card-section>

                <q-separator />

                <q-card-actions align="right">
                  <q-btn
                    flat
                    dense
                    icon="edit"
                    color="primary"
                    label="Изменить"
                    @click="openEditDialog(props.row)"
                  />
                  <q-btn
                    flat
                    dense
                    icon="delete"
                    color="negative"
                    label="Удалить"
                    @click="confirmDelete(props.row)"
                  />
                </q-card-actions>
              </q-card>
            </div>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- Диалог создания/редактирования услуги -->
    <q-dialog v-model="dialog" persistent>
      <q-card style="min-width: 500px">
        <q-card-section>
          <div class="text-h6">{{ editMode ? 'Редактировать услугу' : 'Новая услуга' }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input
            v-model="form.name"
            label="Название услуги *"
            outlined
            :rules="[val => !!val || 'Обязательное поле']"
            class="q-mb-md"
          />

          <q-input
            v-model="form.description"
            label="Описание"
            outlined
            type="textarea"
            rows="3"
            class="q-mb-md"
          />

          <div class="row q-col-gutter-md q-mb-md">
            <div class="col-6">
              <q-input
                v-model.number="form.price"
                label="Цена (₽) *"
                outlined
                type="number"
                min="0"
                step="10"
                :rules="[val => val >= 0 || 'Цена должна быть положительной']"
              />
            </div>
            <div class="col-6">
              <q-input
                v-model.number="form.duration_minutes"
                label="Длительность (мин) *"
                outlined
                type="number"
                min="5"
                step="5"
                :rules="[val => val > 0 || 'Длительность должна быть больше 0']"
              />
            </div>
          </div>

          <q-toggle
            v-model="form.is_active"
            label="Услуга активна"
            color="positive"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Отмена" color="grey" v-close-popup @click="closeDialog" />
          <q-btn
            label="Сохранить"
            color="primary"
            @click="saveService"
            :loading="saving"
            :disable="!isFormValid"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { defineComponent, ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { api } from '../boot/axios'

export default defineComponent({
  name: 'ServicesPage',

  setup() {
    const $q = useQuasar()
    const services = ref([])
    const loading = ref(false)
    const dialog = ref(false)
    const editMode = ref(false)
    const saving = ref(false)
    const currentServiceId = ref(null)

    const form = ref({
      name: '',
      description: '',
      price: 0,
      duration_minutes: 30,
      is_active: true
    })

    const columns = [
      {
        name: 'name',
        label: 'Название',
        align: 'left',
        field: 'name',
        sortable: true
      },
      {
        name: 'description',
        label: 'Описание',
        align: 'left',
        field: 'description',
        sortable: false
      },
      {
        name: 'price',
        label: 'Цена',
        align: 'right',
        field: 'price',
        sortable: true
      },
      {
        name: 'duration_minutes',
        label: 'Длительность',
        align: 'center',
        field: 'duration_minutes',
        sortable: true
      },
      {
        name: 'is_active',
        label: 'Активна',
        align: 'center',
        field: 'is_active',
        sortable: true
      },
      {
        name: 'actions',
        label: 'Действия',
        align: 'center'
      }
    ]

    const isFormValid = computed(() => {
      return form.value.name && form.value.price >= 0 && form.value.duration_minutes > 0
    })

    const formatPrice = (price) => {
      return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 0
      }).format(price)
    }

    const fetchServices = async () => {
      loading.value = true
      try {
        const response = await api.get('/admin/services')
        services.value = response.data
      } catch (error) {
        $q.notify({
          type: 'negative',
          message: 'Ошибка загрузки услуг',
          caption: error.response?.data?.detail || error.message
        })
      } finally {
        loading.value = false
      }
    }

    const openCreateDialog = () => {
      editMode.value = false
      currentServiceId.value = null
      form.value = {
        name: '',
        description: '',
        price: 0,
        duration_minutes: 30,
        is_active: true
      }
      dialog.value = true
    }

    const openEditDialog = (service) => {
      editMode.value = true
      currentServiceId.value = service.id
      form.value = {
        name: service.name,
        description: service.description || '',
        price: service.price,
        duration_minutes: service.duration_minutes,
        is_active: service.is_active
      }
      dialog.value = true
    }

    const closeDialog = () => {
      dialog.value = false
      form.value = {
        name: '',
        description: '',
        price: 0,
        duration_minutes: 30,
        is_active: true
      }
    }

    const saveService = async () => {
      if (!isFormValid.value) return

      saving.value = true
      try {
        if (editMode.value) {
          await api.patch(`/admin/services/${currentServiceId.value}`, form.value)
          $q.notify({
            type: 'positive',
            message: 'Услуга успешно обновлена'
          })
        } else {
          await api.post('/admin/services', form.value)
          $q.notify({
            type: 'positive',
            message: 'Услуга успешно создана'
          })
        }
        await fetchServices()
        closeDialog()
      } catch (error) {
        $q.notify({
          type: 'negative',
          message: editMode.value ? 'Ошибка обновления услуги' : 'Ошибка создания услуги',
          caption: error.response?.data?.detail || error.message
        })
      } finally {
        saving.value = false
      }
    }

    const toggleServiceActive = async (service) => {
      try {
        await api.patch(`/admin/services/${service.id}`, {
          is_active: !service.is_active
        })
        service.is_active = !service.is_active
        $q.notify({
          type: 'positive',
          message: service.is_active ? 'Услуга активирована' : 'Услуга деактивирована'
        })
      } catch (error) {
        $q.notify({
          type: 'negative',
          message: 'Ошибка изменения статуса услуги',
          caption: error.response?.data?.detail || error.message
        })
      }
    }

    const confirmDelete = (service) => {
      $q.dialog({
        title: 'Подтверждение удаления',
        message: `Вы уверены, что хотите удалить услугу "${service.name}"?`,
        cancel: {
          label: 'Отмена',
          flat: true,
          color: 'grey'
        },
        ok: {
          label: 'Удалить',
          color: 'negative'
        },
        persistent: true
      }).onOk(async () => {
        await deleteService(service.id)
      })
    }

    const deleteService = async (serviceId) => {
      try {
        await api.delete(`/admin/services/${serviceId}`)
        $q.notify({
          type: 'positive',
          message: 'Услуга успешно удалена'
        })
        await fetchServices()
      } catch (error) {
        $q.notify({
          type: 'negative',
          message: 'Ошибка удаления услуги',
          caption: error.response?.data?.detail || error.message
        })
      }
    }

    onMounted(() => {
      fetchServices()
    })

    return {
      services,
      loading,
      columns,
      dialog,
      editMode,
      saving,
      form,
      isFormValid,
      formatPrice,
      openCreateDialog,
      openEditDialog,
      closeDialog,
      saveService,
      toggleServiceActive,
      confirmDelete
    }
  }
})
</script>
