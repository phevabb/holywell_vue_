<template>
  <CRow>
    <CCol :xs="12">
      <CCard class="mb-4">
        <CCardHeader>
          <div class="d-flex justify-content-between align-items-center gap-2 flex-wrap">
            <strong>Administrators</strong>

            <div class="d-flex align-items-center gap-2 flex-wrap">
              

              

              <CButton color="primary" size="sm" @click="openAddModal">
                Add Administrator
              </CButton>
              <small> Default password for Administrator is: TempPassword123!</small>
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
                
                <CTableHeaderCell>#</CTableHeaderCell>
                <CTableHeaderCell>Name</CTableHeaderCell>
                <CTableHeaderCell>Email</CTableHeaderCell>                
                <CTableHeaderCell>Gender</CTableHeaderCell>
               
                
                
                <CTableHeaderCell>Status</CTableHeaderCell>
                <CTableHeaderCell class="text-end">Actions</CTableHeaderCell>
              </CTableRow>
            </CTableHead>

            <CTableBody>
              <CTableRow v-for="(row, idx) in  staff" :key="row.id">
                
                <CTableHeaderCell>{{ idx + 1 }}</CTableHeaderCell>
                <CTableDataCell>{{ row.full_name }}</CTableDataCell>
                <CTableDataCell>{{ row.email }}</CTableDataCell>
                
                <CTableDataCell>{{ row.gender }}</CTableDataCell>
                
                
                
                <CTableDataCell>
                  <CBadge :color="row.is_active ? 'success' : 'secondary'">
                    {{ row.is_active ? 'Active' : 'Inactive' }}
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
      <CModalTitle>{{ isEdit ? 'Edit Administrator' : 'Add Administrator' }}</CModalTitle>

    </CModalHeader>
    <CModalBody>
      <div class="mb-3">
        <CFormLabel>Full Name</CFormLabel>
        <CFormInput v-model="form.full_name" />
      </div>

      <div class="mb-3">
        <CFormLabel>Email</CFormLabel>
        <CFormInput v-model="form.email" />
      </div>

      <div class="mb-3">
      <CFormLabel>Gender</CFormLabel>
      <CFormSelect v-model="form.gender">
        <option disabled value="">Select Gender</option>
        <option value="male">Male</option>
        <option value="female">Female</option>
      </CFormSelect>
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
  get_administrators,
  create_administrator,
  update_administrator,
  delete_administrator,
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
    const idtodelete = staffToDelete.value.id
    const fullNameToDelete = staffToDelete.value.full_name

      
    const res = await delete_administrator(staffToDelete.value.id)


    staff.value = staff.value.filter(s => s.id !== idtodelete)



    toast.success(`${fullNameToDelete} deleted successfully!`, { position: 'top-right' })
  } catch (error) {

    toast.error('Failed to delete staff. Please try again.', { position: 'top-right' })
  } finally {
    loading.value = false
    staffToDelete.value = null
  }
}



async function fetchAdministrators() {
  loading.value = true
  errorMessage.value = ''
  try {
    const response = await get_administrators()
 

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
  fetchAdministrators();
})


// Component state

const isLoading = ref(false)

const searchTerm = ref('')
const selectedIds = ref([])
const showFormModal = ref(false)
const isEdit = ref(false)
const currentStaff = ref(null)

const form = ref({
 
    full_name: '',
    gender: '',            // 'male' | 'female'

    date_of_birth: '',     // 'YYYY-MM-DD' string for <input type="date">
    role: "administrator",
    email: ''

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
  return staff.value.filter(s => s.full_name.toLowerCase().includes(term))
})



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

  const user = staffMember || {}; // safe check

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
    const payload = {
  full_name: form.value.full_name.trim() || null,
  gender: (form.value.gender || 'male').toLowerCase(),
  date_of_birth: form.value.date_of_birth || '2002-02-02',
  role: 'administrator',
  is_active: true,
  password: 'TempPassword123!',  // required for creation
  email: form.value.email.trim() || null,
};


    if (isEdit.value && currentStaff.value) {
      await update_administrator(currentStaff.value.id, payload);
      toast.success("Administrator updated!");
    } else {


        const response = await create_administrator(payload); // <-- call API

      toast.success("Administrator created!");
    }

    closeFormModal();
    fetchAdministrators();

  } catch (error) {
 
    toast.error("Failed to save administrator.");
  } finally {
    loading.value = false;
  }
};



</script>

<style scoped>
/* Ensure header actions wrap well on smaller screens */
@media (max-width: 576px) {
  .gap-2 { row-gap: 0.5rem; }
}
</style>

