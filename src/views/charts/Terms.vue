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
          <div v-if="loading" class="text-center my-4">
            <CSpinner color="primary" class="me-2" /> Loading terms...
          </div>

          <CTable v-else hover responsive bordered>
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
                <CTableDataCell>{{ term.academic_year.name || '—' }}</CTableDataCell>
                <CTableDataCell class="text-end">
                  <CButtonGroup size="sm">
                    <CButton color="secondary" variant="outline" @click="openEditModal(term)">Edit</CButton>
                    <CButton color="danger" variant="outline" @click="deleteTerm(term)">Delete</CButton>
                  </CButtonGroup>
                </CTableDataCell>
              </CTableRow>
              <CTableRow v-if="!loading && filteredTerms.length === 0">
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

  <!-- Delete Confirmation Modal -->
  <CModal :visible="showDeleteModal" @close="cancelDelete" size="md">
    <CModalHeader class="bg-danger text-white">
      <CModalTitle>Confirm Deletion</CModalTitle>
    </CModalHeader>
    <CModalBody>
      Are you sure you want to delete <strong>{{ termToDelete?.name }}</strong> for <strong>{{ termToDelete?.academicYear?.name }}</strong>?
    </CModalBody>
    <CModalFooter>
      <CButton color="secondary" variant="outline" @click="cancelDelete">Cancel</CButton>
      <CButton color="danger" @click="confirmDelete">Delete</CButton>
    </CModalFooter>
  </CModal>

  <!-- Add/Edit Modal -->
  <CModal :visible="showFormModal" @close="closeFormModal">
    <CModalHeader>
      <CModalTitle>{{ isEdit ? 'Edit Term' : 'Add Term' }}</CModalTitle>
    </CModalHeader>
    <CModalBody>
      <CFormLabel>Term Name</CFormLabel>
<CFormSelect v-model="form.name">
  <option disabled value="" selected>Select Term</option>
  <option v-for="term in termOptions" :key="term.value" :value="term.value">
    {{ term.label }}
  </option>
</CFormSelect>

<CFormLabel class="mt-3">Academic Year</CFormLabel>
<CFormSelect v-model="form.academicYearId">
  <option disabled value="" selected>Select Academic Year</option>
  <option v-if="academicYearsLoading" disabled>Loading...</option>
  <option v-else v-for="year in academicYears" :key="year.id" :value="year.id">
    {{ year.name }}
  </option>
</CFormSelect>


      <div class="text-end mt-4">
        <CButton color="primary" :disabled="loading" @click="submitForm">
          <CSpinner v-if="loading" size="sm" class="me-2" />
          {{ isEdit ? 'Update' : 'Create' }}
        </CButton>
      </div>
    </CModalBody>
  </CModal>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import {
  get_terms,
  create_term,
  update_term,
  delete_term,
  get_academic_years
} from '../../services/api'

const toast = useToast()
const loading = ref(false)
const academicYearsLoading = ref(false)

const termOptions = [
  { label: '1st Term', value: 'FIRST_TERM' },
  { label: '2nd Term', value: 'SECOND_TERM' },
  { label: '3rd Term', value: 'THIRD_TERM' }
]

const academicYears = ref([])
const terms = ref([])
const searchTerm = ref('')
const showFormModal = ref(false)
const showDeleteModal = ref(false)
const isEdit = ref(false)
const currentTerm = ref(null)
const termToDelete = ref(null)

const form = ref({ name: '', academicYearId: '' })

const filteredTerms = computed(() => {
  const term = searchTerm.value.trim().toLowerCase()
  return term
    ? terms.value.filter(t =>
        t.name.toLowerCase().includes(term) ||
        t.academicYear?.name?.toLowerCase().includes(term)
      )
    : terms.value
})

const fetchTerms = async () => {
  loading.value = true
  try {
    const response = await get_terms()
    terms.value = response.data
  } catch (err) {
    let message = 'Failed to fetch terms.'

    // Try to extract backend message
    const backendMsg = err.response?.data?.message || err.response?.data?.error
    if (backendMsg) {
      message = `Failed to fetch terms: ${backendMsg}`
    }

    // Detect common cases
    if (!err.response) {
      message = 'Cannot connect to server. Please check your internet.'
    } else if (err.response.status === 500) {
      message = 'Server error while loading terms.'
    }

    toast.error(message, { position: 'top-right' })
  } finally {
    loading.value = false
  }
}


const fetchAcademicYears = async () => {
  academicYearsLoading.value = true
  try {
    const response = await get_academic_years()
    academicYears.value = response.data
  } catch (err) {
    
  } finally {
    academicYearsLoading.value = false
  }
}

onMounted(() => {
  fetchTerms()
  fetchAcademicYears()
})

const openAddModal = () => {
  isEdit.value = false
  currentTerm.value = null
  form.value = { name: '', academicYearId: '' }
  
  showFormModal.value = true
}

const openEditModal = (term) => {
  isEdit.value = true
  currentTerm.value = term
  form.value = {
    name: term.name,
    academicYearId: term.academicYear?.id || ''
  }
  showFormModal.value = true
}

const closeFormModal = () => {
  showFormModal.value = false
  currentTerm.value = null
}

const submitForm = async () => {
 
  if (!form.value.name || !form.value.academicYearId) {
    toast.error('Please fill in all fields.', { position: 'top-right' })
    return
  }

  loading.value = true
  try {
    const payload = {
      name: form.value.name,
      academicYearId: form.value.academicYearId
    }

    if (isEdit.value && currentTerm.value) {
      const payload = {
  name: form.value.name,
  academicYear: { id: form.value.academicYearId }
}

      const t = await update_term(currentTerm.value.id, payload)


      toast.success('Term updated successfully')
    } else {
      await create_term(payload)
      toast.success('Term created successfully')
    }

    await fetchTerms()
    closeFormModal()
  } catch (err) {

    toast.error(err.response?.data?.message || 'Failed to save term.', { position: 'top-right' })
  } finally {
    loading.value = false
  }
}

const deleteTerm = (term) => {
  termToDelete.value = term
  showDeleteModal.value = true
}

const confirmDelete = async () => {
  if (!termToDelete.value) return
  loading.value = true
  showDeleteModal.value = false

  try {
    await delete_term(termToDelete.value.id)
    terms.value = terms.value.filter(t => t.id !== termToDelete.value.id)
    toast.success(`${termToDelete.value.name} deleted successfully!`, { position: 'top-right' })
  } catch (error) {

   toast.error('Cannot delete this term because it is linked to other records.', { position: 'top-right' })

  } finally {
    loading.value = false
    termToDelete.value = null
  }
}

const cancelDelete = () => {
  showDeleteModal.value = false
  termToDelete.value = null
}
</script>

<style scoped>
@media (max-width: 576px) {
  .gap-2 {
    row-gap: 0.5rem;
  }
}
</style>