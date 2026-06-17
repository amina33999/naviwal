import { ref, watch } from 'vue'

export const darkTheme = ref(localStorage.getItem('theme') === 'dark')

watch(darkTheme, (value) => {
  localStorage.setItem('theme', value ? 'dark' : 'light')
})

export function toggleTheme() {
  darkTheme.value = !darkTheme.value
}