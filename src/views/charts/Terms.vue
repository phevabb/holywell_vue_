<template>
  <CRow>
    <CCol :xs="12">
      <CCard class="mb-4">
        <CCardHeader class="bg-info text-white">
          <div class="d-flex justify-content-between align-items-center gap-2 flex-wrap">
            <strong class="fs-5">Academic Terms</strong>
            <div class="d-flex align-items-center gap-2 flex-wrap">
              <CFormInput
                v-model="searchTerm"
                placeholder="Search term..."
                size="sm"
                style="min-width: 260px;"
              />
              <CButton color="light" class="text-info border-white" size="sm" @click="openAddModal">
                <CIcon icon="cil-calendar" class="me-1" /> Add Term
              </CButton>
            </div>
          </div>
        </CCardHeader>

        <CCardBody>
          <CTable hover responsive bordered>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>#</CTableHeaderCell>
                <CTableHeaderCell>Term Name</CTableHeaderCell>
                <CTableHeaderCell>Academic Year</CTableHeaderCell>
                <CTableHeaderCell class="text-end">Actions</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              <CTableRow v-for="(term, idx) in filteredTerms" :key="term.id">
                <CTableHeaderCell>{{ idx + 1 }}</CTableHeaderCell>
                <CTableDataCell>{{ term.name }}</CTableDataCell>
                <CTableDataCell>{{ term.academicYear }}</CTableDataCell>
                <CTableDataCell class="text-end">
                  <CButtonGroup size="sm">
                    <CButton color="secondary" variant="outline" @click="openEditModal(term)">Edit</CButton>
                    <CButton color="danger" variant="outline" @click="deleteTerm(term)">Delete</CButton>
                  </CButtonGroup>
                </CTableDataCell>
              </CTableRow>
              <CTableRow v-if="filteredTerms.length === 0">
                <CTableDataCell colspan="4" class="text-center text-body-secondary">
                  No terms found<span v-if="searchTerm"> for “{{ searchTerm }}”.</span>
                </CTableDataCell>
              </CTableRow>
            </CTableBody>
          </CTable>
        </CCardBody>
      </CCard>
    </CCol>
  </CRow>

  <!-- Modal -->
  <CModal :visible="showFormModal" @close="closeFormModal">
    <CModalHeader>
      <CModalTitle>{{ isEdit ? 'Edit Term' : 'Add Term' }}</CModalTitle>
    </CModalHeader>
    <CModalBody>
      <CFormLabel>Term Name</CFormLabel>
      <CFormSelect v-model="form.name">
        <option disabled value="">Select Term</option>
        <option v-for="term in termOptions" :key="term" :value="term">{{ term }}</option>
      </CFormSelect>

      <CFormLabel class="mt-3">Academic Year</CFormLabel>
      <CFormSelect v-model="form.academicYear">
        <option disabled value="">Select Academic Year</option>
        <option v-for="year in academicYears" :key="year" :value="year">{{ year }}</option>
      </CFormSelect>

      <div class="text-end mt-4">
        <CButton color="primary" @click="submitForm">
          {{ isEdit ? 'Update' : 'Create' }}
        </CButton>
      </div>
    </CModalBody>
  </CModal>
</template>

<script setup>
import { ref, computed } from 'vue'

const termOptions = ['1st Term', '2nd Term', '3rd Term']
const academicYears = ['2022/2023', '2023/2024', '2024/2025']

const terms = ref([
  { id: 1, name: '1st Term', academicYear: '2023/2024' },
  { id: 2, name: '2nd Term', academicYear: '2023/2024' },
])

const searchTerm = ref('')
const showFormModal = ref(false)
const isEdit = ref(false)
const currentTerm = ref(null)

const form = ref({ name: '', academicYear: '' })

const filteredTerms = computed(() => {
  const term = searchTerm.value.trim().toLowerCase()
  return term
    ? terms.value.filter(t =>
        t.name.toLowerCase().includes(term) ||
        t.academicYear.toLowerCase().includes(term)
      )
    : terms.value
})

const openAddModal = () => {
  isEdit.value = false
  currentTerm.value = null
  form.value = { name: '', academicYear: '' }
  showFormModal.value = true
}

const openEditModal = (term) => {
  isEdit.value = true
  currentTerm.value = term
  form.value = {
    name: term.name,
    academicYear: term.academicYear
  }
  showFormModal.value = true
}

const closeFormModal = () => {
  showFormModal.value = false
  currentTerm.value = null
}

const submitForm = () => {
  if (!form.value.name || !form.value.academicYear) return

  if (isEdit.value && currentTerm.value) {
    const index = terms.value.findIndex(t => t.id === currentTerm.value.id)
    if (index !== -1) {
      terms.value[index] = {
        ...form.value,
        id: currentTerm.value.id
      }
    }
  } else {
    terms.value.push({
      ...form.value,
      id: Date.now()
    })
  }

  closeFormModal()
}

const deleteTerm = (term) => {
  if (confirm(`Delete term "${term.name}" for ${term.academicYear}?`)) {
    terms.value = terms.value.filter(t => t.id !== term.id)
  }
}
</script>

<style scoped>
@media (max-width: 576px) {
  .gap-2 {
    row-gap: 0.5rem;
  }
}
</style>