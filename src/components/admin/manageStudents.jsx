import React from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import OverallStudents from './overAllStudents';
import StudentsByDate from './StudentsByDate';
import StudentsByRollNumber from './StudentsByRollNumber';

const ManageStudents = () => {
  return (
    <div>
      {/* <h2>Manage Students</h2> */}
      <Routes>
        <Route path="overall" element={<OverallStudents />} />
        <Route path="by-date" element={<StudentsByDate />} />
        <Route path="by-roll-number" element={<StudentsByRollNumber />} />
      </Routes>
      <Outlet />
    </div>
  );
};

export default ManageStudents;
