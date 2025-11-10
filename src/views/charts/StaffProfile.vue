<template>
  <CRow>
    <CCol :xs="12">
      <CCard class="mb-4">
        <CCardHeader>
          <div class="d-flex justify-content-between align-items-center gap-2 flex-wrap">
            <strong>Staff Members</strong>

            <div class="d-flex align-items-center gap-2 flex-wrap">
              <CFormInput
                v-model="searchTerm"
                placeholder="Search by name..."
                aria-label="Search by name"
                size="sm"
                style="min-width: 260px;"
              />

              <CButton
                color="danger"
                size="sm"
                :disabled="selectedIds.length === 0"
                @click="openBulkDeleteConfirm"
              >
                Delete Selected ({{ selectedIds.length }})
              </CButton>

              <CButton color="primary" size="sm" @click="openAddModal">
                Add Staff
              </CButton>
            </div>
          </div>
        </CCardHeader>

        <CCardBody>
          <div v-if="loading" class="text-center my-4">
            <CSpinner color="primary" class="me-2" /> Loading data ...
          </div>

          <CTable v-else hover responsive bordered class="shadow-sm">
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell class="text-center" style="width: 48px;">
                  <CFormCheck
                    :checked="allSelected"
                    :indeterminate="someSelected"
                    @change="toggleSelectAll"
                  />
                </CTableHeaderCell>
                <CTableHeaderCell>#</CTableHeaderCell>
                <CTableHeaderCell>Name</CTableHeaderCell>
                
                <CTableHeaderCell>Gender</CTableHeaderCell>
                <CTableHeaderCell>Nationality</CTableHeaderCell>
                
                <CTableHeaderCell>Status</CTableHeaderCell>
                <CTableHeaderCell class="text-end">Actions</CTableHeaderCell>
              </CTableRow>
            </CTableHead>

            <CTableBody>
              <CTableRow v-for="(row, idx) in filteredStaff" :key="row.id">
                <CTableDataCell class="text-center">
                  <CFormCheck v-model="selectedIds" :value="row.id" />
                </CTableDataCell>
                <CTableHeaderCell>{{ idx + 1 }}</CTableHeaderCell>
                <CTableDataCell>{{ row.fullName }}</CTableDataCell>
                
                <CTableDataCell>{{ row.gender }}</CTableDataCell>
                <CTableDataCell>{{ row.nationality }}</CTableDataCell>
                
                <CTableDataCell>
                  <CBadge :color="row.active ? 'success' : 'secondary'">
                    {{ row.active ? 'Active' : 'Inactive' }}
                  </CBadge>
                </CTableDataCell>
                <CTableDataCell class="text-end">
                  <CButtonGroup size="sm">
                    <CButton color="secondary" variant="outline" @click="openEditModal(row)">Edit</CButton>
                    <CButton color="danger" variant="outline" @click="deleteStaff(row)">Delete</CButton>
                  </CButtonGroup>
                </CTableDataCell>
              </CTableRow>

              <CTableRow v-if="!isLoading && filteredStaff.length === 0">
                <CTableDataCell colspan="9" class="text-center text-body-secondary">
                  No staff found<span v-if="searchTerm"> for “{{ searchTerm }}”.</span>
                </CTableDataCell>
              </CTableRow>
            </CTableBody>
          </CTable>
        </CCardBody>
      </CCard>
    </CCol>
  </CRow>

   <CModal :visible="showDeleteModal" @close="cancelDelete" size="md">
  <CModalHeader class="bg-danger text-white">
    <CModalTitle>Confirm Deletion</CModalTitle>
  </CModalHeader>
  <CModalBody>
    Are you sure you want to delete <strong>{{ staffToDelete?.fullName }}</strong>?
  </CModalBody>
  <CModalFooter>
    <CButton color="secondary" variant="outline" @click="cancelDelete">Cancel</CButton>
    <CButton color="danger" @click="confirmDelete">Delete</CButton>
  </CModalFooter>
</CModal>



  <!-- Modal -->
  <CModal :visible="showFormModal" @close="closeFormModal">
    <CModalHeader>
      <CModalTitle>{{ isEdit ? 'Edit Staff' : 'Add Staff' }}</CModalTitle>
    </CModalHeader>
    <CModalBody>
      <div class="mb-3">
        <CFormLabel>Full Name</CFormLabel>
        <CFormInput v-model="form.fullName" />
      </div>
      <div class="mb-3">
        <CFormLabel>Gender</CFormLabel>
        <CFormSelect v-model="form.gender">
          <option disabled value="">Select Gender</option>
          <option value="MALE">Male</option>
          <option value="FEMALE">Female</option>
        </CFormSelect>
      </div>
      <div class="mb-3">
        <CFormLabel>Nationality</CFormLabel>
        <CFormInput v-model="form.nationality" />
      </div>
      <div class="mb-3">
        <CFormLabel>Date of Birth</CFormLabel>
        <CFormInput v-model="form.dateOfBirth" type="date" />
      </div>
      
      <CButton color="primary" @click="submitForm">
        {{ isEdit ? 'Update' : 'Create' }}
      </CButton>
    </CModalBody>
  </CModal>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  get_staff,
  create_staff,
  update_staff,
  delete_staff,
} from '@/services/api'

const loading = ref(false)
const errorMessage = ref('')  
const staff = ref([])

import { useToast } from 'vue-toastification'
import { useRouter } from 'vue-router'

import {
  CFormCheck, CFormInput, CButton, CButtonGroup, CModal, CModalHeader, CModalTitle, CModalBody,
  CAlert, CSpinner, CFormLabel, CFormSelect, CBadge, CRow, CCol, CCard, CCardHeader, CCardBody,
  CTable, CTableHead, CTableBody, CTableRow, CTableHeaderCell, CTableDataCell
} from '@coreui/vue'


const router = useRouter()
const showDeleteModal = ref(false)
const staffToDelete = ref(null)
const toast = useToast()


const confirmDelete = async () => {
  if (!staffToDelete.value) return
  loading.value = true
  showDeleteModal.value = false

  try {
    await delete_staff(staffToDelete.value.id)
    staff.value = staff.value.filter(s => s.id !== staffToDelete.value.id)
    toast.success(`${staffToDelete.value.fullName} deleted successfully!`, { position: 'top-right' })
  } catch (error) {
    console.error('Error deleting staff:', error.response?.data || error)
    toast.error('Failed to delete staff. Please try again.', { position: 'top-right' })
  } finally {
    loading.value = false
    staffToDelete.value = null
  }
}



async function fetchStaff() {
  loading.value = true
  errorMessage.value = ''
  try {
    const response = await get_staff()
    staff.value = response.data
  } catch (err) {

    if(err.code === 'ERR_NETWORK'){
      toast.error('Network error. Please check you internet connection.', {position: 'top-right'});
      
    }else if (err.response) {
      // API returned an error response
      toast.error(err.response.data?.message || 'Failed to fetch staff.', { position: 'top-right' });
    } else {
      // Unknown error
      toast.error('An unexpected error occurred while fetching staff.', { position: 'top-right' });
    }
  } finally {
    loading.value = false
  }
 
} 


onMounted (()=>{
  fetchStaff();
})





const bulkDeleteStaff = async (ids) => {
  staffStore = staffStore.filter(s => !ids.includes(s.id))
  return new Promise(resolve => setTimeout(() => resolve(true), 300))
}

// Component state

const isLoading = ref(false)

const searchTerm = ref('')
const selectedIds = ref([])
const showFormModal = ref(false)
const isEdit = ref(false)
const currentStaff = ref(null)

const form = ref({
  fullName: '',
  gender: '',
  nationality: '',
  dateOfBirth: '',
  role: 'TEACHER',
})

const deleteStaff = (staff) => {
  staffToDelete.value = staff
  showDeleteModal.value = true
}

const cancelDelete = () => {
  showDeleteModal.value = false
  staffToDelete.value = null
}



const filteredStaff = computed(() => {
  const term = searchTerm.value.trim().toLowerCase()
  if (!term) return staff.value
  return staff.value.filter(s => s.fullName.toLowerCase().includes(term))
})

const allSelected = computed(() => selectedIds.value.length === filteredStaff.value.length && filteredStaff.value.length > 0)
const someSelected = computed(() => selectedIds.value.length > 0 && selectedIds.value.length < filteredStaff.value.length)

const toggleSelectAll = () => {
  if (allSelected.value) {
    selectedIds.value = []
  } else {
    selectedIds.value = filteredStaff.value.map(s => s.id)
  }
}

const openAddModal = () => {
  isEdit.value = false
  currentStaff.value = null
  form.value = {
    fullName: '',
    gender: '',
    nationality: '',
    dateOfBirth: '',
    role: 'TEACHER',
  }
  showFormModal.value = true
}

const openEditModal = (staffMember) => {
  isEdit.value = true
  currentStaff.value = staffMember
  form.value = {
    fullName: staffMember.fullName,
    gender: staffMember.gender,
    nationality: staffMember.nationality,
    dateOfBirth: staffMember.dateOfBirth,
    role: staffMember.role,
  }
  showFormModal.value = true
}

const closeFormModal = () => {
  showFormModal.value = false
  currentStaff.value = null
}

const submitForm = async () => {

  loading.value = true;

  try {

    form.value.role = 'TEACHER';
    form.value.gender = form.value.gender || "MALE";
    form.value.nationality = form.value.nationality || "Ghanaian";
    form.value.dateOfBirth = form.value.dateOfBirth || '2002-02-02';

    // ✅ Required field validation
    const requiredFields = [
      { field: 'fullName', label: 'Full Name' },
      { field: 'gender', label: 'Gender' },
     
    ];

    for (const { field, label } of requiredFields) {
      if (!form.value[field] || form.value[field].toString().trim() === '') {
        toast.error(`${label} is required`, { position: 'top-right' });
        loading.value = false;
        return;
      }
    }

    // ✅ Clean up form: trim strings and convert empty strings to null
    const cleanedForm = Object.fromEntries(
      Object.entries(form.value).map(([key, value]) => {
        if (typeof value === 'string') {
          const trimmed = value.trim();
          return [key, trimmed === '' ? null : trimmed];
        }
        return [key, value];
      })
    );

     console.log('Sending cleaned form data to API:', cleanedForm);

    if (isEdit.value && currentStaff.value) {
      const response = await update_staff(currentStaff.value.id, cleanedForm);
      
     // Update table immediately
      const index = staff.value.findIndex(s => s.id === currentStaff.value.id);
      if (index !== -1) {
        staff.value[index] = { ...response.data };
      }

      closeFormModal();

      toast.success('staff updated successfully!', { position: 'top-right' });
      } else {
    // ✅ Call API and wait for response
    const response = await create_staff(cleanedForm);

    if (response && response.data) {
      console.log('✅ staff created successfully on the server:', response.data);

      // ✅ Update the table immediately with the new staff record
      console.log("this is waht came", response)
      staff.value.push(response.data);

      toast.success('Staff created successfully!', { position: 'top-right' });

      // ✅ Close modal after success
      closeFormModal();

      // ✅ OPTIONAL: Delay navigation slightly to ensure UI update
      setTimeout(() => {
        router.push({ path: '/staff' });
      }, 500);
    } else {
      throw new Error('No response data from the server.');
    }}

  } catch (error) {
    console.error('❌ Error creating staff:', error.response?.data || error);

    const backendMessage =
      error.response?.data?.message ||
      'Failed to create staff. Please check your input and try again.';

    toast.error(backendMessage, { position: 'top-right' });
  } finally {
    loading.value = false;
  }
}




const openBulkDeleteConfirm = async () => {
  if (confirm(`Delete ${selectedIds.value.length} selected staff members?`)) {
    await bulkDeleteStaff(selectedIds.value)
    selectedIds.value = []
    await fetchStaff()
  }
}
</script>

<style scoped>
/* Ensure header actions wrap well on smaller screens */
@media (max-width: 576px) {
  .gap-2 { row-gap: 0.5rem; }
}
</style>

