import { ref } from "vue";

const API_URL = "http://localhost:5000/api/employees";
const AUTH_URL = "http://localhost:5000/api/auth"; 
const employees = ref([]);
const departments = ref([]);

// Глобальное состояние авторизации
const isAuthorized = ref(!!localStorage.getItem("token"));

export function useEmployees() {

  // Вспомогательный метод для сборки заголовков с JWT-токеном
  function getHeaders(extraHeaders = {}) {
    const token = localStorage.getItem("token");
    const headers = { ...extraHeaders };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
  }

  // Загрузка сотрудников с фильтрацией
  async function loadEmployees(params = {}) {
    try {
      const query = new URLSearchParams();
      if (params.search) query.append('search', params.search);
      if (params.department && params.department !== 'all') {
        query.append('department', params.department);
      }

      const queryString = query.toString();
      const fetchUrl = queryString ? `${API_URL}?${queryString}` : API_URL;

      const res = await fetch(fetchUrl, { headers: getHeaders() });
      if (res.ok) {
        employees.value = await res.json();
      }

      if (departments.value.length === 0) {
        const deptRes = await fetch("http://localhost:5000/api/departments", { headers: getHeaders() });
        if (deptRes.ok) {
          departments.value = await deptRes.json();
        }
      }
    } catch (e) {
      console.error("API Error:", e);
    }
  }

  function getAll() {
    return employees.value;
  }

  function getById(id) {
    return employees.value.find((emp) => emp.id === Number(id));
  }

  // ДОБАВЛЕНО: Асинхронный метод загрузки файла фотографии на сервер
  async function uploadPhoto(file) {
    try {
      const formData = new FormData();
      formData.append('photo', file);

      const res = await fetch(`${API_URL}/upload-photo`, {
        method: "POST",
        headers: getHeaders(), // Content-Type указывать НЕ надо, FormData выставит его сама вместе с boundary
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        return data.photo_url; // Возвращает прямую ссылку на изображение с бэкенда
      }
    } catch (e) {
      console.error("Ошибка при загрузке изображения:", e);
    }
    return null;
  }

  // Обновленный метод добавления с поддержкой всех новых полей
  async function add(employee) {
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: getHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(employee) // Здесь уже улетают phone, hire_date, bio, photo_url
      });
      
      if (res.ok) {
        const newEmployee = await res.json();
        const foundDept = departments.value.find(d => d.id === Number(newEmployee.department_id));
        newEmployee.department_name = foundDept ? foundDept.name : '';
        
        employees.value.push(newEmployee);
        
        if (window.showToast) {
          window.showToast(`Сотрудник "${newEmployee.name}" добавлен`, 'success');
        }
        return true;
      }
    } catch (e) {
      console.error("Ошибка при добавлении:", e);
    }
    return false;
  }

  // Обновленный метод редактирования с поддержкой всех новых полей
  async function update(id, updatedData) {
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: getHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(updatedData)
      });

      if (res.ok) {
        const index = employees.value.findIndex((emp) => emp.id == id);
        if (index !== -1) {
          const oldName = employees.value[index].name;
          const foundDept = departments.value.find(d => d.id === Number(updatedData.department_id));
          
          const localUpdated = {
            ...employees.value[index],
            ...updatedData,
            department_name: foundDept ? foundDept.name : ''
          };
          
          employees.value.splice(index, 1, localUpdated);
          
          if (window.showToast) {
            window.showToast(`Сотрудник "${oldName}" обновлён`, 'success');
          }
          return true;
        }
      }
    } catch (e) {
      console.error("Ошибка при обновлении:", e);
    }
    return false;
  }

  async function remove(id) {
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: getHeaders()
      });

      if (res.ok) {
        const deleted = employees.value.find((emp) => emp.id == id);
        employees.value = employees.value.filter((emp) => emp.id != id);
        if (window.showToast && deleted) {
          window.showToast(`Сотрудник "${deleted.name}" удалён`, 'success');
        }
        return true;
      }
    } catch (e) {
      console.error("Ошибка при удалении:", e);
    }
    return false;
  }

  function exportToCSV() {
    const link = document.createElement("a");
    link.href = `${API_URL}/export`;
    link.setAttribute("download", `employees_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (window.showToast) {
      window.showToast(`Отчет CSV успешно сгенерирован сервером`, 'success');
    }
  }

  function formatDate(dateStr) {
    if (!dateStr) return "-";
    if (dateStr.includes('.')) return dateStr;
    const parts = dateStr.split("-");
    if (parts.length !== 3) return dateStr;
    return `${parts[2]}.${parts[1]}.${parts[0]}`;
  }

  // --- АВТОРИЗАЦИЯ ---
  async function login(username, password) {
    try {
      const res = await fetch(`${AUTH_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("token", data.token || "mock-jwt-token");
        isAuthorized.value = true;
        if (window.showToast) window.showToast("Вход выполнен успешно", "success");
        return true;
      } else {
        if (window.showToast) window.showToast("Неверный логин или пароль", "error");
      }
    } catch (e) {
      console.error("Ошибка при входе:", e);
    }
    return false;
  }

  async function register(username, password) {
    try {
      const res = await fetch(`${AUTH_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      if (res.ok) {
        if (window.showToast) window.showToast("Регистрация успешна! Теперь войдите", "success");
        return true;
      } else {
        const errData = await res.json().catch(() => ({}));
        if (window.showToast) window.showToast(errData.message || "Ошибка регистрации", "error");
      }
    } catch (e) {
      console.error("Ошибка при регистрации:", e);
    }
    return false;
  }

  function logout() {
    localStorage.removeItem("token");
    isAuthorized.value = false;
    if (window.showToast) window.showToast("Вы вышли из системы", "info");
  }

  return {
    employees,
    departments,
    isAuthorized,
    loadEmployees,
    getAll,
    getById,
    uploadPhoto, // Экспортируем метод загрузки фото
    add,
    update,
    remove,
    exportToCSV,
    formatDate,
    login,        
    register,     
    logout,       
  };
}