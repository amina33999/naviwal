import { ref, computed } from "vue";

const STORAGE_KEY = "employees";

const defaultEmployees = [
  {
    id: 1,
    fullName: "Иванова Анна Петровна",
    position: "HR-менеджер",
    department: "HR",
    email: "anna.ivanova@company.com",
    phone: "+7 (495) 123-45-67",
    hireDate: "2023-01-15",
    bio: "Отвечает за подбор персонала, проведение собеседований и адаптацию новых сотрудников.",
    photo: null,
  },
  {
    id: 2,
    fullName: "Петров Сергей Владимирович",
    position: "Ведущий разработчик",
    department: "IT",
    email: "sergey.petrov@company.com",
    phone: "+7 (495) 234-56-78",
    hireDate: "2022-06-10",
    bio: "Руководит командой разработки, отвечает за архитектуру проектов.",
    photo: null,
  },
  {
    id: 3,
    fullName: "Сидорова Елена Алексеевна",
    position: "Менеджер по продажам",
    department: "Продажи",
    email: "elena.sidorova@company.com",
    phone: "+7 (495) 345-67-89",
    hireDate: "2023-03-20",
    bio: "Работа с ключевыми клиентами, развитие партнёрской сети.",
    photo: null,
  },
];

function initEmployees() {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultEmployees));
}
initEmployees();

const employees = ref(JSON.parse(localStorage.getItem(STORAGE_KEY)) || []);

function saveToLocalStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(employees.value));
}

export function useEmployees() {
  const departments = computed(() => {
    const deps = employees.value.map((emp) => emp.department);
    return [...new Set(deps)];
  });

  function getAll() {
    return employees.value;
  }
  
  function getById(id) {
    return employees.value.find((emp) => emp.id === id);
  }

  function add(employee) {
    const maxId = employees.value.length
      ? Math.max(...employees.value.map((e) => e.id))
      : 0;
    const newEmployee = { id: maxId + 1, ...employee };
    employees.value.push(newEmployee);
    saveToLocalStorage();
    if (window.showToast) {
      window.showToast(`Сотрудник "${newEmployee.fullName}" добавлен`, 'success');
    }
  }

  function update(id, updatedData) {
    const index = employees.value.findIndex((emp) => emp.id === id);
    if (index !== -1) {
      const oldName = employees.value[index].fullName;
      employees.value[index] = { ...employees.value[index], ...updatedData };
      saveToLocalStorage();
      if (window.showToast) {
        window.showToast(`Сотрудник "${oldName}" обновлён`, 'success');
      }
    }
  }

  function remove(id) {
    const deleted = employees.value.find((emp) => emp.id === id);
    employees.value = employees.value.filter((emp) => emp.id !== id);
    saveToLocalStorage();
    if (window.showToast && deleted) {
      window.showToast(`Сотрудник "${deleted.fullName}" удалён`, 'success');
    }
  }

  function search(query) {
    if (!query) return employees.value;
    const lower = query.toLowerCase();
    return employees.value.filter(
      (emp) =>
        emp.fullName.toLowerCase().includes(lower) ||
        emp.position.toLowerCase().includes(lower) ||
        emp.department.toLowerCase().includes(lower),
    );
  }

  function filterByDepartment(department, list = employees.value) {
    if (!department || department === "all") return list;
    return list.filter((emp) => emp.department === department);
  }

  function filterByPosition(position, list = employees.value) {
    if (!position || position === "all") return list;
    return list.filter((emp) => emp.position === position);
  }

  function exportToCSV(employeeList = employees.value) {
    const headers = [
      "ФИО",
      "Должность",
      "Отдел",
      "Email",
      "Телефон",
      "Дата приёма",
      "Биография",
    ];
    const rows = employeeList.map((emp) => [
      `"${emp.fullName}"`,
      `"${emp.position}"`,
      `"${emp.department}"`,
      emp.email,
      emp.phone,
      emp.hireDate,
      `"${emp.bio || ''}"`,
    ]);
    const csvContent = [headers, ...rows]
      .map((row) => row.join(","))
      .join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute("download", `employees_${new Date().toISOString().slice(0,19)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    if (window.showToast) {
      window.showToast(`Экспортировано ${employeeList.length} сотрудников`, 'success');
    }
  }

  function formatDate(dateStr) {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-");
    return `${day}.${month}.${year}`;
  }

  return {
    employees,
    departments,
    getAll,
    getById,
    add,
    update,
    remove,
    search,
    filterByDepartment,
    filterByPosition,
    exportToCSV,
    formatDate,
  };
}
