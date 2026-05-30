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
    bio: "Отвечает за подбор персонала...",
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
  }

  function update(id, updatedData) {
    const index = employees.value.findIndex((emp) => emp.id === id);
    if (index !== -1) {
      employees.value[index] = { ...employees.value[index], ...updatedData };
      saveToLocalStorage();
    }
  }

  function remove(id) {
    employees.value = employees.value.filter((emp) => emp.id !== id);
    saveToLocalStorage();
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
      emp.fullName,
      emp.position,
      emp.department,
      emp.email,
      emp.phone,
      emp.hireDate,
      emp.bio,
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
    link.setAttribute("download", "employees.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
