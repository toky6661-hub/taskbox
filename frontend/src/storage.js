export function saveData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}
export function loadData(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
}
//# sourceMappingURL=storage.js.map