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
                <CTableDataCell>{{ row.user.full_name }}</CTableDataCell>
                
                <CTableDataCell>{{ row.user.gender }}</CTableDataCell>
                
                
                <CTableDataCell>
                  <CBadge :color="row.user.is_active ? 'success' : 'secondary'">
                    {{ row.user.is_active ? 'Active' : 'Inactive' }}
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
    Are you sure you want to delete <strong>{{ staffToDelete?.full_name }}</strong>?
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
        <CFormInput v-model="form.user.full_name" />
      </div>

      <div class="mb-3">
      <CFormLabel>Gender</CFormLabel>
      <CFormSelect v-model="form.user.gender">
        <option disabled value="">Select Gender</option>
        <option value="male">Male</option>
        <option value="female">Female</option>
      </CFormSelect>
    </div>

    <div class="mb-3">
      <CFormLabel>Date of Birth</CFormLabel>
      <CFormInput v-model="form.user.date_of_birth" type="date" />
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



    toast.success(`${staffToDelete.value.user.full_name} deleted successfully!`, { position: 'top-right' })
  } catch (error) {

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
  user: {
    full_name: '',
    gender: '',            // 'male' | 'female'

    date_of_birth: '',     // 'YYYY-MM-DD' string for <input type="date">
    role: "staff"
  }
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
  return staff.value.filter(s => s.user.full_name.toLowerCase().includes(term))
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
  isEdit.value = false;
  currentStaff.value = null;

  form.value = {
    user: {
      full_name: '',
      gender: '',
 
      date_of_birth: '', // match backend field name
      role: 'staff'
    }
  };

  showFormModal.value = true;
};

const openEditModal = (staffMember) => {
  isEdit.value = true;
  currentStaff.value = staffMember;

  const user = staffMember.user || {}; // safe check

  form.value = {
    user: {
      full_name: user.full_name || '',
      gender: user.gender ? user.gender.toLowerCase() : '',
     
      date_of_birth: user.date_of_birth || '',
      role: user.role || 'staff'
    }
  };

  showFormModal.value = true;
};



const closeFormModal = () => {
  showFormModal.value = false
  currentStaff.value = null
}

const submitForm = async () => {
  loading.value = true;

  try {
    
    function deepClean(obj) {
      return Object.fromEntries(
        Object.entries(obj).map(([key, value]) => {
          if (typeof value === "string") {
            const trimmed = value.trim();
            return [key, trimmed === "" ? null : trimmed];
          } else if (value && typeof value === "object") {
            return [key, deepClean(value)];
          }
          return [key, value];
        })
      );
    }

    const cleaned = deepClean(form.value);

    // Ensure lowercase gender
    if (cleaned.user.gender) {
      cleaned.user.gender = cleaned.user.gender.toLowerCase();
    }



    if (isEdit.value && currentStaff.value) {
      const response = await update_staff(currentStaff.value.id, cleaned);
      toast.success("Staff updated!");
    } else {
      let finalPayload = JSON.parse(JSON.stringify(cleaned));

      // ensure gender exists
      if (!finalPayload.user.gender) {
        finalPayload.user.gender = "male";
      }

      // ensure date_of_birth exists
      if (!finalPayload.user.date_of_birth) {
        finalPayload.user.date_of_birth = "2002-02-02";
      }



const response = await create_staff(finalPayload);


      toast.success("Staff created!");
    }

    closeFormModal();
    fetchStaff();

  } catch (error) {

    toast.error("Failed to save staff.");
  } finally {
    loading.value = false;
  }
};



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

