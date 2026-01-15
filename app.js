//const API_BASE = 'http://127.0.0.1:8787/api'
const API_BASE = 'https://my-api.arsolutions.workers.dev/api'

const tableBody = document.getElementById('vehicleTable')
const searchInput = document.getElementById('searchInput')

// Fetch vehicles
let currentPage = 1

async function loadVehicles(search = '') {
  const res = await fetch(
    `${API_BASE}/vehicles?search=${encodeURIComponent(search)}&page=${currentPage}`
  )

  const data = await res.json()

  const rows = data.records

  if (rows.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="8">No records found</td></tr>`
    return
  }

  tableBody.innerHTML = rows.map(v => `
    <tr>
      <td>${v.employee_id}</td>
      <td>${v.employee_name}</td>
      <td>${v.vehicle_no}</td>
      <td>${v.parking_sticker_no || '-'}</td>
      <td>${v.vehicle_type}</td>
      <td>${v.contact_no}</td>
      <td>${v.extension_no || '-'}</td>
      <td>${v.remarks || '-'}</td>
      <td class="actions">
      <button onclick='editVehicle(${JSON.stringify(v)})'>✏️</button>
    </td>
    </tr>
  `).join('')

  document.getElementById('pageInfo').textContent =
    `Page ${data.page} of ${data.totalPages}`

  prevBtn.disabled = data.page === 1
  nextBtn.disabled = data.page === data.totalPages
}


//Button Paginantion Actions
prevBtn.onclick = () => {
  if (currentPage > 1) {
    currentPage--
    loadVehicles(searchInput.value)
  }
}

nextBtn.onclick = () => {
  currentPage++
  loadVehicles(searchInput.value)
}

searchInput.addEventListener('input', () => {
  currentPage = 1
  loadVehicles(searchInput.value)
})





// Live search
searchInput.addEventListener('input', (e) => {
  loadVehicles(e.target.value)
})

// Initial load
loadVehicles()


const modal = document.getElementById('modal')
const addBtn = document.getElementById('addBtn')
const closeBtn = document.getElementById('closeBtn')
const saveBtn = document.getElementById('saveBtn')

addBtn.onclick = () => openModal()
closeBtn.onclick = () => closeModal()

function openModal(vehicle = null) {
  modal.classList.remove('hidden')
  document.getElementById('modalTitle').innerText =
    vehicle ? 'Edit Vehicle' : 'Add Vehicle'

  document.getElementById('vehicleId').value = vehicle?.id || ''
  document.getElementById('employee_id').value = vehicle?.employee_id || ''
  document.getElementById('employee_name').value = vehicle?.employee_name || ''
  document.getElementById('vehicle_no').value = vehicle?.vehicle_no || ''
  document.getElementById('parking_sticker_no').value = vehicle?.parking_sticker_no || ''
  document.getElementById('vehicle_type').value = vehicle?.vehicle_type || ''
  document.getElementById('contact_no').value = vehicle?.contact_no || ''
  document.getElementById('extension_no').value = vehicle?.extension_no || ''
  document.getElementById('remarks').value = vehicle?.remarks || ''
  document.getElementById('pin').value = ''
}

function closeModal() {
  modal.classList.add('hidden')
}

function editVehicle(vehicle) {
  openModal(vehicle)
}


function clearErrors() {
  document.querySelectorAll('.error').forEach(e => e.textContent = '')
}

function setError(id, message) {
  document.getElementById(id).textContent = message
}



function validateForm() {
    clearErrors()
  // Trim values
  employee_id.value = employee_id.value.trim()
  employee_name.value = employee_name.value.trim()
  vehicle_no.value = vehicle_no.value.trim()
  contact_no.value = contact_no.value.trim()
  parking_sticker_no.value = parking_sticker_no.value.trim()
  pin.value = pin.value.trim()

  // Employee ID
  if (!/^\d{8}$/.test(employee_id.value)) {
    setError('err_employee_id','Employee ID must be exactly 8 digits')
    return false
  }

  // Employee Name
  if (employee_name.value === '') {
    setError('err_employee_name', 'Employee Name is required')
    return false
  }

// Capitalize first letter of every word
employee_name.value = employee_name.value
  .trim()
  .toLowerCase()
  .split(/\s+/)
  .map(word => word.charAt(0).toUpperCase() + word.slice(1))
  .join(' ')

  // Vehicle No
  if (vehicle_no.value === '') {
    setError('err_vehicle_no', 'Vehicle No is required')
    return false
  }

  // Convert to ALL CAPS
  vehicle_no.value = vehicle_no.value.toUpperCase()

  // Contact No
  if (!/^\d{10}$/.test(contact_no.value)) {
    setError('err_contact_no', 'Contact No must be exactly 10 digits')
    return false
  }

  // Parking Sticker No (optional)
  if (parking_sticker_no.value !== '' && !/^\d+$/.test(parking_sticker_no.value)) {
    setError('err_parking_sticker_no','Parking Sticker No must be numeric')
    return false
  }

   // Vehcile Type
  if (vehicle_type.value === '') {
    setError('err_vehicle_type', 'Vehicle Type is required')
    return false
  }
  
  // PIN
  if (pin.value === '') {
    setError('err_pin','PIN is required')
    return false
  }

  return true
}




saveBtn.onclick = async () => {
  if (!validateForm()) return
  const id = document.getElementById('vehicleId').value
  const payload = {
    pin: document.getElementById('pin').value,
    employee_id: employee_id.value,
    employee_name: employee_name.value,
    vehicle_no: vehicle_no.value,
    parking_sticker_no: parking_sticker_no.value,
    vehicle_type: vehicle_type.value,
    contact_no: contact_no.value,
    extension_no: extension_no.value,
    remarks: remarks.value
  }

  const method = id ? 'PUT' : 'POST'
  const url = id
    ? `${API_BASE}/vehicles/${id}`
    : `${API_BASE}/vehicles`

  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })

  const result = await res.json()

  if (!res.ok) {
    alert(result.error || 'Error')
    return
  }

  closeModal()
  loadVehicles()
}
