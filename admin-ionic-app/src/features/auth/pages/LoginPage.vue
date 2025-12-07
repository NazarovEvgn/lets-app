<template>
  <ion-page>
    <ion-content :fullscreen="true" class="ion-padding">
      <div class="login-container">
        <!-- Лого и заголовок -->
        <div class="login-header">
          <div class="logo">👍</div>
          <h1 class="ion-text-center">Lets Admin</h1>
          <p class="ion-text-center subtitle">Панель управления</p>
        </div>

        <!-- Форма входа -->
        <ion-card class="login-card">
          <ion-card-content>
            <form @submit.prevent="handleLogin">
              <!-- Email -->
              <ion-item lines="full" class="ion-margin-bottom">
                <ion-label position="floating">Email</ion-label>
                <ion-input
                  v-model="email"
                  type="email"
                  placeholder="example@mail.ru"
                  required
                  autocomplete="email"
                />
              </ion-item>

              <!-- Пароль -->
              <ion-item lines="full" class="ion-margin-bottom">
                <ion-label position="floating">Пароль</ion-label>
                <ion-input
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="Введите пароль"
                  required
                  autocomplete="current-password"
                />
                <ion-button
                  slot="end"
                  fill="clear"
                  @click="showPassword = !showPassword"
                >
                  <ion-icon :icon="showPassword ? eyeOffOutline : eyeOutline" />
                </ion-button>
              </ion-item>

              <!-- Ошибка -->
              <ion-text v-if="errorMessage" color="danger" class="error-message">
                <p>{{ errorMessage }}</p>
              </ion-text>

              <!-- Кнопка входа -->
              <ion-button
                expand="block"
                type="submit"
                :disabled="loading"
                class="login-button"
              >
                <ion-spinner v-if="loading" name="crescent" />
                <span v-else>Войти</span>
              </ion-button>
            </form>
          </ion-card-content>
        </ion-card>

        <!-- Ссылка на регистрацию (для будущего) -->
        <!--
        <div class="ion-text-center ion-margin-top">
          <ion-text color="medium">
            <p>
              Нет аккаунта?
              <a href="/register" class="register-link">Зарегистрироваться</a>
            </p>
          </ion-text>
        </div>
        -->
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  IonPage,
  IonContent,
  IonCard,
  IonCardContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonText,
  IonIcon,
  IonSpinner,
} from '@ionic/vue'
import { eyeOutline, eyeOffOutline } from 'ionicons/icons'
import { useAuthStore } from '../stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

// Form data
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)
const errorMessage = ref('')

async function handleLogin() {
  // Очищаем предыдущие ошибки
  errorMessage.value = ''

  // Валидация
  if (!email.value || !password.value) {
    errorMessage.value = 'Пожалуйста, заполните все поля'
    return
  }

  loading.value = true

  try {
    const result = await authStore.login({
      email: email.value,
      password: password.value,
    })

    if (result.success) {
      // Успешный вход - редирект на dashboard
      await router.push('/dashboard')
    } else {
      // Ошибка входа
      errorMessage.value = result.error || 'Ошибка входа'
    }
  } catch (error) {
    console.error('[LoginPage] Unexpected error:', error)
    errorMessage.value = 'Произошла непредвиденная ошибка'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100%;
  padding: 20px;
}

.login-header {
  margin-bottom: 2rem;
  text-align: center;
}

.logo {
  font-size: 4rem;
  margin-bottom: 1rem;
}

h1 {
  color: var(--ion-color-primary);
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: var(--ion-color-medium);
  font-size: 1rem;
}

.login-card {
  width: 100%;
  max-width: 400px;
  margin: 0;
}

.error-message {
  display: block;
  margin-bottom: 1rem;
  padding: 0.5rem;
  border-radius: 4px;
  background-color: var(--ion-color-danger-tint);
}

.error-message p {
  margin: 0;
  font-size: 0.9rem;
}

.login-button {
  margin-top: 1rem;
  --background: var(--ion-color-primary);
  font-weight: 600;
}

.register-link {
  color: var(--ion-color-primary);
  text-decoration: none;
  font-weight: 600;
}

.register-link:hover {
  text-decoration: underline;
}
</style>
