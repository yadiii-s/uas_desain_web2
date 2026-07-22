<script setup>
import { ref } from 'vue'
import { ChevronDown } from 'lucide-vue-next'

const props = defineProps({
  kategoriList: { type: Array, default: () => [] },
  modelValue: { type: String, default: 'Semua' },
})
const emit = defineEmits(['update:modelValue'])

const terbuka = ref(false)

function pilih(kategori) {
  emit('update:modelValue', kategori)
  terbuka.value = false
}
</script>

<template>
  <aside class="w-full lg:w-60 lg:shrink-0">
    <button
      type="button"
      class="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 lg:hidden"
      @click="terbuka = !terbuka"
    >
      <span>Kategori: {{ props.modelValue }}</span>
      <ChevronDown class="h-4 w-4 transition-transform" :class="terbuka ? 'rotate-180' : ''" />
    </button>

    <div
      class="mt-2 rounded-xl border border-gray-200 bg-white p-4 lg:mt-0 lg:block"
      :class="terbuka ? 'block' : 'hidden'"
    >
      <h2 class="hidden text-sm font-semibold uppercase tracking-wide text-gray-400 lg:block">
        Kategori
      </h2>
      <ul class="space-y-1 lg:mt-3">
        <li v-for="kategori in props.kategoriList" :key="kategori">
          <button
            type="button"
            class="w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition"
            :class="
              props.modelValue === kategori
                ? 'bg-primary-600 text-white'
                : 'text-gray-600 hover:bg-primary-50 hover:text-primary-700'
            "
            @click="pilih(kategori)"
          >
            {{ kategori }}
          </button>
        </li>
      </ul>
    </div>
  </aside>
</template>
