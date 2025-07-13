import { ref, computed } from "vue"
import { defineStore } from 'pinia'

export const useAppConfig = defineStore('useAppConfig', () => {
    const language = ref('en')
    const i18n = ref({})

    function reviseI18N(i18nVal) {
        i18n.value = i18nVal;
    }

    function reviseLanguage(lan) {
        language.value = lan;
    }

    const local = text => computed(() => {
        let result = i18n.value[text];
        if (!result)
            return text;
        return result[language.value];
    }).value

    return {
        language,
        reviseI18N,
        reviseLanguage,
        local
    }
})