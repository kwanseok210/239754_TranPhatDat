
import { useEffect, useState } from 'react'

const API_URL = (
  import.meta.env.VITE_API_URL || 'http://localhost:5000'
).replace(/\/$/, '')

const initialForm = {
  employeeId: '',
  fullName: '',
  gender: 'Nam',
  dateOfBirth: '',
  department: '',
  position: '',
  email: '',
  phone: '',
  hireDate: '',
  status: 'Đang làm việc',
}

const initialEditForm = {
  fullName: '',
  gender: 'Nam',
  dateOfBirth: '',
  department: '',
  position: '',
  email: '',
  phone: '',
  hireDate: '',
  status: 'Đang làm việc',
}

function App() {
  const [employees, setEmployees] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(initialForm)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [editingEmployee, setEditingEmployee] = useState(null)
  const [editForm, setEditForm] = useState(initialEditForm)
  const [updating, setUpdating] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  async function loadEmployees() {
    try {
      setLoading(true)
      setError('')

      const response = await fetch(`${API_URL}/api/employees`)
      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Không tải được nhân viên.')
      }

      setEmployees(result.data)
    } catch (err) {
      setError(err.message || 'Không thể kết nối Backend.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadEmployees()
  }, [])

  function handleChange(event) {
    const { name, value } = event.target
    setForm((previous) => ({ ...previous, [name]: value }))
  }

  function handleEditChange(event) {
    const { name, value } = event.target
    setEditForm((previous) => ({ ...previous, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setMessage('')
    setSaving(true)

    try {
      const payload = {
        ...form,
        dateOfBirth: form.dateOfBirth || undefined,
        hireDate: form.hireDate || undefined,
      }

      const response = await fetch(`${API_URL}/api/employees`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Thêm nhân viên thất bại.')
      }

      setMessage('Thêm nhân viên thành công!')
      setForm(initialForm)
      setShowForm(false)
      await loadEmployees()
    } catch (err) {
      setMessage(err.message || 'Không thể kết nối Backend.')
    } finally {
      setSaving(false)
    }
  }

  function startEdit(employee) {
    setEditingEmployee(employee)
    setShowForm(false)
    setMessage('')

    setEditForm({
      fullName: employee.fullName || '',
      gender: employee.gender || 'Nam',
      dateOfBirth: employee.dateOfBirth
        ? employee.dateOfBirth.slice(0, 10)
        : '',
      department: employee.department || '',
      position: employee.position || '',
      email: employee.email || '',
      phone: employee.phone || '',
      hireDate: employee.hireDate
        ? employee.hireDate.slice(0, 10)
        : '',
      status: employee.status || 'Đang làm việc',
    })
  }

  async function handleUpdate(event) {
    event.preventDefault()

    if (!editingEmployee) return

    setUpdating(true)
    setMessage('')

    try {
      const payload = {
        ...editForm,
        dateOfBirth: editForm.dateOfBirth || undefined,
        hireDate: editForm.hireDate || undefined,
      }

      const response = await fetch(
        `${API_URL}/api/employees/${editingEmployee._id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
      )

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Cập nhật nhân viên thất bại.')
      }

      setEditingEmployee(null)
      setMessage('Cập nhật nhân viên thành công!')
      await loadEmployees()
    } catch (err) {
      setMessage(err.message || 'Không thể kết nối Backend.')
    } finally {
      setUpdating(false)
    }
  }

  async function handleDelete(employee) {
    const confirmed = window.confirm(
      `Bạn có chắc chắn muốn xóa nhân viên "${employee.fullName}" (${employee.employeeId}) không?`,
    )

    if (!confirmed) return

    setDeletingId(employee._id)
    setMessage('')

    try {
      const response = await fetch(
        `${API_URL}/api/employees/${employee._id}`,
        {
          method: 'DELETE',
        },
      )

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Xóa nhân viên thất bại.')
      }

      if (editingEmployee?._id === employee._id) {
        setEditingEmployee(null)
      }

      setMessage(`Đã xóa nhân viên ${employee.employeeId} thành công!`)
      await loadEmployees()
    } catch (err) {
      setMessage(err.message || 'Không thể kết nối Backend.')
    } finally {
      setDeletingId(null)
    }
  }

  const filteredEmployees = employees.filter((employee) => {
    const keyword = search.trim().toLowerCase()

    return (
      employee.employeeId?.toLowerCase().includes(keyword) ||
      employee.fullName?.toLowerCase().includes(keyword)
    )
  })

  return (
    <div>
      <header>
        <h1>Quản lý nhân viên</h1>
        <p>Hệ thống quản lý thông tin nhân sự</p>
      </header>

      <main>
        <h2>Danh sách nhân viên</h2>

        <div>
          <input
            type="text"
            placeholder="Tìm theo mã hoặc họ tên nhân viên..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          <button
            type="button"
            onClick={() => {
              setMessage('')
              setEditingEmployee(null)
              setShowForm((previous) => !previous)
            }}
          >
            {showForm ? 'Đóng biểu mẫu' : '+ Thêm nhân viên'}
          </button>
        </div>

        {message && <p role="status">{message}</p>}

        {showForm && (
          <form onSubmit={handleSubmit}>
            <h3>Thông tin nhân viên mới</h3>

            <div className="form-grid">
              <label>
                Mã nhân viên *
                <input
                  name="employeeId"
                  value={form.employeeId}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                Họ và tên *
                <input
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                Email *
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                Số điện thoại
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                />
              </label>

              <label>
                Phòng ban
                <input
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                />
              </label>

              <label>
                Chức vụ
                <input
                  name="position"
                  value={form.position}
                  onChange={handleChange}
                />
              </label>

              <label>
                Giới tính
                <select
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                >
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                  <option value="Khác">Khác</option>
                </select>
              </label>

              <label>
                Ngày sinh
                <input
                  name="dateOfBirth"
                  type="date"
                  value={form.dateOfBirth}
                  onChange={handleChange}
                />
              </label>

              <label>
                Ngày vào làm
                <input
                  name="hireDate"
                  type="date"
                  value={form.hireDate}
                  onChange={handleChange}
                />
              </label>

              <label>
                Trạng thái
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                >
                  <option value="Đang làm việc">Đang làm việc</option>
                  <option value="Đã nghỉ việc">Đã nghỉ việc</option>
                  <option value="Tạm nghỉ">Tạm nghỉ</option>
                </select>
              </label>
            </div>

            <button type="submit" disabled={saving}>
              {saving ? 'Đang lưu...' : 'Lưu nhân viên'}
            </button>

            <button
              type="button"
              onClick={() => setShowForm(false)}
            >
              Hủy
            </button>
          </form>
        )}

        {editingEmployee && (
          <form onSubmit={handleUpdate}>
            <h3>
              Sửa nhân viên: {editingEmployee.employeeId}
            </h3>

            <div className="form-grid">
              <label>
                Họ và tên *
                <input
                  name="fullName"
                  value={editForm.fullName}
                  onChange={handleEditChange}
                  required
                />
              </label>

              <label>
                Email *
                <input
                  name="email"
                  type="email"
                  value={editForm.email}
                  onChange={handleEditChange}
                  required
                />
              </label>

              <label>
                Phòng ban
                <input
                  name="department"
                  value={editForm.department}
                  onChange={handleEditChange}
                />
              </label>

              <label>
                Chức vụ
                <input
                  name="position"
                  value={editForm.position}
                  onChange={handleEditChange}
                />
              </label>

              <label>
                Số điện thoại
                <input
                  name="phone"
                  value={editForm.phone}
                  onChange={handleEditChange}
                />
              </label>

              <label>
                Giới tính
                <select
                  name="gender"
                  value={editForm.gender}
                  onChange={handleEditChange}
                >
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                  <option value="Khác">Khác</option>
                </select>
              </label>

              <label>
                Ngày sinh
                <input
                  name="dateOfBirth"
                  type="date"
                  value={editForm.dateOfBirth}
                  onChange={handleEditChange}
                />
              </label>

              <label>
                Ngày vào làm
                <input
                  name="hireDate"
                  type="date"
                  value={editForm.hireDate}
                  onChange={handleEditChange}
                />
              </label>

              <label>
                Trạng thái
                <select
                  name="status"
                  value={editForm.status}
                  onChange={handleEditChange}
                >
                  <option value="Đang làm việc">Đang làm việc</option>
                  <option value="Đã nghỉ việc">Đã nghỉ việc</option>
                  <option value="Tạm nghỉ">Tạm nghỉ</option>
                </select>
              </label>
            </div>

            <button type="submit" disabled={updating}>
              {updating ? 'Đang cập nhật...' : 'Lưu thay đổi'}
            </button>

            <button
              type="button"
              onClick={() => setEditingEmployee(null)}
              disabled={updating}
            >
              Hủy
            </button>
          </form>
        )}

        {loading && <p>Đang tải danh sách nhân viên...</p>}
        {!loading && error && <p role="alert">{error}</p>}

        {!loading && !error && (
          <table>
            <thead>
              <tr>
                <th>Mã NV</th>
                <th>Họ và tên</th>
                <th>Phòng ban</th>
                <th>Chức vụ</th>
                <th>Email</th>
                <th>Số điện thoại</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>

            <tbody>
              {filteredEmployees.length > 0 ? (
                filteredEmployees.map((employee) => (
                  <tr key={employee._id}>
                    <td>{employee.employeeId}</td>
                    <td>{employee.fullName}</td>
                    <td>{employee.department}</td>
                    <td>{employee.position}</td>
                    <td>{employee.email}</td>
                    <td>{employee.phone}</td>
                    <td>{employee.status}</td>
                    <td>
                      <button
                        type="button"
                        onClick={() => startEdit(employee)}
                        disabled={deletingId !== null}
                      >
                        Sửa
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(employee)}
                        disabled={deletingId !== null}
                      >
                        {deletingId === employee._id
                          ? 'Đang xóa...'
                          : 'Xóa'}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8">
                    {search
                      ? 'Không tìm thấy nhân viên phù hợp.'
                      : 'Chưa có dữ liệu nhân viên.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </main>
    </div>
  )
}

export default App
