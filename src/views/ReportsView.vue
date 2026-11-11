<script setup>
import { reactive, ref } from 'vue'

import * as reportsApi from '@/api/reports'
import FormField from '@/components/FormField.vue'

const title = ref('')
const description = ref('')
/** @type {import('vue').Ref<File|null>} */
const image = ref(null)
const fileInput = ref(null)

const errors = reactive({ title: '', description: '', image: '' })
const error = ref('')
const loading = ref(false)
const sent = ref(false)

function resetErrors() {
  errors.title = ''
  errors.description = ''
  errors.image = ''
  error.value = ''
}

function onFileChange(event) {
  errors.image = ''
  const file = event.target.files?.[0] ?? null

  if (file && !reportsApi.REPORT_IMAGE_TYPES.includes(file.type)) {
    errors.image = 'Dozwolone formaty: JPEG, PNG, WebP, GIF.'
    clearFile()
    return
  }
  if (file && file.size > reportsApi.MAX_REPORT_IMAGE_BYTES) {
    errors.image = 'Zdjęcie może mieć maksymalnie 5 MB.'
    clearFile()
    return
  }
  image.value = file
}

function clearFile() {
  image.value = null
  if (fileInput.value) fileInput.value.value = ''
}

async function submit() {
  resetErrors()
  sent.value = false
  loading.value = true
  try {
    await reportsApi.createReport({
      title: title.value.trim(),
      description: description.value.trim(),
      image: image.value,
    })
    title.value = ''
    description.value = ''
    clearFile()
    sent.value = true
  } catch (e) {
    const fields = e.fieldErrors ?? {}
    errors.title = fields.title ?? ''
    errors.description = fields.description ?? ''
    errors.image = fields.image ?? ''
    if (!errors.title && !errors.description && !errors.image) error.value = e.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section class="reports container">
    <h1>Zgłoszenia</h1>
    <p class="muted">
      Znalazłeś błąd w aplikacji albo masz uwagę? Opisz problem, a jeśli możesz, dołącz zrzut ekranu.
    </p>

    <form class="panel stack" @submit.prevent="submit">
      <p v-if="error" class="alert" role="alert">{{ error }}</p>
      <p v-if="sent" class="success" role="status">Dziękujemy! Zgłoszenie zostało wysłane.</p>

      <FormField
        id="report-title"
        v-model="title"
        label="Tytuł"
        maxlength="200"
        :error="errors.title"
        required
      />

      <div class="field">
        <label for="report-description">Opis</label>
        <textarea
          id="report-description"
          v-model="description"
          rows="7"
          maxlength="5000"
          :aria-invalid="errors.description ? 'true' : undefined"
          required
        />
        <p v-if="errors.description" class="field-error">{{ errors.description }}</p>
      </div>

      <div class="field">
        <label for="report-image">Zdjęcie (opcjonalnie, do 5 MB)</label>
        <input
          id="report-image"
          ref="fileInput"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          :aria-invalid="errors.image ? 'true' : undefined"
          @change="onFileChange"
        />
        <p v-if="errors.image" class="field-error">{{ errors.image }}</p>
      </div>

      <button class="btn" type="submit" :disabled="loading">
        {{ loading ? 'Wysyłanie…' : 'Wyślij zgłoszenie' }}
      </button>
    </form>
  </section>
</template>

<style scoped>
.reports {
  max-width: 36rem;
  margin-block: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.reports h1,
.reports > p {
  margin: 0;
}

textarea {
  resize: vertical;
}

.success {
  margin: 0;
  padding: 0.6rem 0.75rem;
  font-size: 0.875rem;
  color: #15803d;
  border: 1px solid currentColor;
  border-radius: var(--radius);
}
</style>
