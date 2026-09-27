import { useEffect, useState } from 'react';
import api from '../../api/axios';
import AppLayout from '../../components/AppLayout';

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [filters, setFilters] = useState({ search: '', branch: '', year: '', placed: '' });
  const [selected, setSelected] = useState(null);

  const load = async () => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v) params.append(k, v);
    });
    const { data } = await api.get(`/admin/students?${params.toString()}`);
    setStudents(data.students);
  };

  useEffect(() => {
    load();
  }, []);

  const viewDetails = async (id) => {
    const { data } = await api.get(`/admin/students/${id}`);
    setSelected(data);
  };

  const toggleActive = async (id) => {
    await api.patch(`/admin/students/${id}/toggle-active`);
    load();
  };

  const exportCsv = async () => {
    const response = await api.get('/admin/students/export', { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'students.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <AppLayout>
      <div className="page-header">
        <h2>Manage Students</h2>
        <button className="btn btn-secondary" onClick={exportCsv}>
          Export CSV
        </button>
      </div>

      <form
        className="filters"
        onSubmit={(e) => {
          e.preventDefault();
          load();
        }}
      >
        <input placeholder="Search name/email/college" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
        <input placeholder="Branch" value={filters.branch} onChange={(e) => setFilters({ ...filters, branch: e.target.value })} />
        <input placeholder="Year" value={filters.year} onChange={(e) => setFilters({ ...filters, year: e.target.value })} />
        <select value={filters.placed} onChange={(e) => setFilters({ ...filters, placed: e.target.value })}>
          <option value="">All</option>
          <option value="true">Placed</option>
          <option value="false">Not placed</option>
        </select>
        <button className="btn btn-primary" type="submit">
          Filter
        </button>
      </form>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Branch</th>
              <th>Year</th>
              <th>CGPA</th>
              <th>Placed</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id}>
                <td>{s.full_name}</td>
                <td>{s.email}</td>
                <td>{s.branch}</td>
                <td>{s.graduation_year}</td>
                <td>{s.cgpa || '-'}</td>
                <td>{s.is_placed ? 'Yes' : 'No'}</td>
                <td>{s.is_active ? 'Active' : 'Inactive'}</td>
                <td className="actions">
                  <button className="btn btn-light" onClick={() => viewDetails(s.id)}>
                    View
                  </button>
                  <button className="btn btn-light" onClick={() => toggleActive(s.id)}>
                    {s.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected ? (
        <section className="panel">
          <div className="page-header">
            <h3>{selected.student.full_name}</h3>
            <button className="btn btn-light" onClick={() => setSelected(null)}>
              Close
            </button>
          </div>
          <p>
            {selected.student.email} · {selected.student.branch} · CGPA {selected.student.cgpa || '-'}
          </p>
          <p>Skills: {selected.skills.map((x) => x.skill_name).join(', ') || 'None'}</p>
          <p>Applications: {selected.applications.length}</p>
        </section>
      ) : null}
    </AppLayout>
  );
}
