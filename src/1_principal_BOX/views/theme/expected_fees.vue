<template>
<CRow>
  <CCol :xs="12">
    <CCard class="mb-4">
      <CCardHeader class="d-flex flex-column flex-sm-row align-items-sm-center justify-content-sm-between gap-2">
        <div>
          <h5 class="mb-0">Fee Overview </h5>
          <small class="text-body-secondary">Projected Collections</small>
        </div>

        <div class="d-flex flex-column flex-sm-row align-items-sm-center gap-2">
          <!-- Search Input -->
          <CFormInput
            v-model="searchTerm"
            placeholder="Search by class..."
            size="sm"
            style="width: 250px;"
          />
        </div>
      </CCardHeader>

      <CCardBody>
        <CAlert color="danger" v-if="errorMessage" class="py-2">
          {{ errorMessage }}
        </CAlert>

        <div class="d-flex align-items-center gap-2 mb-2" v-if="isLoading">
          <CSpinner size="sm" />
          <span class="text-body-secondary small">Loading fee records…</span>
        </div>

        <DocsExample>
          <CTable hover responsive>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell scope="col" style="width: 60px;">#</CTableHeaderCell>
                <CTableHeaderCell scope="col">Class</CTableHeaderCell>
                <CTableHeaderCell scope="col">Term</CTableHeaderCell>
                <CTableHeaderCell scope="col">Academic Year</CTableHeaderCell>
                <CTableHeaderCell scope="col">Expected Amount</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              <CTableRow v-for="(row, idx) in filteredRecords" :key="row.id">
                <CTableHeaderCell scope="row">{{ idx + 1 }}</CTableHeaderCell>
                <CTableDataCell>{{ row.grade_class_name }}</CTableDataCell>
                <CTableDataCell>{{ row.term_name }}</CTableDataCell>
                <CTableDataCell>{{ row.academic_year_name }}</CTableDataCell>
                <CTableDataCell>{{ row.expected_amount }}</CTableDataCell>
              </CTableRow>
            </CTableBody>
          </CTable>
        </DocsExample>
      </CCardBody>
    </CCard>
  </CCol>
</CRow>


</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { get_expected_fees_insight } from '../../../services/api'

const isLoading = ref(false)
const errorMessage = ref('')
const records = ref([])

// single search term
const searchTerm = ref('')

const filteredRecords = computed(() => {
  const q = searchTerm.value.trim().toLowerCase()
  if (!q) return records.value

  return records.value.filter(row => {
    return String(row?.grade_class_name || '').toLowerCase().includes(q)
  })
})

async function loadRecords() {
  isLoading.value = true
  errorMessage.value = ''
  try {
    const rows = await get_expected_fees_insight()
    console.log('Fetched expected fees insight:', rows)
    records.value = rows.data || rows
  } catch (err) {
    errorMessage.value = err?.message || 'Failed to load fee records.'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => loadRecords())
</script>


<style scoped>
/* Ensure header actions wrap well on smaller screens */
@media (max-width: 576px) {
  .gap-2 {
    row-gap: 0.5rem;
  }
}
</style>