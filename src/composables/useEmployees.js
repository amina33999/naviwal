import { ref, computed, onMounted } from "vue";

const API_BASE = 'http://localhost:5000/api';

const employees = ref([]);
const loading = ref(false);
const error = ref(null);

export function useEmployees() {
  const departments = computed(() => {
    const deps = employees.value.map(emp => emp.department_name || emp.department);
    return [...new Set(deps.filter(Boolean))];
  });

  // ====================== ЗАГРУЗКА ======================
  async function fetchEmployees() {
    loading.value = true;
    error.value = null;
    try {
      const res = await fetch(`${API_BASE}/employees`);
      if (!res.ok) throw new Error('Ошибка загрузки');

      const data = await res.json();

      employees.value = data.map(emp => ({
        id: emp.id,
        fullName: emp.name,
        position: emp.position,
        department: emp.department_name || 'Не указан',
        department_id: emp.department_id,
        email: emp.email || '',
        phone: emp.phone || '',
        hireDate: emp.hire_date || '',
        bio: emp.bio || '',
        salary: emp.salary || 0,
        photo: emp.photo || null
      }));
    } catch (e) {
      error.value = e.message;
      console.error('Ошибка загрузки сотрудников:', e);
    } finally {
      loading.value = false;
    }
  }

  // ====================== ДОБАВЛЕНИЕ ======================
  async function add(employee) {
    try {
      const deptMap = { 'IT': 1, 'HR': 2, 'Маркетинг': 3, 'Бухгалтерия': 4 };
      const department_id = deptMap[employee.department] || 1;

      const payload = {
        name: employee.fullName,
        position: employee.position,
        department_id,
        salary: employee.salary || 80000,
        email: employee.email,
        phone: employee.phone || '',
        hire_date: employee.hireDate || '',
        bio: employee.bio || '',
        photo: employee.photo || null
      };

      const res = await fetch(`${API_BASE}/employees`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        await fetchEmployees();
        window.showToast?.(`Сотрудник "${employee.fullName}" добавлен`, 'success');
      } else {
        window.showToast?.('Ошибка при добавлении', 'error');
      }
    } catch (e) {
      console.error(e);
      window.showToast?.('Ошибка соединения', 'error');
    }
  }

  // ====================== ОБНОВЛЕНИЕ ======================
  async function update(id, updatedData) {
    try {
      const deptMap = { 'IT': 1, 'HR': 2, 'Маркетинг': 3, 'Бухгалтерия': 4 };
      const department_id = deptMap[updatedData.department] || updatedData.department_id || 1;

      const payload = {
        name: updatedData.fullName,
        position: updatedData.position,
        department_id,
        salary: updatedData.salary || 80000,
        email: updatedData.email,
        phone: updatedData.phone || '',
        hire_date: updatedData.hireDate || '',
        bio: updatedData.bio || '',
        photo: updatedData.photo || null
      };

      const res = await fetch(`${API_BASE}/employees/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        await fetchEmployees();
        window.showToast?.('Сотрудник успешно обновлён', 'success');
      } else {
        window.showToast?.('Ошибка при обновлении', 'error');
      }
    } catch (e) {
      console.error(e);
      window.showToast?.('Ошибка соединения', 'error');
    }
  }

  async function remove(id) {
    try {
      const res = await fetch(`${API_BASE}/employees/${id}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchEmployees();
        window.showToast?.('Сотрудник удалён', 'success');
      }
    } catch (e) {
      console.error(e);
    }
  }

  function getById(id) {
    return employees.value.find(emp => emp.id === id);
  }

  function search(query) {
    if (!query) return employees.value;
    const lower = query.toLowerCase();
    return employees.value.filter(emp =>
      emp.fullName.toLowerCase().includes(lower) ||
      emp.position.toLowerCase().includes(lower) ||
      (emp.department || '').toLowerCase().includes(lower)
    );
  }

  function filterByDepartment(department, list = employees.value) {
    if (!department || department === "all") return list;
    return list.filter(emp => emp.department === department);
  }

  function filterByPosition(position, list = employees.value) {
    if (!position || position === "all") return list;
    return list.filter(emp => emp.position === position);
  }

  // Экспорт в CSV (оставляем как было у тебя)
  function exportToCSV(employeeList = employees.value) {
    const headers = ["ФИО", "Должность", "Отдел", "Email", "Телефон", "Дата приёма", "Биография"];
    const rows = employeeList.map(emp => [
      emp.fullName,
      emp.position,
      emp.department,
      emp.email,
      emp.phone || '',
      emp.hireDate || '',
      emp.bio || ''
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${String(field).replaceAll('"', '""')}"`).join(";"))
      .join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `employees_${new Date().toISOString().slice(0, 19)}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);

    window.showToast?.(`Экспортировано ${employeeList.length} сотрудников`, 'success');
  }

  function formatDate(dateStr) {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU');
  }

  onMounted(fetchEmployees);

  return {
    employees,
    departments,
    loading,
    error,
    fetchEmployees,
    getById,
    add,
    update,
    remove,
    search,
    filterByDepartment,
    filterByPosition,
    exportToCSV,
    formatDate
  };
}