<script setup>
import { reactive, ref } from 'vue'

import * as eventsApi from '@/api/events'
import FormField from '@/components/FormField.vue'
import { TANK_TYPE_OPTIONS, TIER_OPTIONS } from '@/utils/format'

const emit = defineEmits(['created'])

const FIELDS = ['title', 'description', 'start_date', 'end_date', 'tank_type', 'tank_tier']

const dialog = ref(null)
const saving = ref(false)
const error = ref('')

const form = reactive({
  title: '',
  description: '',
  start: '',
  end: '',
  tank_type: 'heavyTank',
  tank_tier: 8,
})
const errors = reactive(Object.fromEntries(FIELDS.map((f) => [f, ''])))

const pad = (n) => String(n).padStart(2, '0')

/** Date -> wartość dla <input type="datetime-local"> (czas lokalny). */
function toLocalInput(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function clearErrors() {
  error.value = ''
  for (const field of FIELDS) errors[field] = ''
}

function open() {
  // Domyślnie: start za godzinę (pełna godzina), event na tydzień.
  const start = new Date()
  start.setHours(start.getHours() + 1, 0, 0, 0)
  const end = new Date(start.getTime() + 7 * 24 * 3600 * 1000)

  Object.assign(form, {
    title: '',
    description: '',
    start: toLocalInput(start),
    end: toLocalInput(end),
    tank_type: 'heavyTank',
    tank_tier: 8,
  })
  clearErrors()
  dialog.value.showModal()
}

function close() {
  dialog.value.close()
}

// Kliknięcie w tło (poza formularzem) zamyka okno.
function onBackdropClick(event) {
  if (event.target === dialog.value) close()
}

async function submit() {
  clearErrors()

  const start = new Date(form.start)
  const end = new Date(form.end)
  if (end <= start) {
    errors.end_date = 'Data końca musi być późniejsza niż data startu.'
    return
  }

  saving.value = true
  try {
    const created = await eventsApi.createEvent({
      title: form.title.trim(),
      description: form.description.trim(),
      start_date: start.toISOString(),
      end_date: end.toISOString(),
      tank_type: form.tank_type,
      tank_tier: Number(form.tank_tier),
    })
    emit('created', created)
    close()
  } catch (e) {
    const fields = e.fieldErrors ?? {}
    let mapped = false
    for (const field of FIELDS) {
      if (fields[field]) {
        errors[field] = fields[field]
        mapped = true
      }
    }
    // Błędy ogólne (np. "Istnieje już trwający event") bez przypisania do pola.
    if (!mapped) error.value = e.message
  } finally {
    saving.value = false
  }
}

defineExpose({ open })
</script>

<template>
  <dialog ref="dialog" class="dialog" aria-labelledby="create-event-title" @click="onBackdropClick">
    <form class="stack" @submit.prevent="submit">
      <h2 id="create-event-title">Dodaj wydarzenie</h2>

      <p v-if="error" class="alert" role="alert">{{ error }}</p>

      <FormField
        id="event-title"
        v-model="form.title"
        label="Tytuł"
        maxlength="256"
        :error="errors.title"
        required
      />

      <div class="field">
        <label for="event-description">Opis</label>
        <textarea
          id="event-description"
          v-model="form.description"
          rows="4"
          :aria-invalid="errors.description ? 'true' : undefined"
          required
        />
        <p v-if="errors.description" class="field-error">{{ errors.description }}</p>
      </div>

      <div class="two">
        <FormField
          id="event-start"
          v-model="form.start"
          label="Start"
          type="datetime-local"
          :error="errors.start_date"
          required
        />
        <FormField
          id="event-end"
          v-model="form.end"
          label="Koniec"
          type="datetime-local"
          :error="errors.end_date"
          required
        />
      </div>

      <div class="two">
        <div class="field">
          <label for="event-type">Typ czołgu</label>
          <select id="event-type" v-model="form.tank_type">
            <option v-for="o in TANK_TYPE_OPTIONS" :key="o.value" :value="o.value">
              {{ o.label }}
            </option>
          </select>
          <p v-if="errors.tank_type" class="field-error">{{ errors.tank_type }}</p>
        </div>

        <div class="field">
          <label for="event-tier">Tier</label>
          <select id="event-tier" v-model="form.tank_tier">
            <option v-for="o in TIER_OPTIONS" :key="o.value" :value="o.value">
              {{ o.label }}
            </option>
          </select>
          <p v-if="errors.tank_tier" class="field-error">{{ errors.tank_tier }}</p>
        </div>
      </div>

      <p class="muted">Typu czołgu i tieru nie da się zmienić po dołączeniu pierwszych graczy.</p>

      <div class="actions">
        <button class="btn btn-secondary" type="button" @click="close">Anuluj</button>
        <button class="btn" type="submit" :disabled="saving">
          {{ saving ? 'Zapisywanie…' : 'Dodaj wydarzenie' }}
        </button>
      </div>
    </form>
  </dialog>
</template>

<style scoped>
.dialog {
  width: min(32rem, calc(100vw - 2rem));
  max-height: calc(100vh - 2rem);
  padding: 1.5rem;
  overflow-y: auto;
  color: var(--text);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
}

.dialog::backdrop {
  background: rgb(0 0 0 / 55%);
}

h2 {
  margin: 0;
  font-size: 1.25rem;
}

.two {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

@media (max-width: 30rem) {
  .two {
    grid-template-columns: 1fr;
  }
}
</style>
