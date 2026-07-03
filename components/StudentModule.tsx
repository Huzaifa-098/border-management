import React, { useState } from 'react';
import { MOCK_STUDENTS } from '../constants';
import { Student } from '../types';
import { Edit2, Trash2, Eye, Plus, Search } from 'lucide-react';

const StudentModule: React.FC = () => {
  const [students, setStudents] = useState<Student[]>(MOCK_STUDENTS);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.admissionNo.includes(searchTerm)
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-xl font-bold text-gray-800">Student List</h2>
        
        <div className="flex gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
            <Plus size={18} />
            <span className="hidden sm:inline">Add Student</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-semibold">
            <tr>
              <th className="px-6 py-4">Admission No</th>
              <th className="px-6 py-4">Student Name</th>
              <th className="px-6 py-4">Class</th>
              <th className="px-6 py-4">DOB</th>
              <th className="px-6 py-4">Gender</th>
              <th className="px-6 py-4">Mobile</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredStudents.map((student) => (
              <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{student.admissionNo}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{student.name}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{student.class} ({student.section})</td>
                <td className="px-6 py-4 text-sm text-gray-600">{student.dob}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{student.gender}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{student.guardianPhone}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    student.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {student.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button className="text-gray-400 hover:text-indigo-600 transition-colors"><Eye size={18} /></button>
                    <button className="text-gray-400 hover:text-amber-600 transition-colors"><Edit2 size={18} /></button>
                    <button className="text-gray-400 hover:text-red-600 transition-colors"><Trash2 size={18} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredStudents.length === 0 && (
            <div className="p-8 text-center text-gray-500">
                No students found matching your search.
            </div>
        )}
      </div>
    </div>
  );
};

export default StudentModule;
